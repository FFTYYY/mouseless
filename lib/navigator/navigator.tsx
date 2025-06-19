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
    NO_ACTION , 
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
    useSpaceNavigatorOnMoveRegister , 
}

export type {
    onMoveHandler  ,
}

/**
 * `SpaceNaviGatorOperationItem`定义了一个延时的操作。
 * 这个操作会根据当前的空间和节点来判断是否要执行操作。
 * 
 * 如果当前在`space`和`from`，那么就前往`to`。
 */
type SpaceNaviGatorOperationItem = (
    cur_space: SpaceName | undefined, 
    cur_node : NodeName  | undefined, 
    set_space: (space?: SpaceName | typeof NO_ACTION) => void, 
    set_node : (node?: NodeName   | typeof NO_ACTION) => void,
    set_last : (last?: boolean) => void,
) => void

/**
 * `SpaceNaviGatorOperation`是一系列竞争的`SpaceNaviGatorOperationItem`。
 * 按下一个键时，每个operation中只能触发一个item来执行。
 */
type SpaceNaviGatorOperation = SpaceNaviGatorOperationItem[]


type onMoveHandler = (
    start_space ?: SpaceName, 
    start_node  ?: NodeName , 
    end_space   ?: SpaceName, 
    end_node    ?: NodeName ,
) => void

interface SpaceNavigatorState{
    space?: SpaceName
    node?: NodeName
    set_space : (space?: SpaceName) => void
    set_node  : (node?: NodeName) => void
    set_state : (space?: SpaceName, node?: NodeName) => void

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
        space : undefined,
        node  : undefined,
        set_space: (space?: SpaceName) => {
            set({space: space}) 
        },
        set_node: (node?: NodeName) => {
            set({node: node})
        },
        set_state: (space?: SpaceName, node?: NodeName) => {
            set({space: space, node: node})
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
            state.space,
            state.node,
        ]
    }))
}

function useSpaceNavigatorOnMoveRegister(){
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
    last_node: NodeName | undefined,
    push_operation: (operation: SpaceNaviGatorOperation) => void , 
): Parameters<KeyEventHandlerRegisterFunc>[]
{
    let handlers = new Array<Parameters<KeyEventHandlerRegisterFunc>>()
    handlers.push([
        space.holding,
        "", // 全部按住时触发
        false,
        ()=>{
            push_operation([(cur_space, cur_node, set_space, set_node, set_last)=>{
                if(cur_space != space.name || cur_node == undefined){
                    set_space(space.name)
                    set_node(space.onStart(last_node))
                }
            }])
    }
    ])
    handlers.push([
        space.holding,
        "",   // 离开空间时触发
        true, // 抬起时触发
        ()=>{
            push_operation([
                (cur_space, cur_node, set_space, set_node, set_last)=>{
                    // 即使不在当前空间，我们也强制离开
                    // if(cur_space == space.name)
                    set_space(undefined)
                    set_node (undefined)
                    set_last(true)
                }
            ])
        }
    ])
    // 每次按下一个键，只能触发一个edge
    let navi_operation: {
        [pressing: string]: SpaceNaviGatorOperation
    } = {}
    for(const edge of space.edges){
        if(!navi_operation[edge.pressing]){
            navi_operation[edge.pressing] = new Array<SpaceNaviGatorOperationItem>()
        }
        navi_operation[edge.pressing].push(
            (cur_space, cur_node, set_space, set_node, set_last)=>{
                if(cur_space == space.name){
                    set_space(NO_ACTION)
                    set_node(edge.onMove(cur_node))
                }
            }
        )
    }
    for (const [pressing, operation] of Object.entries(navi_operation)){ 
        handlers.push([
            space.holding , 
            pressing as KeyName,
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
        cur_space, 
        cur_node, 
        cur_operations,
        onmove_handlers,
        last_nodes,
    ] = useStore(
        store_ref.current, 
        useShallow(state => [
            state.space, 
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
                    last_nodes[space.name], // 初始节点
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
        const {pop_operation, set_last_node, set_state} = state
        
        if(cur_operations.length <= 0){
            return 
        }
        const operation = cur_operations[0]

        for(const op of operation){
            // 一次取一个operation item
            
            let ret_space: SpaceName | typeof NO_ACTION | undefined = NO_ACTION
            let ret_node: NodeName   | typeof NO_ACTION | undefined = NO_ACTION
            let ret_last: boolean | undefined = undefined
            const flag_1 = op(
                cur_space, 
                cur_node, 
                (space?: SpaceName | typeof NO_ACTION)=>{ret_space = space}, 
                (node?: NodeName   | typeof NO_ACTION)=>{ret_node = node}, 
                (last?: boolean)=>{ret_last = last}
            )

            
            if(ret_space == NO_ACTION && ret_node == NO_ACTION && (ret_last == undefined)){
                // 没有执行任何操作，跳过
                continue
            }

            const tar_space = ret_space == NO_ACTION ? cur_space : ret_space
            const tar_node  = ret_node  == NO_ACTION ? cur_node  : ret_node

            onmove_handlers.forEach(handler=>{
                handler(cur_space, cur_node, tar_space, tar_node)
            })
            
            set_state(tar_space, tar_node)

            if((ret_last != undefined) && cur_space && cur_node){
                set_last_node(cur_space, cur_node)
            }
            
            break // 只执行一次操作
        }
        // 不论操作有没有执行，都要出队。
        pop_operation()
    },[
        cur_operations , 
        cur_space,
        cur_node,
        spaces , 
        onmove_handlers , 
    ])

    const children_element = React.useMemo(() => {
        if(typeof children === "function"){
            return children(keydown_proxy, keyup_proxy)
        }
        return children
    }, [children, keydown_proxy, keyup_proxy])
    const context_value = React.useMemo(()=> store_ref.current, [])

    // 这个组件会自动向下提供keydown_proxy和keyup_proxy
    return <SpaceNavigator_ScopedStore value={context_value}> 
        {children_element}
    </SpaceNavigator_ScopedStore>

}