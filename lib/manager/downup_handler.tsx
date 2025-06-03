/**
 * downup是底层的keydown和keyup事件的逻辑。
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

export {
    UpDownHandlersProvider , 
    useUpDownHandlers , 
} 

export type {
    UpDownHandlers , 
}

interface UpDownHandlers{
    keydown_handlers:(()=>void)[],
    keyup_handlers  :(()=>void)[],
    
    add_keydown_handler:(handler:()=>void)=>void,
    add_keyup_handler  :(handler:()=>void)=>void,

    del_keydown_handler:(handler:()=>void)=>void,
    del_keyup_handler  :(handler:()=>void)=>void,
}

const UpDownHandlers_ScopedStore = React.createContext<
    StoreApi<UpDownHandlers> | null
>(null)

function create_updownhandlers_store(): StoreApi<UpDownHandlers>{
    return createStore<UpDownHandlers>(set=>({
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

function useUpDownHandlers(selector: (store: UpDownHandlers) => any): any{
    const store = React.useContext(UpDownHandlers_ScopedStore)
    if(!store){
        throw new Error("Not in context of UpDownHandlersProvider.")
    }
    return useStore(store,useShallow(selector))
}

function UpDownHandlersProvider({children}:{children: React.ReactNode}){

    const store = React.useRef(create_updownhandlers_store())
    return <UpDownHandlers_ScopedStore.Provider value={store.current}>
            {children}
    </UpDownHandlers_ScopedStore.Provider>  
}