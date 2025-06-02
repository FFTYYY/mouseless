import * as React from "react"
import {
    Box, 
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"

import {
    useKeyEvents,
    KeyName,
} from "mouseless"

export { CurKey }

function CurKey({}:{}){

    const holding_keys: KeyName[] = useKeyEvents(store=>store.holding_keys)

    return <Box sx={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 1,
    }}>
        <AnimatePresence>
            {holding_keys.map((key, index) => (
                <motion.div
                    key={key}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    style={{
                        padding: "4px 8px",
                        backgroundColor: "#e0e0e0",
                        borderRadius: "4px",
                        fontSize: "14px",
                    }}
                >
                    {key}
                </motion.div>
            ))}
        </AnimatePresence>
    </Box>
}