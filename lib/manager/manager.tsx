/**
 * keyevents是高层的按键事件管理。
 * 每一个按键事件管理描述为：holding + pressing，表示按住某些键的时候按下某个键。
 */

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
    UpDownHandlersProvider , 
    useUpDownHandlers , 
} from "./downup_handler"

import {
    KeyDownProxy,
    KeyUpProxy,
    useKeyDownUpProxy,
} from "./downup_proxy"

export {
    InnerKeyEventManager , 
    useKeyEvents,
    useKeyHoldingState,
    useKeyEventsHandlerRegister , 
}
export type {
    KeyEventManagerChildren ,
    KeyEventHandlerRegisterFunc , 
    KeyEventHandler , 
    KeyEvent , 
}

type KeyEvent = React.KeyboardEvent<HTMLDivElement>

interface KeyEventHandlerIdx{
    holding : KeyName[] , 
    pressing: KeyName,
    reverse : boolean,
}

type KeyEventHandler = (e: KeyEvent)=>void

/**
 * 用来注册一个按键事件的函数。
 * 如果`pressing=""`，那么这个事件会在第一次按住`holding`的时候触发。
 * 如果`pressing`不为空，那么这个事件会在按住`holding`的同时按下`pressing`的时候触发。
 * @param holding  按住哪些键。
 * @param pressing 按下哪个键。
 * @param reverse 如果为`true`，那么就在抬起时触发，而非进入时触发。
 * @param func 触发的事件。
 */
type KeyEventHandlerRegisterFunc = (
    holding     : KeyName[] , 
    pressing    : KeyName ,
    reverse     : boolean ,
    func        : KeyEventHandler ,
) =>void  

function encode_idx(holding: KeyName[] , pressing: KeyName, reverse: boolean): string{
    const sorted_holding = produce(holding, (h: KeyName[])=>{
        return h.sort()
    })
    return JSON.stringify({
        holding : sorted_holding,
        pressing: pressing,
        reverse : reverse,
    })

}
function decode_idx(key: string): KeyEventHandlerIdx{
    try{
        const decoded = JSON.parse(key)
        return {
            holding : decoded.holding,
            pressing: decoded.pressing,
            reverse : decoded.reverse,
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
        [idx: string]: KeyEventHandler[] , 
    }
    
    register_handler  : KeyEventHandlerRegisterFunc
    unregister_handler: KeyEventHandlerRegisterFunc
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

function useKeyEventsHandlerRegister(): [
    KeyEventHandlerRegisterFunc,
    KeyEventHandlerRegisterFunc,
]{
    return useKeyEvents(store=>{
        return [
            store.register_handler,
            store.unregister_handler,
        ]
    })
}

function useKeyHoldingState(keys: KeyName[]): boolean{
    return useKeyEvents(state=>{
        return keys.every(k=>state.holding_keys.includes(k))
    })
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
            holding: KeyName[], pressing: KeyName, reverse: boolean, func: KeyEventHandler
        ) => {set(state=>{
            const idx = encode_idx(holding, pressing, reverse)
            const handlers = produce(state.handlers, hdlrs=>{
                if(hdlrs[idx] && !hdlrs[idx].includes(func)){
                    hdlrs[idx].push(func)
                } 
                if(!hdlrs[idx]){
                    hdlrs[idx] = [func]
                }
                return hdlrs
            })
            return {handlers: handlers}
        })} , 

        unregister_handler: (
            holding: KeyName[], pressing: KeyName, reverse: boolean, func: KeyEventHandler
        ) => {set(state=>{
            const idx = encode_idx(holding, pressing, reverse)
            const handlers = produce(state.handlers, hdlrs=>{
                if(hdlrs[idx]){
                    hdlrs[idx] = hdlrs[idx].filter(h=>h !== func)
                }
                return hdlrs
            })
            return {handlers: handlers}
        })},

    }))
}

type KeyEventManagerChildren = React.ReactNode | ((
    keydown_proxy: KeyDownProxy,
    keyup_proxy  : KeyUpProxy,
) => React.ReactNode) 

