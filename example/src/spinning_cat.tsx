import React, { useState, useEffect } from "react"

export {
    SpinningCat,
}

const catFrames = [
    // 原始旋转动画
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

// 新增：抬手动作
const waveFrames = [
    `     /\\_/\\  
    ( o.o ) 
     > ^ <  
   \\|     \\ 
   (  ___  )
    \\_____/`,
    
    `      /\\_/\\  
     ( o.o ) 
      > ^ <  
    |\\    \\ 
    (  ___  )
     \\_____/`,
    
    `       /\\_/\\  
      ( o.o ) 
       > ^ <  
      /|    \\ 
      (  ___  )
       \\_____/`,
    
    `        /\\_/\\  
       ( o.o ) 
        > ^ <  
       /  \\  \\ 
       (  ___  )
        \\_____/`,
        
    `       /\\_/\\  
      ( o.o ) 
       > ^ <  
      /|    \\ 
      (  ___  )
       \\_____/`,
       
    `      /\\_/\\  
     ( o.o ) 
      > ^ <  
    |\\    \\ 
    (  ___  )
     \\_____/`,
     
    `     /\\_/\\  
    ( o.o ) 
     > ^ <  
   \\|     \\ 
   (  ___  )
    \\_____/`,
    
    `    /\\_/\\  
   ( o.o ) 
    > ^ <  
  \\|     \\ 
  (  ___  )
   \\_____/`
]

// 新增：伸腿动作
const stretchFrames = [
    `     /\\_/\\  
    ( o.o ) 
     > ^ <  
    /     \\ 
   (  ___  )
    \\_____/`,
      
    `     /\\_/\\  
    ( o.o ) 
     > ^ <  
    /     \\ 
   (  ___  )
    \\_____/`,
     
    `     /\\_/\\  
    ( o.o ) 
     > ^ <  
    /     \\ 
   (  ___  )
    \\_____/`,
    
    `     /\\_/\\  
    ( o.o ) 
     > ^ <  
    /     \\ 
   (  ___  )
    \\_____/`
]

// 新增：摆尾动作
const tailWagFrames = [
    `     /\\_/\\  
    ( >.< ) 
     > ^ <  
    /     \\~
   (  ___  )
    \\_____/`,
    
    `      /\\_/\\  
     ( >.< ) 
      > ^ <  
     /     \\/
    (  ___  )
     \\_____/`,
    
    `       /\\_/\\  
      ( >.< ) 
       > ^ <  
      /     \\|
     (  ___  )
      \\_____/`,
    
    `        /\\_/\\  
       ( >.< ) 
        > ^ <  
       /     \\ 
      (  ___  )\\
       \\_____/`,
    
    `       /\\_/\\  
      ( >.< ) 
       > ^ <  
      /     \\ 
     (  ___  )/
      \\_____/`,
    
    `      /\\_/\\  
     ( >.< ) 
      > ^ <  
     /     \\ 
    (  ___  )|
     \\_____/`,
     
    `     /\\_/\\  
    ( >.< ) 
     > ^ <  
    /     \\|
   (  ___  )
    \\_____/`,
    
    `    /\\_/\\  
   ( >.< ) 
    > ^ <  
   /     \\/
  (  ___  )
   \\_____/`,
   
    `   /\\_/\\  
  ( >.< ) 
   > ^ <  
  /     \\~
 (  ___  )
  \\_____/`,
  
    `    /\\_/\\  
   ( >.< ) 
    > ^ <  
   /     \\
  (  ___  )
   \\_____/`,
   
    `     /\\_/\\  
    ( >.< ) 
     > ^ <  
    /     \\
   (  ___  )
    \\_____/`
]

const SpinningCat = ({ 
    speed = 150, 
    fontSize = "14px", 
    color = "#333",
    blinkChance = 0.05,
    actionChance = 0.3 
}) => {
    const [currentFrame, setCurrentFrame] = useState(0)
    const [currentAction, setCurrentAction] = useState('spin')
    const [actionFrameCount, setActionFrameCount] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            // 更新帧
            setCurrentFrame(prev => {
                let frames
                if (Math.random() < blinkChance && currentAction === 'spin') {
                    frames = blinkFrames
                } else {
                    switch (currentAction) {
                        case 'wave': frames = waveFrames; break
                        case 'tailWag': frames = tailWagFrames; break
                        default: frames = catFrames; break
                    }
                }
                const nextFrame = (prev + 1) % frames.length
                return nextFrame
            })
            
            // 更新动作计数
            setActionFrameCount(prev => {
                if (prev > 0) {
                    return prev - 1
                } else {
                    // 动作结束，决定是否切换新动作
                    if (Math.random() < actionChance) {
                        const actions = ['spin', 'wave', 'tailWag']
                        const newAction = actions[Math.floor(Math.random() * actions.length)]
                        setCurrentAction(newAction)
                        return getActionDuration(newAction)
                    } else {
                        setCurrentAction('spin')
                        return 0
                    }
                }
            })
        }, speed)

        return () => clearInterval(interval)
    }, [speed, actionChance, currentAction])

    const getActionDuration = (action: string) => {
        switch (action) {
            case 'wave': return 8
            case 'stretch': return 6
            case 'tailWag': return 12
            case 'jump': return 10
            default: return 0
        }
    }

    let frames
    if (Math.random() < blinkChance && currentAction === 'spin') {
        frames = blinkFrames
    } else {
        switch (currentAction) {
            case 'wave': frames = waveFrames; break
            case 'stretch': frames = stretchFrames; break
            case 'tailWag': frames = tailWagFrames; break
            default: frames = catFrames; break
        }
    }

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

export default SpinningCat