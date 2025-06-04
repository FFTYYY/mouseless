import * as React from "react"

import {
    createStore,
    StoreApi , 
} from "zustand/vanilla"
import {
    useStore , 
} from "zustand"
import {useShallow} from "zustand/react/shallow"

import {
    KeyNames , 
    KeyName , 
} from "../base"

import {
    SpaceName,
    NodeName,
    SpaceDefinition , 
} from "./base"

import {
    KeyEventManagerChildren ,
    KeyDownProxy , 
    KeyUpProxy , 
    useKeyEvents , 
    KeyEventHandlerRegisterFunc,
    KeyEventHandler , 
    KeyEvent , 
    useKeyDownUpProxy,
} from "../manager"

export {
    useSpaceNavigatorState , 
    SpaceNavigator , 
    useSpaceNavigatoronMoveRegister , 
}

export type {
    onMoveHandler  ,
}

/**
 * 如果当前在`space`和`from`，那么就前往`to`。
 */
interface SpaceNaviGatorOperationItem{
    if_space : SpaceName | "_any" | "_none"
    if_node  : NodeName  | "_any" | "_none"
    set_space: SpaceName
    set_node : NodeName
    set_last ?: boolean 
}
type SpaceNaviGatorOperation = SpaceNaviGatorOperationItem[]
type onMoveHandler = (
    start_space ?: SpaceName, 
    start_node  ?: NodeName, 
    end_space   ?: SpaceName, 
    end_node    ?: NodeName,
) => void

interface SpaceNavigatorState{
    name?: SpaceName
    node?: NodeName
    set_name: (name: SpaceName) => void
    set_node: (node: NodeName) => void
    set_state: (name: SpaceName, node: NodeName) => void

    operations: SpaceNaviGatorOperation[]
    push_operation   : (operation: SpaceNaviGatorOperation) => void
    pop_operation    : () => void

    onmove_handlers: onMoveHandler[]
    add_onmove_handler: (handler: onMoveHandler) => void
    del_onmove_handler: (handler: onMoveHandler) => void

    // 记住上一次退出的时候的节点。重新进入space的时候从这里开始。
    last_node: {
        [space: SpaceName]: NodeName
    }
    set_last_node: (space: SpaceName, node: NodeName) => void
}

function create_space_navigator_store(): StoreApi<SpaceNavigatorState>{
    return createStore<SpaceNavigatorState>((set)=>({
        name : undefined,
        node : undefined,
        set_name: (name: SpaceName) => {
            set({name})
        },
        set_node: (node: NodeName) => {
            set({node})
        },
        set_state: (name: SpaceName, node: NodeName) => {
            set({name, node})
        },

        
        operations: [],

        push_operation: (operation: SpaceNaviGatorOperation) => {
            set(state=>({
                operations: [...state.operations, operation]
            }))
        },
        pop_operation: () => {
            set(state=>({
                operations: state.operations.slice(1)
            }))
        },

        onmove_handlers: [],
        add_onmove_handler: (handler: onMoveHandler) => {
            set(state=>{
                if(state.onmove_handlers.includes(handler)){
                    return state
                }
                return {
                    onmove_handlers: [...state.onmove_handlers, handler]
                }
            })
        },
        del_onmove_handler: (handler: onMoveHandler) => {
            set(state=>({
                onmove_handlers: state.onmove_handlers.filter(h=>h!=handler)
            }))
        },
        
        last_node: {},
        set_last_node: (space: SpaceName, node: NodeName) => {
            set(state=>({
                last_node: {...state.last_node, [space]: node}
            }))
        },
    }))
}

const SpaceNavigator_ScopedStore = React.createContext<
    StoreApi<SpaceNavigatorState> | null
>(null)

function useSpaceNavigatorState(){
    const store = React.useContext(SpaceNavigator_ScopedStore)
    if(!store){
        throw new Error("Not in context of SpaceNavigator")
    }
    return useStore(store, useShallow((state)=>{
        return [
            state.name,
            state.node,
        ]
    }))
}

function useSpaceNavigatoronMoveRegister(){
    const store = React.useContext(SpaceNavigator_ScopedStore)
    if(!store){
        throw new Error("Not in context of SpaceNavigator")
    }
    return useStore(store, useShallow((state)=>{
        return [
            state.add_onmove_handler,
            state.del_onmove_handler,
        ]
    }))
}

/**
 * 给定一个空间，将其翻译成一系列handler。
 * @param space 要处理的空间。
 * @returns 这个空间的所有的handler。
 */
