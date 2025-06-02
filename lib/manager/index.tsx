import { 
    InnerKeyEventManager ,
    KeyEventManagerChildren , 
} from "./manager"
import {
    KeyName,
} from "../base"
import {
    KeyEventProxyProvider , 
} from "./downup_proxy"
import {
    KeyEventHandlersProvider , 
} from "./downup_handler"

export * from "./manager"
export * from "./downup_proxy"
export * from "./downup_handler"
export {
    KeyEventManager , 
}

function KeyEventManager({
    children , 
    preventing_default = []
}:{
    children: KeyEventManagerChildren
    preventing_default?: KeyName[][]
}){    
    return <KeyEventHandlersProvider>
        <KeyEventProxyProvider>{(keydown_proxy, keyup_proxy) => {
            return <InnerKeyEventManager
                keydown_proxy= {keydown_proxy}
                keyup_proxy  = {keyup_proxy}
                children     = {children}
                preventing_default = {preventing_default}
            />
        }}</KeyEventProxyProvider>
    </KeyEventHandlersProvider>
}

