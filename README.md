# Mouseless

`mouseless` is a React library for defining high-level keyboard interactions.


## Installation

Install from npm:
```
npm install @ftyyy/mouseless
```

## Feature Highlights

See this [demo page](https://fftyyy.github.io/mouseless/) for the interactive examples.

Code below are simplified. For full example code, see the [example folder](/example/).



<table style="border: none !important; border-collapse: collapse !important; border-spacing: 0 !important; padding: 0 !important; margin: 0 !important;">
<tr style="border: none !important;">

<td style="border: none !important; padding: 0 !important;" width="50%">

**Track Held Keys**

Detect when specific key combinations (e.g. `ctrl` + `s`) are being held. (Also notice how default browser behavior of `ctrl` + `s` is suppressed.)

```jsx
import { useKeyHoldingState } from "@ftyyy/mouseless"
function MyComponent(){
    const holding = useKeyHoldingState(["Ctrl", "s"])

    return holding && <CatDance />
}
```

</td>
<td style="border: none !important; padding: 0 !important;" width="50%">

![illu_holding.gif](resources/illu_holding.gif)

</td>
</tr>

<tr style="border: none !important;">
<td style="border: none !important; padding: 0 !important;" width="50%">

**Navigate UI with the Keyboard**

Move between UI elements and simulates clicking with keyboard.

```jsx
import { 
    useKeyHoldingState,
    useSpaceNavigatorState, 
    useKeyEventsHandlerRegister,
} from "@ftyyy/mouseless"

function MyComponent({onClick}){
    const keys = ["Alt", "w"]
    const holding = useKeyHoldingState(keys)
    const [space, node] = useSpaceNavigatorState()
    const [ 
        add_handler, del_handler
    ] = useKeyEventsHandlerRegister()

    React.useEffect(()=>{
        const handler = ()=>(
            (space == "my_space") && onClick(node)
        )
        add_handler(keys, "Enter", false, handler)
        return ()=>{
            del_handler(keys,"Enter", false, handler)
        }
    }, [space , node])

    return (holding && (space == "my_space")) && (
        <Penel cur_node={node} />
    )
}
```

</td>
<td style="border: none !important; padding: 0 !important;" width="50%">

![illu_navi.gif](resources/illu_navi.gif)

</td>
</tr>

<tr style="border: none !important;">
<td style="border: none !important; padding: 0 !important;" width="50%">

**Move Elements with Keyboard**

Simulate "drag and move" behavior with arrow keys.

```jsx
import { useKeyHoldingState } from "@ftyyy/mouseless"
function MyComponent(){
    const keys = ["Alt", "r"]
    const holding = useKeyHoldingState(keys)
    const L = useKeyHoldingState([...keys, "ArrowLeft"])
    const R = useKeyHoldingState([...keys, "ArrowRight"])
    const U = useKeyHoldingState([...keys, "ArrowUp"])
    const D = useKeyHoldingState([...keys, "ArrowDown"])
    const [pos, set_pos] = React.useState({x: 0, y: 0})

    React.useEffect(()=>{
        const interval = setInterval(() => {
            let dx = (R ? 4 : 0) - (L ? 4 : 0)
            let dy = (D ? 4 : 0) - (U ? 4 : 0)
            set_pos({x: pos.x + dx, y: pos.y + dy})
        }, 10)
        return ()=>{clearInterval(interval)}
    }, [pos, L, R, U, D])

    return holding && <Plane x={pos.x} y={pos.y} />
}
```

</td>
<td style="border: none !important; padding: 0 !important;" width="50%">

![illu_moving.gif](resources/illu_moving.gif)

</td>

</tr>

</table>

## Detailed Usage

Wrap all keyboard-aware components inside a `KeyEventManager`, which delegates `keyDown` and `keyUp` events. Use `preventing_default` to suppress default browser behavior for specified key combinations.

```jsx
import * as React from "react"
import { KeyEventManager, KeyNames } from "@ftyyy/mouseless"

function App(){
    return <KeyEventManager
        preventing_default = {[KeyNames.ctrl, KeyNames.s]} // prevent ctrl+s
    >{(keydown_proxy, keyup_proxy) => (
        <div 
            tabIndex  = {0}
            onKeyDown = {keydown_proxy}
            onKeyUp   = {keyup_proxy}
        >
            <YourComponent />
        </div>
    )}</KeyEventManager>
}
```

#### Concepts

`mouseless` will provide information of the following states/events:
- **holding**: for a key combination that is being pressed & held, they are called holding keys. `mouseless` keeps track of the state of all holding keys.
- **pressing** / **releasing** events: when a key that is being pressed or being released, it will trigger an event (just like the original `keyDown` and `keyUp` events).
-  the combination of these two types of information.

#### Key Names

`mouseless` provides an object `KeyNames` to define the names of keys. But you can also just use strings as key names.

```jsx
import { KeyNames } from "@ftyyy/mouseless"

console.log(KeyNames.ctrl)    // "Control"
console.log(KeyNames.Control) // "Control"
```

### Hooks

`mouseless` provides several hooks for accessing keyboard states and listening to high-level keyboard events.

- **`useKeyHoldingState`** 
  
    Returns `true` if the given key combination is currently being held.

    ```jsx 
    import * as React from "react"
    import { 
        useKeyHoldingState , 
        KeyNames , 
    } from "@ftyyy/mouseless"

    function YourComponent(){
        // whether a combination of keys are pressed
        const holding = useKeyHoldingState([KeyNames.ctrl, KeyNames.s])

        return holding ? <p>pressed ctrl + s</p> : <></>
    }
    ```
- **`useKeyEventsHandlerRegister`** 

    Returns `[add_handler, del_handler]` functions to register/unregister high-level key event listeners.

    `add_handler` listens to the event that a key is pressing or releasing, while a combination of keys are being held. Unlike the original `keyDown` event, even when the pressing key is kept held after pressing, the event will only be triggered once. 
    ```jsx
    add_handler: (
        KeyName[],              // key combination that needs to be held to trigger the event
        KeyName,                // key that needs to be pressing / releasing to trigger the event
        boolean,                // `true`: listen to key releasing; `false`: listen to key pressing
        (e: KeyEvent)=>void ,   // callback function when the event is triggered.
    ) => void
    ```
    The `del_handler` has the same arguments with `add_handler`.


    ```jsx 
    import * as React from "react"
    import { 
        useKeyEventsHandlerRegister , 
        KeyNames , 
    } from "@ftyyy/mouseless"

    function YourComponent(){
        const [add_handler, del_handler] = useKeyEventsHandlerRegister()

        React.useEffect(()=>{
            const handler_1 = ()=>{
                console.log("ctrl+w+enter pressed!")
            }
            const handler_2 = ()=>{
                console.log("ctrl+w+enter unpressed!")
            }
            add_handler(
                [KeyNames.alt, KeyNames.w], // when alt+w are held ...
                KeyNames.Enter,             // and enter is ...
                false,                      // pressed, ...
                handler_1 ,                 // trigger the handler function `handler_1`.
            )

            add_handler(
                [KeyNames.alt, KeyNames.w], // when alt+w are held ...
                KeyNames.Enter,             // and enter is ...
                true,                       // released, ...
                handler_2 ,                 // trigger the handler function `handler_2`.
            )

            return ()=>{
                del_handler(
                    [KeyNames.alt, KeyNames.w], 
                    KeyNames.Enter, 
                    false, 
                    handler_1 , 
                )
                del_handler(
                    [KeyNames.alt, KeyNames.w], 
                    KeyNames.Enter, 
                    true, 
                    handler_2 , 
                )
            }
        },[])

        return holding ? <p>pressed ctrl + s</p> : <></>
    }
    ```

    When the second argument of `add_handler` (as well as `del_handler`) is an empty string, it listens to the reach of a certain key combination, no matter which key is the last to be pressed.

    For example, the following handler will be triggered either when `alt` is held and `w` is being pressed, or when `w` is held and `alt` is being pressed.
    ```javascript
    add_handler([KeyNames.alt, KeyNames.w], "", false, handler)
    ```
    Similarly, the following handler will be triggered either when `alt` is held and `w` is being released, or when `w` is held and `alt` is being released.
    ```javascript
    add_handler([KeyNames.alt, KeyNames.w], "", true, handler)
    ```
    

    You can also use `"down"` or `"up"` as the third argument.
    ```js
    // these two lines has exactly the same behavior
    add_handler([KeyNames.alt, KeyNames.w], KeyNames.Enter, false, handler)
    add_handler([KeyNames.alt, KeyNames.w], KeyNames.Enter, "down", handler)
    ```

### Space Navigator

The **Space Navigator** is a built-in plugin provided by `mouseless` that enables keyboard-based navigation across UI elements.


A navigator is defined as a *graph* (called **space**). Each *node* of a space is a string and each *edge* defines a directional transition between two nodes, triggered by a specific key.

Each space need to have a `holding` key combination. The space is activated only when this key combination is held.

Each edge requires a `pressing` key that initiates movement from one node to another. It will only take effect when the corresponding space is currently active (i.e. the `holding` keys are held).

```jsx
import { SpaceDefinition } from "@ftyyy/mouseless"

const my_space: SpaceDefinition = {
    name        : "my_space",         // the unique name of the space
    nodes       : ["1", "2", "3"],    // the node list of the space 
    onStart     : (last_node)=> (last_node ?? "1"),   // the node to be activated when first enter the space

    // the key combinations that enters the space when held
    holding     : [KeyNames.alt, KeyNames.w],

    // transition rules between nodes.
    // trnaisiton will take effect when the `holding` keys of the space are pressed and `trigger` key of the egde is being pressed.
    edges       : [
        {
            pressing: KeyNames.ArrowRight, 
            onMove: (cur_node)=>(
                // return `"no_action"` means not triggering this edge.
                ({"1": "2", "2": "3", "3": "1"})[cur_node] ?? "_no_action"
            )
        } , 
        {
            pressing: KeyNames.ArrowLeft , 
            onMove: (cur_node)=>(
                ({"2": "1", "3": "2", "1": "3"})[cur_node] ?? "_no_action"
            )
        }
    ],
}
```

To apply a space, pass it to the `KeyEventManager`:
```jsx
import { KeyEventManager } from "@ftyyy/mouseless"

function App(){
    return <KeyEventManager
        spaces = {[my_space]} // pass the space definition to `KeyEventManager` here!
        preventing_default = {[
            [KeyNames.alt, KeyNames.w], // surpass the default behavior 
        ]}
    >{(keydown_proxy, keyup_proxy) => (
        <div 
            tabIndex  = {0}
            onKeyDown = {keydown_proxy}
            onKeyUp   = {keyup_proxy}
        >
            <YourComponent />
        </div>
    )}</KeyEventManager>
}
```

#### Navigator Hooks

- **`useSpaceNavigatorState`**: Returns the names of current activated space and node.
- **`useSpaceNavigatorOnMoveRegister`**: Provides register/unregister functions for movement handlers. These functions will be called when a movement between nodes in the space is happening.

```jsx
import * as React from "react"
import {
    useSpaceNavigatorState , 
    useSpaceNavigatorOnMoveRegister , 
} from "@ftyyy/mouseless"


import type {
    SpaceName , // (they are both strings actually. You can just use `string`) 
    NodeName , 
} from "@ftyyy/mouseless"

function YourComponent(){
    // get current activated space and node
    const [space, node] = useSpaceNavigatorState()

    // get registeration functions for moving events listeners
    const [add_move_handler, del_move_handler] = useSpaceNavigatoronMoveRegister()

    React.useEffect(()=>{

        // define a moving event handler
        const handler = (
            start_space ?: SpaceName, 
            start_node  ?: NodeName, 
            end_space   ?: SpaceName, 
            end_node    ?: NodeName , 
        )=>{
            if(start_space == end_space && start_space == "my_space"){
                set_words(`moved from ${start_node} to ${end_node}`)
            }
        }

        // register the handler
        add_move_handler(handler)
        return ()=>{
            // unregister the handler when unmount
            del_move_handler(handler)
        }
    },[])

    
    // if a node is current activated, give it a solid border.
    const make_styles = (node_name: string)=>{
        if(node == node_name){
            return {
                style: { border: "1px solid #000" }
            }
        }
        return {}
    }

    return (space == "my_space") ? (<div>
        <p {...make_styles("1")}>element 1</p>
        <p {...make_styles("2")}>element 2</p>
        <p {...make_styles("3")}>element 3</p>
    <div>) : <></>
}
```
#### Efficiency Optimization
`useSpaceNavigatorState` accepts two optional parameters: `target_space: SpaceName` and `target_node: NodeName`. With one of two parameters specified, `useSpaceNavigatorState` will only return results when the specified parameter is met, and otherwise return `[undefined, undefined]`. This allows a finer control over the rerender behavior of the React component.
```js
import * as React from "react"
import {
    useSpaceNavigatorState , 
} from "@ftyyy/mouseless"

function YourComponent(){
    // only rerender when `space=="my_space"`
    const [space, node] = useSpaceNavigatorState("my_space")

    return (space == "my_space") ? <div>my space!</div> : <></>
}
```

`mouseless` also provides a lower-level hook `useSpaceNavigatorRawState`, allowing users to specify a selector. The selector can access to the internal `state` and return whatever inforamtion the user requires. The component would not rerender as long as the return value of `useSpaceNavigatorRawState` is unchanged. Use `state.space` and `state.node` to access current space and node.
```js
import * as React from "react"
import {
    useSpaceNavigatorState , 
} from "@ftyyy/mouseless"

// a space shared by two components
const my_space: SpaceDefinition = {
    name        : "my_space", 

    // 2 components share the same space.
    // node format: `${component_idx},{node_idx}`.
    nodes       : [
        "0,0", "0,1", "0,2", 
        "1,0", "1,1", "1,2"
    ], 

    onStart     : (last_node)=> (last_node ?? "0,0"), 
    holding     : [KeyNames.alt, KeyNames.w],
    edges       : [
        {// switch component
            pressing: KeyNames.ArrowUp, 
            onMove: (cur_node)=>{
                const [component, idx] = cur_node.split(",")
                return `${parseInt(component) ^ 1},${idx}`
            }
        } , 
        {// switch component
            pressing: KeyNames.ArrowDown, 
            onMove: (cur_node)=>{
                const [component, idx] = cur_node.split(",")
                return `${parseInt(component) ^ 1},${idx}`
            }
        } , 
        {// switch idx
            pressing: KeyNames.ArrowLeft, 
            onMove: (cur_node)=>{
                const [component, idx] = cur_node.split(",")
                return `${component},${(parseInt(idx)+2)%3}`
            }
        } , 
        {// switch idx
            pressing: KeyNames.ArrowLeft, 
            onMove: (cur_node)=>{
                const [component, idx] = cur_node.split(",")
                return `${component},${(parseInt(idx)+1)%3}`
            }
        } , 
    ],
}

function YourComponent_1(){
    const node = useSpaceNavigatorRawState(React.useCallback(()=>{
        const {space, node} = state
        if(space != my_space.name){
            // when navigating in other spaces, the component would not rerender.
            return undefined 
        }
        const [component, idx] = node.split(",")
        if(components != "1"){
            // when switching in this space but the other component, this component would also not rerender.
            return undefined
        }
        return idx
    }, []))

    return <div>current node is {node}</div>
}

function YourComponent_2(){
    const node = useSpaceNavigatorRawState(React.useCallback(()=>{
        const {space, node} = state
        if(space != my_space.name){
            // when navigating in other spaces, the component would not rerender.
            return undefined 
        }
        const [component, idx] = node.split(",")
        if(components != "2"){
            // when switching in this space but the other component, this component would also not rerender.
            return undefined
        }
        return idx
    }, []))

    return <div>current node is {node}</div>
}

```


## License

[MIT License](LICENSE)
