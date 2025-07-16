"use client"

import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/copy-button"
import { cn } from "@/lib/utils"

interface CopyableTextProps {
  text: string
  label?: string
  className?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  showCopyButton?: boolean
  animate?: boolean
}

export function CopyableText({
  text,
  label,
  className,
  badgeVariant = "outline",
  showCopyButton = true,
  animate = false,
}: CopyableTextProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Badge
        variant={badgeVariant}
        className={cn(
          "font-mono select-all cursor-pointer hover:bg-opacity-80 transition-all",
          animate && "animate-pulse",
        )}
        title="点击选择文本"
      >
        {label && <span className="mr-1">{label}:</span>}
        {text}
      </Badge>
      {showCopyButton && <CopyButton text={text} className="h-6 w-6 p-0" successMessage="已复制!" />}
    </div>
  )
}
