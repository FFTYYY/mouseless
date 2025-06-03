import * as React from "react"
import {
    Box,
    Typography,
} from "@mui/material"

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

    React.useEffect(()=>{
        const [box, mover] = [box_ref.current, mover_ref.current]
        if(!box || !mover) return

        const box_rect   = box.getBoundingClientRect()
        const mover_rect = mover.getBoundingClientRect()

        function move(){
            let dx = (holding_right ? 2 : 0) - (holding_left ? 2 : 0)
            let dy = (holding_down  ? 2 : 0) - (holding_up   ? 2 : 0)

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
        width   : "15rem",
        height  : "15rem",
        padding : "1rem",
        border  : "1px solid #ccc",
    }}>
        <Box ref={box_ref} sx={{
            position: "absolute",
            top: "1%",
            left: "1%",
            width: "98%",
            height: "calc(95% - 2rem)",

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
                    backgroundColor: "rgba(185, 103, 103, 0.5)",
                }}>
                </Box>
            )}
            <Typography>按下alt+e开始吧！</Typography>
        </Box>
        <Box sx={{
            position: "absolute",
            bottom: "0.5rem",
            height: "2rem" , 
        }}>
            <CurKey />
        </Box>
    </Box>

}

