import * as React from "react"

import {
    Box , 
    Paper , 
} from "@mui/material"

import { CurKey } from "./curkey"
import { 
    KeyEventManager 
} from "mouseless"
export { App }

function App(){
    console.log("App")
    return <KeyEventManager>{(keydown_proxy, keyup_proxy) => {
        return <Box 
            tabIndex = {0}
            sx={{
                position      : "absolute",
                width         : "100%",
                height        : "100%",
                backgroundColor: "background.default",
                outline: "none",

                display       : "flex",
                flexDirection : "column",
                alignItems    : "center",
                justifyContent: "center",
            }}
            onKeyDown   = {keydown_proxy}
            onKeyUp     = {keyup_proxy}
        >
            <CurKey />
        </Box>
    }}</KeyEventManager>
}