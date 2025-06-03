import * as React from "react"

import { 
    InnerKeyEventManager ,
    KeyEventManagerChildren , 
    KeyUpDownProxyProvider , 
    UpDownHandlersProvider , 
} from "./manager"
import {
    SpaceNavigator,
    SpaceDefinition,
} from "./navigator"

import {
    KeyName,
} from "./base"

export * from "./manager"
export * from "./base"
export * from "./navigator"

export {
    KeyEventManager , 
}

function KeyEventManager({
    children , 
    preventing_default = [] ,
    spaces = [],
}:{
    children          ?: KeyEventManagerChildren
    preventing_default?: KeyName[][]
    spaces            ?: SpaceDefinition[]
}){    
    return <UpDownHandlersProvider>
        <KeyUpDownProxyProvider>
            <InnerKeyEventManager
                preventing_default = {preventing_default}
            >
                <SpaceNavigator
                    spaces = {spaces}
                >
                    {children}
                </SpaceNavigator>
            </InnerKeyEventManager>
        </KeyUpDownProxyProvider>
    </UpDownHandlersProvider>
}

