import * as React from "react"
import {
    Box , 
} from "@mui/material"

import {
    useKeyEventHandlers, 
    useKeyDownUpProxy,
} from "mouseless"

export { CurKey }

function CurKey({}:{}){

    const [keys, set_keys] = React.useState<string[]>([])
    const [add_keydown_handler, del_keydown_handler] = useKeyEventHandlers(
        store=>[
            store.add_keydown_handler,
            store.del_keydown_handler,
        ]
    )
    const [add_keyup_handler, del_keyup_handler] = useKeyEventHandlers(
        store=>[
            store.add_keyup_handler,
            store.del_keyup_handler,
        ]
    )

    React.useEffect(() => {
        const on_keydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
            console.log("keydown", event.key)
            set_keys((prev_keys) => {
                if(prev_keys.includes(event.key)){
                    return prev_keys
                }
                return [...prev_keys, event.key]
            })
        }
        const on_keyup = (event: React.KeyboardEvent<HTMLDivElement>) => {
            set_keys((prev_keys) => prev_keys.filter((key) => key !== event.key))
        }
        add_keydown_handler(on_keydown)
        add_keyup_handler  (on_keyup)
        return () => {
            del_keydown_handler(on_keydown)
            del_keyup_handler(on_keyup)
        }
    }, [add_keydown_handler, add_keyup_handler, del_keydown_handler, del_keyup_handler])

    return <Box sx={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 1,
    }}>
        {keys.map((key, index) => (
            <Box key={index}>{key}</Box>
        ))}
    </Box>
}