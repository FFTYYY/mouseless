import * as React from "react"
import {
    Box,
    Typography,
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"

import {
    useKeyHoldingState,
    KeyNames , 
    SpaceDefinition,
    Edge , 
    useSpaceNavigatorState ,
    NodeName,
    useSpaceNavigatorOnMoveRegister , 
    SpaceName ,
    useKeyEventsHandlerRegister , 
} from "mouseless"

import {
    CurKey
} from "./curkey"

export {
    ExampleNavi,
    myspace , 
}

const name2emoji = (name: string) => {
    return [
        "🎮", "🎵", "🎨", "🚀", "⭐", "🌟", "🎯", "🔥", "💎",
    ][parseInt(name)-1]
}

const myspace: SpaceDefinition = {
    name        : "example",
    nodes       : ["1", "2", "3", "4", "5", "6", "7", "8", "9",],
    onStart     : (last_node)=>(last_node ?? "1"),
    holding     : [KeyNames.alt, KeyNames.w],
    edges       : (()=>{
        const A = [ ["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"] ]
        const di = [0, 0, 1,-1]
        const dj = [1,-1,0,0]
        const trigger = [
            KeyNames.ArrowRight, 
            KeyNames.ArrowLeft, 
            KeyNames.ArrowDown, 
            KeyNames.ArrowUp
        ]
        let edges = new Array<Edge>()

        for(let k = 0; k < 4; k++){edges.push({
            pressing  : trigger[k],
            onMove    : (from?: NodeName)=>{
                for(let i = 0; i < A.length; i++){
                    for(let j = 0; j < A[i].length; j++){
                        
                        const ni = (i + di[k] + 3) % 3
                        const nj = (j + dj[k] + 3) % 3
                        if(from == A[i][j]){
                            return A[ni][nj]
                        }
                    }
                }
                return "_no_action"
            },
        })}
        return edges
    })(),
}

function ExampleNavi(){
    const holding = useKeyHoldingState([KeyNames.alt, KeyNames.w])
    
    const [space, node] = useSpaceNavigatorState()
    const [addOnMoveHandler, delOnMoveHandler] = useSpaceNavigatorOnMoveRegister()
    const [addOnKeyEventHandler, delOnKeyEventHandler] = useKeyEventsHandlerRegister()
    const [clicked_node, set_clicked_node] = React.useState<NodeName | null>(null)

    const make_chosen = (cur_node: NodeName) => {
        if(space == myspace.name && node == cur_node){
            return {
                sx:{
                    transform: "scale(1.2)",
                    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)",
                    transition: "all 0.05s ease-in-out",
                }
            }
        }
        return {sx:{}}
    }

    const [words, set_words] = React.useState<string>("press alt+w to open the panel!")

    React.useEffect(()=>{
        const handler = (
            start_space ?: SpaceName, 
            start_node  ?: NodeName, 
            end_space   ?: SpaceName, 
            end_node    ?: NodeName , 
        )=>{
            if((start_space != myspace.name) && (end_space == myspace.name)){
                set_words("last operation: open panel")
            }
            if(start_space == end_space){
                let move_f = name2emoji(start_node as string) 
                    + " → " 
                    + name2emoji(end_node as string)
                set_words(`last operation: ${move_f}`)
            }
            if(start_space == myspace.name && end_space != myspace.name){
                set_words("press alt+w to open the panel!")
            }
        }
        addOnMoveHandler(handler)
        return ()=>{
            delOnMoveHandler(handler)
        }
    }, [addOnMoveHandler, delOnMoveHandler])

    React.useEffect(()=>{
        const handler = ()=>{
            if(space == myspace.name && node){
                set_words(`last operation: click ${name2emoji(node as string)}`)
                set_clicked_node(node)
                setTimeout(() => set_clicked_node(null), 500)
            }
        }
        addOnKeyEventHandler(
            [KeyNames.alt, KeyNames.w],
            KeyNames.Enter,
            false,
            handler , 
        )
        return ()=>{
            delOnKeyEventHandler(
                [KeyNames.alt, KeyNames.w],
                KeyNames.Enter,
                false,
                handler , 
            )
        }
    }, [
        addOnKeyEventHandler , 
        delOnKeyEventHandler , 
        space , node , 
    ])

    return <Box sx={{  
        position: "relative",
        width   : "18rem",
        height  : "15rem",
        padding : "1rem",
        border  : "1px solid #ccc",
    }}>
        <Box sx={{
            position: "absolute",
            top: "1%",
            left: "1%",
            width: "98%",
            height: "calc(95% - 2rem)",
        }}>        
            <AnimatePresence>
                {holding && (
                    <motion.div
                        initial ={{ scale: 0 }}
                        animate ={{ scale: 1.25 }}
                        exit    ={{ scale: 0 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            duration: 0.1
                        }}
                        style={{
                            padding: "0.25rem 0.25rem",
                            height: "6rem",
                            width: "8rem",
                            border: "1px solid #ccc",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(255, 0, 187, 0.11)",
                            backdropFilter: "blur(10px)",

                            position: "absolute",
                            top: "20%",
                            left: "calc(50% - 4rem)",
                        }}
                    >
                        {[
                            ["1", "2", "3"],
                            ["4", "5", "6"],
                            ["7", "8", "9"],
                        ].map((row, i)=>(
                            <Box key={i} sx={{
                                display: "flex", 
                                flexDirection: "row", 
                                alignItems: "center", 
                                justifyContent: "center",
                                gap: "1.25rem",
                                paddingX: "0.25rem",
                                paddingY: "0.25rem",
                                boxSizing: "border-box",
                                key : row.join(","),
                            }}>
                                {row.map((node, j)=>(
                                    <motion.div
                                        key={node}
                                        animate={{
                                            scale: clicked_node === node ? [1, 1.5, 1] : 1,
                                            rotate: clicked_node === node ? [0, 10, -10, 0] : 0,
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Typography {...make_chosen(node)}>{
                                            name2emoji(node)
                                        }</Typography>
                                    </motion.div>
                                ))}
                            </Box>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            
            <motion.span
                animate={{
                    scale: holding ? 0.8 : 1,
                    x: holding ? -30 : 0,
                    y: holding ? -110 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                }}
                key={"words"}
                style={{
                    position: "absolute",
                    top: "40%",
                    left: "1rem" , 
                    backgroundColor: "rgb(252, 249, 249)",
                    width: "auto",
                    padding: "0 0.5rem",
                }}
            >
                <Typography variant="h6">{words}</Typography>
            </motion.span>
        </Box>
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

