/**
 * This module is used to provide a proxy for the keydown and keyup events.
 */

import * as React from "react"
import {
    useUpDownHandlers,
} from "./downup_handler"


export {
    KeyUpDownProxyProvider , 
    useKeyDownUpProxy , 
} 

export type {
    KeyDownProxy , 
    KeyUpProxy , 
}

type KeyDownProxy = (event: React.KeyboardEvent<HTMLDivElement>) => void
type KeyUpProxy   = (event: React.KeyboardEvent<HTMLDivElement>) => void

const KeyDownUpProxyContext = React.createContext<{
    keydown_proxy: KeyDownProxy | null,
    keyup_proxy  : KeyUpProxy   | null,
}>({
    keydown_proxy: null,
    keyup_proxy: null,
})

function useKeyDownUpProxy(){
    const {
        keydown_proxy,
        keyup_proxy,
    } = React.useContext(KeyDownUpProxyContext)

    if(!keydown_proxy || !keyup_proxy){
        throw new Error("Not in context of KeyEventProxyProvider.")
    }
    return [keydown_proxy,keyup_proxy]
}   

type KeyUpDownProxyProviderChildren = React.ReactNode | ((
    keydown_proxy: KeyDownProxy,
    keyup_proxy  : KeyUpProxy,
) => React.ReactNode)

const KeyUpDownProxyProvider = React.memo((
    {children}:{children: KeyUpDownProxyProviderChildren}
)=>{

    const [keydown_handlers,keyup_handlers] = useUpDownHandlers(store => [
        store.keydown_handlers,
        store.keyup_handlers,
    ])
    const keydown_handlers_ref = React.useRef<KeyDownProxy[]>([])
    const keyup_handlers_ref   = React.useRef<KeyUpProxy[]>([])

    React.useEffect(()=>{
        keydown_handlers_ref.current = keydown_handlers
        keyup_handlers_ref.current   = keyup_handlers
    },[keydown_handlers,keyup_handlers])

    const keydown_proxy = (event: React.KeyboardEvent<HTMLDivElement>) => {
        keydown_handlers_ref.current.forEach((handler: KeyDownProxy) => handler(event))
    }

    const keyup_proxy = (event: React.KeyboardEvent<HTMLDivElement>) => {
        keyup_handlers_ref.current.forEach((handler: KeyUpProxy) => handler(event))
    }


    if(typeof children === "function"){
        return <KeyDownUpProxyContext.Provider value={{
            keydown_proxy: keydown_proxy,
            keyup_proxy  : keyup_proxy,
        }}>{children(keydown_proxy,keyup_proxy)}</KeyDownUpProxyContext.Provider>
    }
    return <KeyDownUpProxyContext.Provider value={{
        keydown_proxy: keydown_proxy,
        keyup_proxy  : keyup_proxy,
    }}>{children}</KeyDownUpProxyContext.Provider>
})