import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }) {
    return (
        <div
            className={cn("rounded-xl border border-[#2a2a2a] bg-[#111111] text-[#e5e7eb] shadow-sm", className)}
            {...props}
        />
    )
}

function CardHeader({ className, ...props }) {
    return <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />
}

function CardTitle({ className, ...props }) {
    return <h3 className={cn("font-semibold leading-none tracking-tight text-white", className)} {...props} />
}

function CardDescription({ className, ...props }) {
    return <p className={cn("text-sm text-[#6b7280]", className)} {...props} />
}

function CardContent({ className, ...props }) {
    return <div className={cn("p-5 pt-0", className)} {...props} />
}

function CardFooter({ className, ...props }) {
    return <div className={cn("flex items-center p-5 pt-0", className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
