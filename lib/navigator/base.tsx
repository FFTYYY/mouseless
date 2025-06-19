import * as React from "react"
import { KeyName } from "../base"
export {
    NO_ACTION,
}
export type {
    SpaceName,
    NodeName,
    Edge,
    SpaceDefinition,
}

const NO_ACTION = "_no_action"

type SpaceName = string
type NodeName  = string

interface Edge{
    pressing       : KeyName   ,
    onMove         : (from?: NodeName)=>NodeName | undefined | typeof NO_ACTION ,
}

interface SpaceDefinition{
    name        : SpaceName     ,
    nodes       : NodeName[]    ,
    holding     : KeyName[]     , 
    edges       : Edge[]        ,
    onStart     : (last_node?: NodeName)=>NodeName  ,
}
