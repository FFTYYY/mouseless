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
    from    : NodeName  ,
    to      : NodeName  ,
    trigger : KeyName   ,  
}

interface SpaceDefinition{
    name        : SpaceName     ,
    nodes       : NodeName[]    ,
    holding     : KeyName[]     , 
    start_node  : NodeName      ,
    edges       : Edge[]        ,
}