function make_register_handlers(
    space: SpaceDefinition , 
    start_node: NodeName,
    push_operation: (operation: SpaceNaviGatorOperation) => void , 
): Parameters<KeyEventHandlerRegisterFunc>[]
{
    let handlers = new Array<Parameters<KeyEventHandlerRegisterFunc>>()
    handlers.push([
        space.holding,
        "", // 全部按住时触发
        false,
        ()=>{push_operation([{
            if_space : "_none", 
            if_node  : "_none", 
            set_space: space.name, 
            set_node : start_node || space.start_node
        }])}
    ])
    handlers.push([
        space.holding,
        "",   // 离开空间时触发
        true, // 抬起时触发
        ()=>{
            push_operation([{
                if_space : space.name, 
                if_node  : "_any"    , 
                set_space: "_none"   , 
                set_node : "_none"   , 
                set_last : true      , // 设置下一次的开始节点
            }])
        }
    ])

    let navi_operation: {
        [trigger: string]: SpaceNaviGatorOperation
    } = {}
    for(const edge of space.edges){
        if(!navi_operation[edge.trigger]){
            navi_operation[edge.trigger] = new Array<SpaceNaviGatorOperationItem>()
        }
        navi_operation[edge.trigger].push({
            if_space : space.name, 
            if_node  : edge.from, 
            set_space: space.name, 
            set_node : edge.to
        })
    }
    for (const [trigger, operation] of Object.entries(navi_operation)){ 
        handlers.push([
            space.holding,
            trigger as KeyName, // 全部按住时触发
            false,
            ()=>{push_operation(operation)}
        ])
    }
    return handlers
}

function SpaceNavigator({
    spaces, 
    children,
}:{
    spaces: SpaceDefinition[] , 
    children: KeyEventManagerChildren
}){
    const [keydown_proxy,keyup_proxy] = useKeyDownUpProxy()

    const store_ref = React.useRef<StoreApi<SpaceNavigatorState>>(
        create_space_navigator_store()
    )
    // holding keys要放到外面来，这样才能触发组件自动更新
    const [
        cur_name, 
        cur_node, 
        cur_operations,
        onmove_handlers,
        last_nodes,
    ] = useStore(
        store_ref.current, 
        useShallow(state => [
            state.name, 
            state.node, 
            state.operations, 
            state.onmove_handlers,
            state.last_node,
        ])
    )

    const [register_handler,unregister_handler]: [
        KeyEventHandlerRegisterFunc,
        KeyEventHandlerRegisterFunc,
    ] = useKeyEvents(state=>([
        state.register_handler,
        state.unregister_handler,
    ]))

    React.useEffect(()=>{
        // 获取push_operation函数。注意这里是不会触发自动更新的
        const push_operation = store_ref.current?.getState()?.push_operation
        if(!push_operation) return

        const handlers = spaces.reduce((acc, space)=>{
            return  [
                ...acc,
                ...make_register_handlers(
                    space,
                    last_nodes[space.name] || space.start_node, // 初始节点
                    push_operation,
                )
            ]
        },[] as Parameters<KeyEventHandlerRegisterFunc>[])

        handlers.forEach(handler=>{
            register_handler(...handler)
        })

        return ()=>{
            handlers.forEach(handler=>{
                unregister_handler(...handler)
            })
        }
    },[
        register_handler, 
        unregister_handler, 
        spaces , 
        last_nodes , 
    ])

    React.useEffect(()=>{
        // 注意这里是不会触发自动更新的
        const state = store_ref.current?.getState() 
        if(!state) return
        const {pop_operation, set_state, set_last_node} = state
        
        if(cur_operations.length <= 0){
            return 
        }
        const operation = cur_operations[0]

        for(const op of operation){
            // 一次取一个operation item
            
            const flag_1 = op.if_space == cur_name 
                || op.if_space == "_any"
                || (op.if_space == "_none" && !cur_name)

            const flag_2 = op.if_node  == cur_node    
                || op.if_node  == "_any"
                || (op.if_node  == "_none" && !cur_node)
            
            // 如果操作没有匹配，就跳过
            if((!flag_1) || (!flag_2)){
                continue
            }

            onmove_handlers.forEach(handler=>{
                handler(cur_name, cur_node, op.set_space, op.set_node)
            })
            
            // 执行操作
            set_state(op.set_space, op.set_node)

            if(op.set_last && cur_name && cur_node){
                set_last_node(cur_name, cur_node)
            }
            
            break // 只执行一次操作
        }
        // 不论操作有没有执行，都要出队。
        pop_operation()
    },[
        cur_operations , 
        cur_name,
        cur_node,
        spaces , 
        onmove_handlers , 
    ])

    // 这个组件会自动向下提供keydown_proxy和keyup_proxy
    if(typeof children == "function"){
        return <SpaceNavigator_ScopedStore value={store_ref.current}> {children(
            keydown_proxy,
            keyup_proxy  , 
        )}</SpaceNavigator_ScopedStore>
    }
    return <SpaceNavigator_ScopedStore value={store_ref.current}> 
        {children}
    </SpaceNavigator_ScopedStore>

}