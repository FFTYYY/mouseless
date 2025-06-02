import * as React from "react"

import {
    Box , 
    Paper , 
} from "@mui/material"

import { 
    KeyEventManager ,
    KeyNames , 
} from "mouseless"

import { CurKey } from "./curkey"
import { ExampleHolding } from "./example_holding"

export { App }

function App(){
    console.log("App")
    return <KeyEventManager
        preventing_default = {[
            [KeyNames.ctrl, KeyNames.a],
        ]}
    >{(keydown_proxy, keyup_proxy) => {
        return <Box 
            tabIndex = {0}
            sx={{
                position      : "absolute",
                width         : "100%",
                height        : "100%",
                backgroundColor: "background.default",
                outline: "none",

                display       : "flex",
                flexDirection : "row",
                alignItems    : "center",
                justifyContent: "flex-start",
                alignContent  : "flex-start",
                flexWrap      : "wrap",
            }}
            onKeyDown   = {keydown_proxy}
            onKeyUp     = {keyup_proxy}
        >
            <ExampleHolding />
        </Box>
        
    }}</KeyEventManager>
}