const InnerKeyEventManager = React.memo(({
    children,
    preventing_default , 
}:{
    children    : KeyEventManagerChildren,
    preventing_default: KeyName[][]
})=>{
    const [keydown_proxy, keyup_proxy] = useKeyDownUpProxy()
    const store_ref = React.useRef<StoreApi<KeyEvents>>(create_keyevents())
    
    // 使用 useCallback 缓存事件注册函数
    const [
        add_keydown_handler, 
        del_keydown_handler,
        add_keyup_handler,
        del_keyup_handler,
    ] = useUpDownHandlers(
        React.useCallback(store=>[
            store.add_keydown_handler,
            store.del_keydown_handler,
            store.add_keyup_handler,
            store.del_keyup_handler,
        ], [])
    )
    
    // 使用 useCallback 缓存事件处理函数
    const on_keydown = React.useCallback((e: KeyEvent) => {
        const now_key: KeyName = e.key as KeyName
        const state = store_ref.current?.getState()
        if(!state) return

        const holding_keys   = state.holding_keys
        const event_handlers = state.handlers
        const add_holding_key = state.add_holding_key

        // 如果要阻止的按键全部被按下，则阻止默认行为
        if(preventing_default.some(arr=>{
            return arr.every(k=>holding_keys.includes(k) || now_key == k)
        })){
            e.preventDefault()
        }
        
        // 如果这个键已经按下，则什么都不触发
        if(holding_keys.includes(now_key)){
            return
        }

        // 找到对应的handler并触发（第一类：按住holding的时候按下pressing）
        const idx = encode_idx(holding_keys, now_key, false)
        event_handlers[idx]?.forEach(h=>h(e)) 

        // 找到对应的handler并触发（第二类：所有holding按键都被按下）
        const idx_2 = encode_idx([...holding_keys, now_key], "", false)
        event_handlers[idx_2]?.forEach(h=>h(e)) 

        // 更新holding_keys
        add_holding_key(now_key)
    }, [preventing_default])

    const on_keyup = React.useCallback((e: KeyEvent) => {
        const now_key: KeyName = e.key as KeyName
        const state = store_ref.current?.getState()
        if(!state) return

        const holding_keys   = state.holding_keys
        const event_handlers = state.handlers
        const del_holding_key = state.del_holding_key

        if(!holding_keys.includes(now_key)){
            console.warn("抬起的键未曾被按下。")
            return
        }

        // 找到对应的reverse handler并触发（第一类：按住holding的时候抬起pressing）
        const idx = encode_idx(holding_keys, now_key, true)
        event_handlers[idx]?.forEach(h=>h(e)) 

        // 找到对应的reverse handler并触发（第二类：破坏holding按键组合）
        const idx_2 = encode_idx(holding_keys, "", true)
        event_handlers[idx_2]?.forEach(h=>h(e)) 

        // 更新holding_keys
        del_holding_key(now_key)
    }, [])


    // 使用 useLayoutEffect 来处理事件绑定，避免闪烁
    React.useLayoutEffect(() => {
        add_keydown_handler(on_keydown)
        add_keyup_handler(on_keyup)
        return () => {
            del_keydown_handler(on_keydown)
            del_keyup_handler(on_keyup)
        }
    }, [
        on_keydown, 
        on_keyup, 
        add_keydown_handler, 
        add_keyup_handler, 
        del_keydown_handler, 
        del_keyup_handler,
    ])

    // 使用 useMemo 缓存 Context 值
    const context_value = React.useMemo(() => store_ref.current, [])

    // 使用 useMemo 缓存子组件
    const children_element = React.useMemo(() => {
        if(typeof children === "function"){
            return children(keydown_proxy, keyup_proxy)
        }
        return children
    }, [children, keydown_proxy, keyup_proxy])

    return <KeyEvents_ScopedStore value={context_value}>
        {children_element}
    </KeyEvents_ScopedStore>
})


