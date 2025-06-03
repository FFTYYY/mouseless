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
import { ExampleNavi , myspace as navi_space} from "./example_navi"
import { ExampleMove } from "./example_move"
export { App }

function App(){
    return <KeyEventManager
        spaces = {[navi_space]}
        preventing_default = {[
            [KeyNames.ctrl, KeyNames.a],
            [KeyNames.alt, KeyNames.w],
            [KeyNames.alt, KeyNames.r],
            [KeyNames.alt, KeyNames.e],
        ]}
    >{(keydown_proxy, keyup_proxy) => {
        return <Box 
            tabIndex = {0}
            sx={{
                position      : "absolute",
                top           : 0,
                left          : 0,
                width         : "100%",
                height        : "100%",
                backgroundColor: "background.default",
                outline: "none",
                boxSizing     : "border-box",
                padding       : "1rem",

                display       : "flex",
                flexDirection : "row",
                alignItems    : "center",
                justifyContent: "flex-start",
                alignContent  : "flex-start",
                flexWrap      : "wrap",
                gap: "1rem",
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