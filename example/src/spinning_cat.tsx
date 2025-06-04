/**
 * 这一页是Claude大师写的。
 */

import React, { useState, useEffect } from "react"

export { SpinningCat }

const catFrames = [
`     /\\_/\\  
    ( o.o ) 
     > ^ <  
    /     \\ 
   (  ___  )
    \\_____/`,
        
`    /\\_/\\   
   ( o.o )  
    > ^ <   
   /     \\  
  (  ___  ) 
   \\_____/ `,
        
`   /\\_/\\    
  ( o.o )   
   > ^ <    
  /     \\   
 (  ___  )  
  \\_____/  `,
        
`  /\\_/\\
 ( o.o )    
  > ^ <     
 /     \\    
(  ___  )  
 \\_____/   `,
        
`   /\\_/\\  
  ( o.o ) 
   > ^ <  
  /     \\ 
 (  ___  )
  \\_____/`,
        
`    /\\_/\\  
   ( o.o ) 
    > ^ <  
   /     \\ 
  (  ___  )  
   \\_____/   `,
        
`   /\\_/\\    
  ( o.o )   
   > ^ <    
  /     \\   
 (  ___  )  
  \\_____/  `,
        
`    /\\_/\\   
   ( o.o )  
    > ^ <   
   /     \\  
  (  ___  ) 
   \\_____/ `
    ]

const blinkFrames = [
`     /\\_/\\  
    ( >.< )  
     > ^ <  
    /     \\ 
   (  ___  )
    \\_____/`,
        
`    /\\_/\\   
   ( >.< )  
    > ^ <   
   /     \\  
  (  ___  ) 
   \\_____/ `,
        
`   /\\_/\\    
  ( >.< )   
   > ^ <    
  /     \\   
 (  ___  )  
  \\_____/  `,
        
`  /\\_/\\     
 ( >.< )    
  > ^ <     
 /     \\    
(  ___  )  
 \\_____/   `,
        
`   /\\_/\\  
  ( >.< ) 
   > ^ <  
  /     \\ 
 (  ___  )
  \\_____/`,
        
`  /\\_/\\     
 ( >.< )    
  > ^ <     
 /     \\    
(  ___  )  
 \\_____/   `,
        
`   /\\_/\\    
  ( >.< )   
   > ^ <    
  /     \\   
 (  ___  )  
  \\_____/  `,
        
`    /\\_/\\   
   ( >.< )  
    > ^ <   
   /     \\  
  (  ___  ) 
   \\_____/ `
]

const SpinningCat = ({ 
    speed = 100, 
    fontSize = "14px", 
    color = "#333",
    blinkChance = 0.1 
}) => {
    const [currentFrame, setCurrentFrame] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame(prev => (prev + 1) % catFrames.length)
        }, speed)

        return () => clearInterval(interval)
    }, [speed, catFrames.length])

    // 随机选择是否眨眼
    const shouldBlink = Math.random() < blinkChance
    const frames = shouldBlink ? blinkFrames : catFrames

    return (
        <pre style={{
            fontFamily: "monospace",
            fontSize: fontSize,
            color: color,
            margin: 0,
            padding: 0,
            lineHeight: "1.2",
            userSelect: "none"
        }}>
            {frames[currentFrame]}
        </pre>
    )
}
