import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NobodySMS - Nobody社区短信验证服务",
  description: "Nobody社区提供的专业短信验证码服务平台",
  icons: {
    icon: "/nobody-logo.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/nobody-logo.png" type="image/png" />
        <link rel="shortcut icon" href="/nobody-logo.png" type="image/png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
