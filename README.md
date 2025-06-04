# Mouseless

`mouseless` is a React library that helps to define high-level keyboard operations.

# Installation

`npm install @ftyyy/mouseless`

# Features

<table style="border: none !important; border-collapse: collapse !important; border-spacing: 0 !important; padding: 0 !important; margin: 0 !important;">
<tr style="border: none !important;">

<td style="border: none !important; padding: 0 !important;" width="50%">

**Keep Tracking of Holding State**

```javascript
function MyComponent(){
    const holding = useKeyHoldingState([
        KeyNames.ctrl, 
        KeyNames.s , 
    ])

    return holding ? <CatDance /> : <></>
}
```

</td>
<td style="border: none !important; padding: 0 !important;" width="50%">

![illu_holding.gif](resources/illu_holding.gif)

</td>
</tr>
<tr style="border: none !important;">
<td style="border: none !important; padding: 0 !important;" width="50%">

**Use Keyboard to Navigate UI Elements**

```javascript
function MyComponent({onClick}){
    const holding = useKeyHoldingState([KeyNames.alt, KeyNames.w])
    const [space, node] = useSpaceNavigatorState()
    const [add_handler, del_handler] = useKeyEventsHandlerRegister()

    React.useEffect(()=>{
        const handler = ()=>(space == "my_space" && onClick(node))
        add_handler([KeyNames.alt, KeyNames.w], KeyNames.Enter,
            false, handler)
        return ()=>{
            del_handler([KeyNames.alt, KeyNames.w], KeyNames.Enter,
                false, handler)
        }
    }, [space , node])

    return (!holding) || (space != "my_space") ? <></> : (
        <Penel cur_node={node}>
    )
}    
```

</td>
<td style="border: none !important; padding: 0 !important;" width="50%">

![illu_navi.gif](resources/illu_navi.gif)

</td>

<tr style="border: none !important;">
<td style="border: none !important; padding: 0 !important;" width="50%">

**Use Keyboard to Move UI Elements**

```javascript
function MyComponent(){
    const keys = [KeyNames.alt, KeyNames.r]
    const holding = useKeyHoldingState(keys)
    const L = useKeyHoldingState([...keys, KeyNames.ArrowLeft])
    const R = useKeyHoldingState([...keys, KeyNames.ArrowRight])
    const U = useKeyHoldingState([...keys, KeyNames.ArrowUp])
    const D = useKeyHoldingState([...keys, KeyNames.ArrowDown])
    const [pos, set_pos] = React.useState({x: 0, y: 0})

    React.useEffect(()=>{
        const interval = setInterval(() => {
            let dx = (R ? 4 : 0) - (L ? 4 : 0)
            let dy = (D ? 4 : 0) - (U ? 4 : 0)
            set_pos({x: pos.x + dx, y: pos.y + dy})
        }, 10)
        return ()=>{clearInterval(interval)}
    }, [pos, L, R, U, D])

    return (!holding) ? <></> : <Plane x={pos.x} y={pos.y}>
}    
```

</td>
<td style="border: none !important; padding: 0 !important;" width="50%">

![illu_moving.gif](resources/illu_moving.gif)

</td>

</tr>

</table>


