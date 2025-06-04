import * as React from "react"

import {
    Box , 
    Paper , 
} from "@mui/material"

import { 
    KeyEventManager ,
    KeyNames , 
} from "@ftyyy/mouseless"

import { ExampleHolding } from "./example_holding"
import { ExampleNavi , myspace as navi_space} from "./example_navi"
import { ExampleMove } from "./example_move"
export { App }

function App(){
    return <KeyEventManager
        spaces = {[navi_space]}
        preventing_default = {[
            [KeyNames.ctrl, KeyNames.s],
            [KeyNames.alt, KeyNames.w],
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
                outline       : "none",
                boxSizing     : "border-box",
                padding       : "2rem",
                backgroundColor: "rgb(252, 249, 249)",
                filter        : "drop-shadow(0 0 10px rgba(0, 0, 0, 0.1))",
                
                display       : "flex",
                flexDirection : "row",
                alignItems    : "center",
                justifyContent: "flex-start",
                alignContent  : "flex-start",
                flexWrap      : "wrap",
                gap           : "2rem",
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