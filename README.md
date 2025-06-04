# Mouseless

`mouseless` is a React library that for defining high-level keyboard interactions.

## Installation

Install from npm:
```
npm install @ftyyy/mouseless
```

## Feature Highlights

Below are simplified examples. For full example code, see [example](/example/).

<table style="border: none !important; border-collapse: collapse !important; border-spacing: 0 !important; padding: 0 !important; margin: 0 !important;">
<tr style="border: none !important;">

<td style="border: none !important; padding: 0 !important;" width="50%">

**Track Pressed and Held Keys**

Detect when specific key combinations (e.g. `ctrl` + `s`) are being held.

(Also notice how default browser behavior of `ctrl` + `s` is suppressed.)

```javascript
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

Move between UI elements and trigger actions with keyboard.

```javascript
import { 
    useKeyHoldingState ,
    useSpaceNavigatorState, 
    useKeyEventsHandlerRegister
} from "@ftyyy/mouseless"

function MyComponent({onClick}){
    const keys = ["Alt", "w"]
    const holding = useKeyHoldingState(keys)
    const [space, node] = useSpaceNavigatorState()
    const [ 
        add_handler, del_handler
    ] = useKeyEventsHandlerRegister()

    React.useEffect(()=>{
        const f = ()=>(
            (space == "my_space") && onClick(node)
        )
        add_handler(keys,"Enter" false,f)
        return ()=>{del_handler(keys,"Enter",false,f)}
    }, [space , node])

    return (holding && (space == "my_space")) && (
        <Penel cur_node={node}>
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

**Move Elements with Keys**

Simulate "drag and move" behavior with arrow keys.

```javascript
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

```javascript
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

### Core Hooks

`mouseless` provides several hooks for accessing keyboard states and listening high-level keyboard events.

- **`useKeyHoldingState`** 
  
    Returns `true` if the given key combination is currently being held down.

    ```javascript 
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

    Returns `[add_handler, del_handler]` functions to register high-level key events listeners.


    ```javascript 
    import * as React from "react"
    import { 
        useKeyEventsHandlerRegister , 
        KeyNames , 
    } from "@ftyyy/mouseless"

    function YourComponent(){
        const [add_handler, del_handler] = useKeyEventsHandlerRegister()

        React.useEffect(()=>{
            const handler_1 = (){
                console.log("ctrl+w+enter pressed!")
            }
            const handler_2 = (){
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
                handler ,                   // trigger the handler function `handler_2`.
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

    To detect when a key combination is first reached, pass an empty string as the second argument.

    For example, the following handler can be triggered either when `alt` is held and `w` is pressed, or when `w` is held and `alt` is pressed.
    ```javascript
    add_handler([KeyNames.alt, KeyNames.w], "", false, handler)
    ```
    Similarly, the following handler triggers either when whether `alt` is held and `w` is released, or when `w` is held and `alt` is released.
    ```javascript
    add_handler([KeyNames.alt, KeyNames.w], "", true, handler)
    ```
    

#### Space Navigator

The **Space Navigator** is a built-in plugin provided by `mouseless` that enables keyboard-based navigation across UI elements.


A navigator is defined as a *graph* (called **space**). Each *node* of a space is a string and each *edge* defines a directional transition between two nodes, triggered by a specific key.

To activate a space, you must define a `holding` key combination. The space is activated only when this key combination is held.

Each edge requires a `trigger` key that initiates movement from one node to another. It will only take effect if the corresponding space is currently active (i.e. the `holding` keys are held).

```js
import type { SpaceDefinition } from "@ftyyy/mouseless"
const my_space: SpaceDefinition = {
    name        : "my_space",
    nodes       : ["1", "2", "3"],
    start_node  : "1", // the node to be activated when first enter the space
    holding     : [KeyNames.alt, KeyNames.w], // the key combinations that enters the space when held
    edges       : [     // transition rules between nodes
        {from: "1", to "2", trigger: KeyNames.ArrowRight} , 
        {from: "2", to "3", trigger: KeyNames.ArrowRight} , 
        {from: "3", to "1", trigger: KeyNames.ArrowRight} , 

        {from: "2", to "1", trigger: KeyNames.ArrowLeft} , 
        {from: "3", to "2", trigger: KeyNames.ArrowLeft} , 
        {from: "1", to "3", trigger: KeyNames.ArrowLeft} , 
    ],
}
```

To apply a space, pass it to the `KeyEventManager`:
```js
import { KeyEventManager } from "@ftyyy/mouseless"
function App(){
    <KeyEventManager
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

### Navigator Hooks

- **`useSpaceNavigatorState`**: Returns current activated space and node.
- **`useSpaceNavigatoronMoveRegister`**: Provides register/unregister functions for listerners to movements between nodes in the space.

```js
import * as React from "react"
import {
    useSpaceNavigatorState , 
    useSpaceNavigatoronMoveRegister , 
} from "@ftyyy/mouseless"

// they are both strings actually. You can just use `string`. 
import type {
    SpaceName , 
    NodeName , 
} from "@ftyyy/mouseless"

function YourComponent(){
    // get current activated space and node
    const [space, node] = useSpaceNavigatorState()

    // get registeration functions for moving events listeners
    const [add_moving_listener, del_moving_listener] = useSpaceNavigatoronMoveRegister()

    React.useEffect(()=>{

        // define a moving event handler
        const handler = (
            start_space ?: SpaceName, 
            start_node  ?: NodeName, 
            end_space   ?: SpaceName, 
            end_node    ?: NodeName , 
        )=>{
            if(start_space == end_space){
                set_words(`moved from ${start_node} to ${end_node}`)
            }
        }

        // register the handler
        add_moving_listener(handler)
        return ()=>{
            // unregister the handler when unmount
            del_moving_listener(handler)
        }
    },[])

    
    // if `nodename` is current activated, give it a solid border.
    const make_styles = (nodename: string)=>{
        if(node == nodename){
            return {style: {
                border: "1px solid #000"
            }}
        }
        return {}
    }


    return (space == "my_space") && (<div>
        <p {...make_styles("1")}>element 1</p>
        <p {...make_styles("2")}>element 2</p>
        <p {...make_styles("3")}>element 3</p>
    <div>)
}
```

## License

[MIT License](LICENSE)