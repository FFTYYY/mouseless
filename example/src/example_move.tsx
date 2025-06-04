import * as React from "react"
import {
    Box,
    Typography,
} from "@mui/material"

import {
    motion , 
    AnimatePresence,
} from "framer-motion"


import {
    useKeyHoldingState,
    KeyNames , 
    SpaceDefinition,
    Edge , 
    useSpaceNavigatorState ,
    NodeName,
} from "mouseless"

import {
    CurKey
} from "./curkey"

export {
    ExampleMove,
}


function ExampleMove(){
    const holding = useKeyHoldingState([KeyNames.alt, KeyNames.e])
    const holding_left  = useKeyHoldingState([KeyNames.alt, KeyNames.e, KeyNames.ArrowLeft])
    const holding_right = useKeyHoldingState([KeyNames.alt, KeyNames.e, KeyNames.ArrowRight])
    const holding_up    = useKeyHoldingState([KeyNames.alt, KeyNames.e, KeyNames.ArrowUp])
    const holding_down  = useKeyHoldingState([KeyNames.alt, KeyNames.e, KeyNames.ArrowDown])

    const box_ref   = React.useRef<HTMLDivElement>(null)
    const mover_ref = React.useRef<HTMLDivElement>(null)
    const [position, set_position] = React.useState<{x: number, y: number}>(
        {x: 0, y: 0}
    )

    const rot_x = (holding_right ? 1 : 0) - (holding_left ? 1 : 0)
    const rot_y = (holding_up  ? 1 : 0)   - (holding_down ? 1 : 0)
    const rotate = (Math.atan2(rot_x, rot_y) * (180 / Math.PI))  

    React.useEffect(()=>{
        const [box, mover] = [box_ref.current, mover_ref.current]
        if(!box || !mover) return

        const box_rect   = box.getBoundingClientRect()
        const mover_rect = mover.getBoundingClientRect()

        function move(){
            let dx = (holding_right ? 4 : 0) - (holding_left ? 4 : 0)
            let dy = (holding_down  ? 4 : 0) - (holding_up   ? 4 : 0)

            // 确保mover不会超出box的边界
            const new_x = Math.max(0, Math.min(
                position.x + dx, 
                box_rect.width - mover_rect.width
            ))
            const new_y = Math.max(0, Math.min(
                position.y + dy, 
                box_rect.height - mover_rect.height
            ))

            set_position({x: new_x, y: new_y})
        }

        const interval = setInterval(move, 10)
        return ()=>{
            clearInterval(interval)
        }
        
    }, [
        position , 
        holding_left, 
        holding_right,
        holding_up,
        holding_down,
    ])
    

    return <Box sx={{  
        position: "relative",
        width   : "18rem",
        height  : "15rem",
        padding : "1rem",
        border  : "1px solid #ccc",
    }}>
        <Box ref={box_ref} sx={{
            position: "absolute",
            top: "calc(1% + 2rem)",
            left: "calc(1% + 1rem)",
            width: "calc(98% - 2rem)",
            height: "calc(95% - 6rem)",

            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        }}>        
            {holding && (
                <Box ref={mover_ref} sx={{
                    position: "absolute",
                    top: position.y,
                    left: position.x,
                    width: "1rem",
                    height: "1rem",
                    transform: `rotate(${rotate}deg) scale(2)`,
                    transformOrigin: "center center",
                    transition: "transform 0.3s ease-in-out",
                }}><Typography sx={{
                    transform: `rotate(-45deg) translate(-2px, 0)`,
                }}>✈️</Typography></Box>
            )}
        </Box>
        
        <motion.span
            animate={{
                scale: holding ? 0.8 : 1,
                x: holding ? -60 : 0,
                y: holding ? -100 : 0,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
            }}
            key={"words"}
            style={{
                position: "absolute",
                top: "30%",
                left: "3.5rem" , 
                backgroundColor: "rgb(252, 249, 249)",
                width: "auto",
                padding: "0 0.5rem",
            }}
        >
            <Typography variant="h6">press alt+e to start!</Typography>
        </motion.span>

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

