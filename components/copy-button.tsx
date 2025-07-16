"use client"

import type React from "react"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  textToCopy: string
}

export function CopyButton({ textToCopy, className, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textToCopy)
    setHasCopied(true)
    toast({
      title: "已复制",
      description: "内容已复制到剪贴板",
    })
    setTimeout(() => {
      setHasCopied(false)
    }, 2000)
  }

  return (
    <Button size="icon" variant="ghost" onClick={copyToClipboard} className={className} {...props}>
      {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="sr-only">复制</span>
    </Button>
  )
}
