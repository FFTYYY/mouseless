import * as React from "react"

import {
    KeyEventHandlersProvider , 
} from "./handlers"

import {
    KeyEventProxyProvider , 
    KeyDownProxy,
    KeyUpProxy,
} from "./proxy"

export {
    KeyEventManager , 
}
export * from "./proxy"
export * from "./handlers"

type KeyEventManagerChildren = React.ReactNode | ((
    keydown_proxy: KeyDownProxy,
    keyup_proxy  : KeyUpProxy,
) => React.ReactNode)

function KeyEventManager({children}:{children: KeyEventManagerChildren}){    
    if(typeof children === "function"){
        return <KeyEventHandlersProvider>
            <KeyEventProxyProvider>{(keydown_proxy, keyup_proxy) => {
                return children(
                    keydown_proxy,
                    keyup_proxy,
                )
            }}</KeyEventProxyProvider>
        </KeyEventHandlersProvider>
    }
    return <KeyEventHandlersProvider>
        <KeyEventProxyProvider>
            {children}
        </KeyEventProxyProvider>
    </KeyEventHandlersProvider>
}

