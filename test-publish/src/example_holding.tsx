import * as React from "react"
import {
    Box,
    Typography,
} from "@mui/material"
import { motion } from "framer-motion"

import {
    useKeyHoldingState,
    KeyNames , 
} from "@ftyyy/mouseless"

import {
    CurKey
} from "./curkey"

import {
    SpinningCat
} from "./spinning_cat"

export {
    ExampleHolding,
}


function ExampleHolding(){
    const holding = useKeyHoldingState([KeyNames.ctrl, KeyNames.s])

    return <Box sx={{  
        width   : "18rem",
        height  : "15rem",
        padding : "1rem",
        border  : "1px solid #ccc",
        position: "relative",
    }}>
        <motion.span
            animate={{
                scale: holding ? 0.8 : 1,
                x: holding ? -20 : 0,
                y: holding ? -105 : 0,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
            }}
            style = {{
                backgroundColor: "rgb(252, 249, 249)",
                width: "auto",
                padding: "0.5rem",
                position: "absolute",
                left: "1rem" , 
                top: "30%",
            }}
        >
            <Typography variant="h6">{holding 
                ? "Cat is cute!" 
                : "Hold ctrl+s to watch cat dance"
            }</Typography>
        </motion.span>

        {holding && <Box sx={{
            position: "absolute",
            top: "15%" , 
            left: "30%",
            width: "100%",
        }}><SpinningCat /></Box>}

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

