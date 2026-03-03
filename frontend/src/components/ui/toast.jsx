import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

function ToastViewport({ className, ...props }) {
    return (
        <ToastPrimitives.Viewport
            className={cn(
                "fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-[360px] flex-col gap-2 p-4",
                className
            )}
            {...props}
        />
    )
}

function Toast({ className, variant = "default", ...props }) {
    return (
        <ToastPrimitives.Root
            className={cn(
                "group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111111] p-4 shadow-xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
                variant === "destructive" && "border-red-500/30 bg-red-500/10",
                className
            )}
            {...props}
        />
    )
}

function ToastTitle({ className, ...props }) {
    return <ToastPrimitives.Title className={cn("text-sm font-semibold text-white", className)} {...props} />
}

function ToastDescription({ className, ...props }) {
    return <ToastPrimitives.Description className={cn("text-xs text-[#6b7280]", className)} {...props} />
}

function ToastClose({ className, ...props }) {
    return (
        <ToastPrimitives.Close
            className={cn("absolute right-2 top-2 rounded-md p-1 text-[#6b7280] opacity-0 hover:text-white group-hover:opacity-100 transition-opacity", className)}
            {...props}
        >
            <X className="h-4 w-4" />
        </ToastPrimitives.Close>
    )
}

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Action
        ref={ref}
        className={cn("inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[#2a2a2a] bg-transparent px-3 text-xs font-medium text-blue-400 hover:bg-[#1a1a1a] transition-colors", className)}
        {...props}
    />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction }
