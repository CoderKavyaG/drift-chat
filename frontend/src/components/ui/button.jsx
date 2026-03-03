import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] disabled:pointer-events-none disabled:opacity-40 active:scale-95",
    {
        variants: {
            variant: {
                default: "bg-blue-600 text-white shadow hover:bg-blue-500",
                destructive: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
                outline: "border border-[#2a2a2a] bg-transparent text-[#9ca3af] hover:border-blue-500 hover:text-white",
                ghost: "text-[#9ca3af] hover:bg-[#1a1a1a] hover:text-white",
                warning: "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20",
                success: "bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20",
                muted: "bg-[#1a1a1a] text-[#6b7280] border border-[#2a2a2a] hover:text-white",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 px-3 text-xs",
                lg: "h-11 px-8 text-base",
                icon: "h-9 w-9",
                "icon-sm": "h-7 w-7",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
    )
}

export { Button, buttonVariants }
