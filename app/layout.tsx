import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { cookies } from "next/headers" // Import cookies
import { SidebarProvider } from "@/components/ui/sidebar" // Import SidebarProvider

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NobodySMS - 专业短信验证服务",
  description: "Nobody社区提供的专业短信验证服务，安全、高效、稳定。",
    generator: 'v0.dev'
}

export default async function RootLayout({
  // Make it async to use cookies
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultOpen={defaultOpen}>
            {" "}
            {/* Wrap children with SidebarProvider */}
            {children}
            <Toaster />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
