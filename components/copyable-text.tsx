import type React from "react"
import { cn } from "@/lib/utils"

interface CopyableTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string
}

export function CopyableText({ text, className, ...props }: CopyableTextProps) {
  return (
    <span className={cn("font-mono text-sm text-gray-800 select-all", className)} {...props}>
      {text}
    </span>
  )
}
