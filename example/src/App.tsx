import * as React from "react"

import {
    Box , 
    Paper , 
} from "@mui/material"

import { 
    KeyEventManager ,
    KeyNames , 
} from "mouseless"

import { ExampleHolding } from "./example_holding"
import { ExampleNavi , space_definition} from "./example_navi"
import { ExampleMove } from "./example_move"
export { App }

function App(){
    console.log("App")
    return <KeyEventManager
        spaces = {[space_definition]}
        preventing_default = {[
            [KeyNames.ctrl, KeyNames.a],
            [KeyNames.alt, KeyNames.w],
            [KeyNames.alt, KeyNames.r],
        ]}
    >{(keydown_proxy, keyup_proxy) => {
        return <Box 
            tabIndex = {0}
            sx={{
                position      : "absolute",
                top           : 0,
                left          : 0,
                width         : "auto",
                height        : "auto",
                backgroundColor: "background.default",
                outline: "none",

                display       : "flex",
                flexDirection : "row",
                alignItems    : "center",
                justifyContent: "flex-start",
                alignContent  : "flex-start",
                flexWrap      : "wrap",
                gap: "1rem",
                padding       : "1rem",
            }}
            onKeyDown   = {keydown_proxy}
            onKeyUp     = {keyup_proxy}
        >
            <ExampleHolding />
            <ExampleNavi />
            <ExampleMove />
        </Box>
        
    }}</KeyEventManager>
}