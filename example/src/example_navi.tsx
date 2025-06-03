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
    useSpaceNavigatoronMoveRegister , 
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

const myspace: SpaceDefinition = {
    name        : "example",
    nodes       : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    start_node  : "1",
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

        for(let i = 0; i < A.length; i++){
            for(let j = 0; j < A[i].length; j++){
                for(let k = 0; k < 4; k++){
                    const ni = (i + di[k] + 3) % 3
                    const nj = (j + dj[k] + 3) % 3
                    edges.push({
                        from    : A[i][j],
                        to      : A[ni][nj],
                        trigger : trigger[k],
                    })
                }
            }
        }
        return edges
    })(),
}

function ExampleNavi(){
    const holding = useKeyHoldingState([KeyNames.alt, KeyNames.w])
    
    const [space, node] = useSpaceNavigatorState()
    const [addOnMoveHandler, delOnMoveHandler] = useSpaceNavigatoronMoveRegister()
    const [addOnKeyEventHandler, delOnKeyEventHandler] = useKeyEventsHandlerRegister()

    const make_chosen = (cur_node: NodeName) => {
        if(space == myspace.name && node == cur_node){
            return {
                sx:{
                    backgroundColor: "rgba(44, 41, 41, 0.89)",
                    color: "rgba(235, 218, 218, 0.89)",
                }
            }
        }
        return {sx:{}}
    }

    const [words, set_words] = React.useState<string>("按下alt+w开始吧！")

    React.useEffect(()=>{
        const handler = (
            start_space ?: SpaceName, 
            start_node  ?: NodeName, 
            end_space   ?: SpaceName, 
            end_node    ?: NodeName , 
        )=>{
            if((start_space != myspace.name) && (end_space == myspace.name)){
                set_words("上一次操作：进入空间")
            }
            if(start_space == end_space){
                set_words(`上一次操作：从${start_node}移动到${end_node}`)
            }
            if(start_space == myspace.name && end_space != myspace.name){
                set_words("按下alt+w开始吧！")
            }
        }
        addOnMoveHandler(handler)
        return ()=>{
            delOnMoveHandler(handler)
        }
    }, [addOnMoveHandler, delOnMoveHandler])

    React.useEffect(()=>{
        const handler = ()=>{
            if(space == myspace.name){
                set_words(`上一次操作：激活${node}`)
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
        width   : "15rem",
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

            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        }}>        
            {holding && (
                <Box sx={{
                    width: "100%",
                    height: "5rem",
                    border: "1px solid #ccc",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Box sx={{
                        display: "flex", 
                        flexDirection: "row", 
                        alignItems: "center", 
                        justifyContent: "center",
                        gap: "1rem",
                    }}>
                        <Typography {...make_chosen("1")}>1！</Typography>
                        <Typography {...make_chosen("2")}>2！</Typography>
                        <Typography {...make_chosen("3")}>3！</Typography>
                    </Box>
                    <Box sx={{
                        display: "flex", 
                        flexDirection: "row", 
                        alignItems: "center", 
                        justifyContent: "center",
                        gap: "1rem",
                    }}>
                        <Typography {...make_chosen("4")}>4！</Typography>
                        <Typography {...make_chosen("5")}>5！</Typography>
                        <Typography {...make_chosen("6")}>6！</Typography>
                    </Box>
                    <Box sx={{
                        display: "flex", 
                        flexDirection: "row", 
                        alignItems: "center", 
                        justifyContent: "center",
                        gap: "1rem",
                    }}>
                        <Typography {...make_chosen("7")}>7！</Typography>
                        <Typography {...make_chosen("8")}>8！</Typography>
                        <Typography {...make_chosen("9")}>9！</Typography>
                    </Box>
                </Box>
            )}


            <Typography>{words}</Typography>
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

