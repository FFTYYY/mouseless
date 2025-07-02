import * as React from "react"
import {
    Box,
    Typography,
} from "@mui/material"
import { motion } from "framer-motion"

import {
    useKeyHoldingState,
    KeyNames , 
} from "mouseless"

import {
    CurKey
} from "./curkey"

import {
    SpinningCat
} from "./spinning_cat"

export {
    ExampleEditor,
}


function ExampleEditor(){

    return <Box sx={{  
        width   : "18rem",
        height  : "15rem",
        padding : "1rem",
        border  : "1px solid #ccc",
        position: "relative",
    }}>

        <Box 
            contentEditable
            suppressContentEditableWarning
            sx={{
                position: "absolute",
                top: "2rem" , 
                left: "2rem",
                width: "calc(100% - 4rem)",
                maxHeight: "8rem",
                overflowY: "auto",
                border: "none",
                outline: "none",
                backgroundColor: "rgba(237, 230, 224, 0.9)",
                padding: "0.5rem",
            }}
        >type anything here!</Box>

        <Box sx={{
            position: "absolute",
            bottom: "0.5rem",
            height: "5rem" , 
            width: "calc(100% - 2rem)",
            boxSizing: "border-box",
            borderTop: "1px solid #ccc",
            paddingTop: "0.5rem",
        }}>
            <CurKey />
        </Box>
    </Box>

}

