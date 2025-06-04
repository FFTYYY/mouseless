# Mouseless

`mouseless` is a React library that helps to define high-level keyboard operations.

# Installation

`npm install @ftyyy/mouseless`

# Features

<table style="border: none !important; border-collapse: collapse !important; border-spacing: 0 !important; padding: 0 !important; margin: 0 !important;">
<tr style="border: none !important;">

<td style="border: none !important; padding: 0 !important;" width="50%">

**Keep Tracking of Pressed and Holding Keys**

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


</td>
<td style="border: none !important; padding: 0 !important;" width="50%">

![illu_moving.gif](resources/illu_moving.gif)

</td>

</tr>

</table>


