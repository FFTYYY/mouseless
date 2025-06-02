import * as React from "react"
import {
    createStore,
    StoreApi , 
} from "zustand/vanilla"
import {
    useStore , 
} from "zustand"
import {useShallow} from "zustand/react/shallow"

export {
    KeyEventHandlersProvider , 
    useKeyEventHandlers , 
} 

export type {
    KeyEventHandlers , 
}

interface KeyEventHandlers{
    keydown_handlers:(()=>void)[],
    keyup_handlers  :(()=>void)[],
    
    add_keydown_handler:(handler:()=>void)=>void,
    add_keyup_handler  :(handler:()=>void)=>void,

    del_keydown_handler:(handler:()=>void)=>void,
    del_keyup_handler  :(handler:()=>void)=>void,
}

const KeyEventHandlers_ScopedStore = React.createContext<
    StoreApi<KeyEventHandlers> | null
>(null)

function create_keyeventhandlers_store(): StoreApi<KeyEventHandlers>{
    return createStore<KeyEventHandlers>(set=>({
        keydown_handlers:[] as (()=>void)[],
        keyup_handlers  :[] as (()=>void)[],
        add_keydown_handler:(handler:()=>void)=>{
            set(state=>(state.keydown_handlers.includes(handler) 
                ? {} 
                : {keydown_handlers:[...state.keydown_handlers,handler],}
            ))
        },
        add_keyup_handler:(handler:()=>void)=>{
            set(state=>(state.keyup_handlers.includes(handler) 
                ? {} 
                : {keyup_handlers:[...state.keyup_handlers,handler],}
            ))
        },
        del_keydown_handler:(handler:()=>void)=>{
            set(state=>({
                keydown_handlers:state.keydown_handlers.filter(h=>h!==handler),
            }))
        },
        del_keyup_handler:(handler:()=>void)=>{
            set(state=>({
                keyup_handlers:state.keyup_handlers.filter(h=>h!==handler),
            }))
        }
    }))
}

function useKeyEventHandlers(selector: (store: KeyEventHandlers) => any): any{
    const store = React.useContext(KeyEventHandlers_ScopedStore)
    if(!store){
        throw new Error("Not in context of KeyEventHandlersProvider.")
    }
    return useStore(store,useShallow(selector))
}

function KeyEventHandlersProvider({children}:{children: React.ReactNode}){

    const store = React.useRef(create_keyeventhandlers_store())
    return <KeyEventHandlers_ScopedStore.Provider value={store.current}>
            {children}
    </KeyEventHandlers_ScopedStore.Provider>
}