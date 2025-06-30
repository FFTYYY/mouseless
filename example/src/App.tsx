import * as React from "react"

import {
    Box , 
    Paper , 
    Typography , 
} from "@mui/material"

import { 
    KeyEventManager ,
    KeyNames , 
    SpaceDefinition , 
} from "mouseless"

import { ExampleHolding } from "./example_holding"
import { ExampleNavi , myspace as navi_space} from "./example_navi"
import { ExampleMove } from "./example_move"
export { App }

const disturb_space: SpaceDefinition = {
    name        : "disturb",
    nodes       : ["1", "2", "3", "4", "5", "6", "7", "8", "9",],
    onStart     : (last_node)=>(last_node ?? "1"),
    holding     : [KeyNames.alt, KeyNames.r],
    edges       : [],
}


function App(){
    return <KeyEventManager
        spaces = {[navi_space, disturb_space]}
        preventing_default = {[
            [KeyNames.ctrl, KeyNames.s],
            [KeyNames.alt, KeyNames.w],
            [KeyNames.alt, KeyNames.e],
            [KeyNames.alt, KeyNames.r],
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
                paddingX      : "2rem",
                paddingY      : "2rem",
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

            <Typography sx={{
                position: "absolute",
                top: "21rem",
                left: "24.5rem",
            }}>(Use arrow keys to navigate & move)</Typography>

        </Box>
    }}</KeyEventManager>
}