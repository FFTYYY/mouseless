import * as React from "react"
import {
    Box,
    Typography,
} from "@mui/material"

import {
    useKeyHoldingState,
} from "mouseless"

import {
    CurKey
} from "./curkey"

export {
    ExampleHolding,
}


function ExampleHolding(){
    const holding = useKeyHoldingState(["Control", "a"])

    return             <Box sx={{  
        display : "flex",
        flexDirection: "column",
        gap     : "1rem",
        width   : "20rem",
        height  : "5rem",
        padding : "1rem",
        border  : "1px solid #ccc",
    }}>
        <Typography>
            {holding ? "You Are Holding ctrl+a" : "You Are Not Holding ctrl+a"}
        </Typography>
        <Box sx={{
            height: "2rem"
        }}>
            <CurKey />
        </Box>
    </Box>

}

