/**
 * This module is used to provide a proxy for the keydown and keyup events.
 */

import * as React from "react"
import {
    useKeyEventHandlers,
} from "./downup_handler"


export {
    KeyEventProxyProvider , 
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

type KeyEventProxyProviderChildren = React.ReactNode | ((
    keydown_proxy: KeyDownProxy,
    keyup_proxy  : KeyUpProxy,
) => React.ReactNode)

function KeyEventProxyProvider({children}:{children: KeyEventProxyProviderChildren}){

    const [keydown_handlers,keyup_handlers] = useKeyEventHandlers(store => [
        store.keydown_handlers,
        store.keyup_handlers,
    ])

    const keydown_proxy = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        keydown_handlers.forEach((handler: KeyDownProxy) => handler(event))
    }, [keydown_handlers])

    const keyup_proxy = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        keyup_handlers.forEach((handler: KeyUpProxy) => handler(event))
    }, [keyup_handlers])


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
}