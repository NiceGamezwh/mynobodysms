"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "ghost" | "secondary"
  showText?: boolean
  successMessage?: string
}

export function CopyButton({
  text,
  className,
  size = "sm",
  variant = "outline",
  showText = false,
  successMessage = "已复制",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // 降级方案
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        textArea.remove()
      }

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("复制失败:", err)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        "transition-all duration-200",
        copied && "bg-green-100 border-green-300 text-green-700",
        "hover:scale-105",
        className,
      )}
      title={copied ? successMessage : `复制 ${text}`}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          {showText && <span className="ml-1">{successMessage}</span>}
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          {showText && <span className="ml-1">复制</span>}
        </>
      )}
    </Button>
  )
}
