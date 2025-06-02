import * as React from "react"
import {
    createStore,
    StoreApi , 
} from "zustand/vanilla"
import {
    useStore , 
} from "zustand"
import {useShallow} from "zustand/react/shallow"
import {produce} from "immer"

import {
    KeyNames,
    KeyName,
} from "../base"

import {
    KeyEventHandlersProvider , 
    useKeyEventHandlers , 
} from "./downup_handler"

import {
    KeyEventProxyProvider , 
    KeyDownProxy,
    KeyUpProxy,
} from "./downup_proxy"

export {
    InnerKeyEventManager , 
    useKeyEvents,
    useKeyHoldingState,
}
export type {
    KeyEventManagerChildren , 
}

type KeyEvent = React.KeyboardEvent<HTMLDivElement>

interface KeyEventHandlerKey{
    holding : KeyName[] , 
    pressing: KeyName,
}

function encode_idx(holding: KeyName[] , pressing: KeyName): string{
    const sorted_holding = produce(holding, (h: KeyName[])=>{
        return h.sort()
    })
    return JSON.stringify({
        holding : sorted_holding,
        pressing: pressing,
    })

}
function decode_idx(key: string): KeyEventHandlerKey{
    try{
        const decoded = JSON.parse(key)
        return {
            holding : decoded.holding,
            pressing: decoded.pressing,
        }
    }catch(e){
        throw new Error("Invalid key: " + key)
    }
}

interface KeyEvents{
    holding_keys: KeyName[] , 
    add_holding_key(key: KeyName): void
    del_holding_key(key: KeyName): void

    handlers: {
        [idx: string]: ((e?: KeyEvent)=>void)[] , 
    }
    
    register_handler(
        holding     : KeyName[] , 
        pressing    : KeyName ,
        func        : (e?: KeyEvent)=>void ,
    ): void 

    unregister_handler(
        holding     : KeyName[] , 
        pressing    : KeyName ,
        func        : (e?: KeyEvent)=>void ,
    ): void 
}

const KeyEvents_ScopedStore = React.createContext<
    StoreApi<KeyEvents> | null
>(null)

function useKeyEvents(selector: (store: KeyEvents) => any): any{
    const store = React.useContext(KeyEvents_ScopedStore)
    if(!store){
        throw new Error("KeyEvents_ScopedStore not found")
    }
    return useStore(store, useShallow(selector))
}

function useKeyHoldingState(keys: KeyName[]): boolean{
    const store = React.useContext(KeyEvents_ScopedStore)
    if(!store){
        throw new Error("KeyEvents_ScopedStore not found")
    }
    return useStore(store, useShallow(state=>{
        return keys.every(k=>state.holding_keys.includes(k))
    }))
}

function create_keyevents(): StoreApi<KeyEvents>{
    return createStore<KeyEvents>(set=>({
        holding_keys: [] , 
        add_holding_key: (key: KeyName) => {set(state=>{
            if(state.holding_keys.includes(key)){
                return {}
            }
            return {holding_keys: [...state.holding_keys, key]}
        })},
        del_holding_key: (key: KeyName) => {set(state=>{
            if(!state.holding_keys.includes(key)){
                return {}
            }
            return {holding_keys: state.holding_keys.filter(k=>k !== key)}
        })},

        handlers: {} as {[idx: string]: (()=>void)[]},
        register_handler: (
            holding: KeyName[], pressing: KeyName, func: (e?: KeyEvent)=>void
        ) => {set(state=>{
            const idx = encode_idx(holding, pressing)
            const handlers = produce(state.handlers, hdlrs=>{
                if(hdlrs[idx] && !hdlrs[idx].includes(func)){
                    hdlrs[idx].push(func)
                } 
                if(!hdlrs[idx]){
                    hdlrs[idx] = [func]
                }
                return hdlrs
            })
            return {handlers}
        })} , 

        unregister_handler: (
            holding: KeyName[], pressing: KeyName, func: (e?: KeyEvent)=>void
        ) => {set(state=>{
            const idx = encode_idx(holding, pressing)
            const handlers = produce(state.handlers, hdlrs=>{
                if(hdlrs[idx]){
                    hdlrs[idx] = hdlrs[idx].filter(h=>h !== func)
                }
                return hdlrs
            })
            return {handlers}
        })},

    }))
}

type KeyEventManagerChildren = React.ReactNode | ((
    keydown_proxy: KeyDownProxy,
    keyup_proxy  : KeyUpProxy,
) => React.ReactNode) 

function InnerKeyEventManager({
    keydown_proxy, 
    keyup_proxy, 
    children,
    preventing_default , 
}:{
    keydown_proxy: KeyDownProxy, 
    keyup_proxy  : KeyUpProxy, 
    children    : KeyEventManagerChildren,
    preventing_default: KeyName[][]
}){
    const preventing_idx = React.useMemo(()=>{
        return preventing_default.map(arr=>encode_idx(arr, ""))
    }, [preventing_default])

    const [
        add_keydown_handler, 
        del_keydown_handler,
        add_keyup_handler,
        del_keyup_handler,
    ] = useKeyEventHandlers(
        store=>[
            store.add_keydown_handler,
            store.del_keydown_handler,
            store.add_keyup_handler,
            store.del_keyup_handler,
        ]
    )
    const store_ref = React.useRef<StoreApi<KeyEvents>>(create_keyevents())

    // holding keys要放到外面来，这样才能触发组件自动更新
    const holding_keys = useStore(
        store_ref.current, 
        useShallow(state => state.holding_keys)
    )

    React.useEffect(() => {
        const event_store = store_ref.current?.getState()
        if(!event_store){
            return
        }

        // 这里event_store不会触发组件自动更新，不过没关系
        const {
            add_holding_key,
            del_holding_key,
        } = event_store

        const on_keydown = (e: KeyEvent) => {
            const now_key: KeyName = e.key as KeyName

            // 决定要不要阻止默认行为
            // 这个判断必须在因为已经按下而触发的判断之前做出。
            const test_idx = encode_idx([...new Set([...holding_keys, now_key])], "")
            if(preventing_idx.includes(test_idx)){
                e.preventDefault()
            }
            
            // 如果已经按下，则什么都不触发
            if(holding_keys.includes(now_key)){
                return
            }

            // 找到对应的handler并触发
            const idx = encode_idx(holding_keys, now_key)
            event_store.handlers[idx]?.forEach(h=>h(e)) 


            // 更新holding_keys
            add_holding_key(now_key)
        }
        const on_keyup = (e: KeyEvent) => {
            const now_key: KeyName = e.key as KeyName
            if(!holding_keys.includes(now_key)){
                console.warn("抬起的键未曾被按下。")
                return
            }

            // 更新holding_keys
            del_holding_key(now_key)
        }

        add_keydown_handler(on_keydown)
        add_keyup_handler(on_keyup)
        return () => {
            del_keydown_handler(on_keydown)
            del_keyup_handler(on_keyup)
        }
    }, [
        add_keydown_handler, 
        add_keyup_handler, 
        del_keydown_handler, 
        del_keyup_handler,
        holding_keys,
        preventing_idx,
    ])


    if(typeof children === "function"){
        return <KeyEvents_ScopedStore value={store_ref.current}>{children(
            keydown_proxy,
            keyup_proxy,
        )}</KeyEvents_ScopedStore>
    }
    return <KeyEvents_ScopedStore value={store_ref.current}>{
        children
    }</KeyEvents_ScopedStore>
}


