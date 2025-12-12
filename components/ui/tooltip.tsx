"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProviderProps {
    children: React.ReactNode
    delayDuration?: number
}

const TooltipProvider = ({ children }: TooltipProviderProps) => {
    return <>{children}</>
}

interface TooltipContextValue {
    open: boolean
    setOpen: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined)

function Tooltip({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)

    return (
        <TooltipContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-flex">
                {children}
            </div>
        </TooltipContext.Provider>
    )
}

function TooltipTrigger({
    children,
    asChild,
}: {
    children: React.ReactNode
    asChild?: boolean
}) {
    const context = React.useContext(TooltipContext)
    if (!context) throw new Error("TooltipTrigger must be used within Tooltip")

    const handleMouseEnter = () => context.setOpen(true)
    const handleMouseLeave = () => context.setOpen(false)

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<{
            onMouseEnter?: () => void
            onMouseLeave?: () => void
        }>, {
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
        })
    }

    return (
        <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {children}
        </span>
    )
}

function TooltipContent({
    className,
    sideOffset = 4,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number }) {
    const context = React.useContext(TooltipContext)
    if (!context) throw new Error("TooltipContent must be used within Tooltip")

    if (!context.open) return null

    return (
        <div
            className={cn(
                "absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
                "bottom-full left-1/2 -translate-x-1/2 mb-2",
                className
            )}
            style={{ marginBottom: sideOffset }}
            {...props}
        >
            {children}
        </div>
    )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
