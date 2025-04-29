"use client"

import React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-[#E3DACC] bg-transparent px-3 py-2 text-sm placeholder:text-[#BFB8AC] focus:outline-none focus:ring-1 focus:ring-[#C96442] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#BFB8AC]/30 dark:placeholder:text-[#BFB8AC]/60",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }