import * as React from "react"
import { KeyName } from "../base"
export type {
    SpaceName,
    NodeName,
    Edge,
    SpaceDefinition,
}

type SpaceName = string
type NodeName = string

interface Edge{
    pressing       : KeyName   ,
    onMove         : (from?: NodeName)=>NodeName | undefined ,
}

interface SpaceDefinition{
    name        : SpaceName     ,
    nodes       : NodeName[]    ,
    holding     : KeyName[]     , 
    edges       : Edge[]        ,
    onStart     : (last_node?: NodeName)=>NodeName  ,
}
