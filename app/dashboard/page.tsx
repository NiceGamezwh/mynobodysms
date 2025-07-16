"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Phone,
  MessageSquare,
  DollarSign,
  User,
  RefreshCw,
  AlertCircle,
  Loader2,
  Search,
  Info,
  CheckCircle,
  Ban,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CopyButton } from "@/components/copy-button"
import { CopyableText } from "@/components/copyable-text"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar" // Keep SidebarTrigger and useSidebar
import { AppSidebar } from "@/components/app-sidebar" // Import the new AppSidebar component

interface UserInfo {
  id: string
  money: string
  isDemo?: boolean
}

interface MobileNumber {
  mobile: string
  project_id: string
  operator?: string
  area_code?: string
  timestamp: string
}

interface Message {
  id: string
  mobile: string
  code: string
  message: string
  timestamp: string
}

interface Project {
  id: string
  name: string
  icon: React.ElementType
}

const defaultProjects: Project[] = [
  { id: "1", name: "Telegram", icon: MessageSquare },
  { id: "2", name: "WhatsApp", icon: MessageSquare },
  { id: "3", name: "Google", icon: Search },
  { id: "4", name: "Facebook", icon: User },
  { id: "5", name: "Other", icon: Info },
]

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [mobileNumber, setMobileNumber] = useState<MobileNumber | null>(null)
  const [message, setMessage] = useState<Message | null>(null)
  const [loadingMobile, setLoadingMobile] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(false)
  const [loadingRelease, setLoadingRelease] = useState(false)
  const [loadingBlacklist, setLoadingBlacklist] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [operator, setOperator] = useState<string | undefined>(undefined)
  const [areaCode, setAreaCode] = useState<string | undefined>(undefined)
  const [projects, setProjects] = useState<Project[]>(defaultProjects) // 使用默认项目

  const fetchUserInfo = useCallback(async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch("/api/user/info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok && data.code === 0) {
        setUserInfo({
          id: data.data.username,
          money: data.data.money,
          isDemo: data.isDemo || false,
        })
        localStorage.setItem("user_info", JSON.stringify(data.data))
      } else {
        setError(data.msg || "Failed to fetch user info")
        toast({
          title: "获取用户信息失败",
          description: data.msg || "请重新登录",
          variant: "destructive",
        })
        router.push("/login")
      }
    } catch (err) {
      console.error("Error fetching user info:", err)
      setError("无法连接到服务器，请检查网络")
      toast({
        title: "网络错误",
        description: "无法连接到服务器，请检查网络",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [router, toast])

  const getMobile = useCallback(async () => {
    if (!selectedProject) {
      setError("请选择一个项目")
      return
    }
    setLoadingMobile(true)
    setError(null)
    setMobileNumber(null)
    setMessage(null) // Clear previous message
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/sms/get-mobile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: selectedProject,
          operator: operator,
          area_code: areaCode,
        }),
      })
      const data = await response.json()
      if (response.ok && data.code === 0 && data.data && data.data.mobile) {
        setMobileNumber({
          mobile: data.data.mobile,
          project_id: selectedProject,
          timestamp: new Date().toLocaleString(),
        })
        toast({
          title: "手机号获取成功",
          description: `已获取手机号: ${data.data.mobile}`,
        })
      } else {
        setError(data.msg || "获取手机号失败")
        toast({
          title: "获取手机号失败",
          description: data.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error getting mobile:", err)
      setError("获取手机号请求失败")
      toast({
        title: "网络错误",
        description: "获取手机号请求失败",
        variant: "destructive",
      })
    } finally {
      setLoadingMobile(false)
    }
  }, [selectedProject, operator, areaCode, toast])

  const getMessage = useCallback(async () => {
    if (!mobileNumber) {
      setError("请先获取手机号")
      return
    }
    setLoadingMessage(true)
    setError(null)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/sms/get-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mobile: mobileNumber.mobile,
          project_id: mobileNumber.project_id,
        }),
      })
      const data = await response.json()
      if (response.ok && data.code === 0 && data.data && data.data.code) {
        setMessage({
          id: data.data.id,
          mobile: mobileNumber.mobile,
          code: data.data.code,
          message: data.data.message,
          timestamp: new Date().toLocaleString(),
        })
        toast({
          title: "短信获取成功",
          description: `验证码: ${data.data.code}`,
        })
        fetchUserInfo() // Refresh user balance
      } else {
        setError(data.msg || "获取短信失败")
        toast({
          title: "获取短信失败",
          description: data.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error getting message:", err)
      setError("获取短信请求失败")
      toast({
        title: "网络错误",
        description: "获取短信请求失败",
        variant: "destructive",
      })
    } finally {
      setLoadingMessage(false)
    }
  }, [mobileNumber, toast, fetchUserInfo])

  const releaseMobile = useCallback(async () => {
    if (!mobileNumber) {
      setError("没有可释放的手机号")
      return
    }
    setLoadingRelease(true)
    setError(null)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/sms/release-mobile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mobile: mobileNumber.mobile }),
      })
      const data = await response.json()
      if (response.ok && data.code === 0) {
        setMobileNumber(null)
        setMessage(null)
        toast({
          title: "手机号释放成功",
          description: "该手机号已成功释放",
        })
        fetchUserInfo() // Refresh user balance
      } else {
        setError(data.msg || "释放手机号失败")
        toast({
          title: "释放手机号失败",
          description: data.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error releasing mobile:", err)
      setError("释放手机号请求失败")
      toast({
        title: "网络错误",
        description: "释放手机号请求失败",
        variant: "destructive",
      })
    } finally {
      setLoadingRelease(false)
    }
  }, [mobileNumber, toast, fetchUserInfo])

  const blacklistMobile = useCallback(async () => {
    if (!mobileNumber) {
      setError("没有可拉黑的手机号")
      return
    }
    setLoadingBlacklist(true)
    setError(null)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/sms/blacklist-mobile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mobile: mobileNumber.mobile }),
      })
      const data = await response.json()
      if (response.ok && data.code === 0) {
        setMobileNumber(null)
        setMessage(null)
        toast({
          title: "手机号拉黑成功",
          description: "该手机号已成功加入黑名单",
        })
        fetchUserInfo() // Refresh user balance
      } else {
        setError(data.msg || "拉黑手机号失败")
        toast({
          title: "拉黑手机号失败",
          description: data.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error blacklisting mobile:", err)
      setError("拉黑手机号请求失败")
      toast({
        title: "网络错误",
        description: "拉黑手机号请求失败",
        variant: "destructive",
      })
    } finally {
      setLoadingBlacklist(false)
    }
  }, [mobileNumber, toast, fetchUserInfo])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_info")
    router.push("/login")
  }, [router])

  useEffect(() => {
    fetchUserInfo()
  }, [fetchUserInfo])

  // useSidebar is now safe to call here because SidebarProvider is in layout.tsx
  const { toggleSidebar } = useSidebar()

  return (
    <div className="flex">
      {" "}
      {/* Removed SidebarProvider wrapper */}
      <AppSidebar
        userInfo={userInfo}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        projects={projects}
        handleLogout={handleLogout}
      />
      <div className="flex flex-col flex-1 min-h-screen bg-gray-50">
        <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
          <SidebarTrigger className="-ml-1 md:hidden" /> {/* Mobile trigger */}
          <h1 className="text-2xl font-bold text-gray-800">仪表盘</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={fetchUserInfo} disabled={loadingMobile || loadingMessage}>
              <RefreshCw className="h-5 w-5 text-gray-600" />
              <span className="sr-only">刷新余额</span>
            </Button>
            <Button onClick={handleLogout} variant="outline">
              退出登录
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">当前余额</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥ {userInfo?.money || "0.00"}</div>
                <p className="text-xs text-muted-foreground">{userInfo?.isDemo ? "演示模式余额" : "实时余额"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">用户ID</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userInfo?.id || "N/A"}</div>
                <p className="text-xs text-muted-foreground">您的唯一标识符</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">已选项目</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Select onValueChange={setSelectedProject} value={selectedProject || ""}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择一个项目" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">用于获取手机号和短信</p>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* 获取手机号卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" /> 获取手机号
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="operator">运营商 (可选)</Label>
                  <Input
                    id="operator"
                    placeholder="例如: China Mobile"
                    value={operator || ""}
                    onChange={(e) => setOperator(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaCode">区号 (可选)</Label>
                  <Input
                    id="areaCode"
                    placeholder="例如: +86"
                    value={areaCode || ""}
                    onChange={(e) => setAreaCode(e.target.value)}
                  />
                </div>
                <Button onClick={getMobile} className="w-full" disabled={loadingMobile || !selectedProject}>
                  {loadingMobile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 获取中...
                    </>
                  ) : (
                    "获取手机号"
                  )}
                </Button>
                {mobileNumber && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>手机号已获取</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                      <CopyableText text={mobileNumber.mobile} />
                      <CopyButton textToCopy={mobileNumber.mobile} />
                    </AlertDescription>
                    <p className="text-xs text-muted-foreground mt-2">获取时间: {mobileNumber.timestamp}</p>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 获取短信卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" /> 获取短信
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={getMessage} className="w-full" disabled={loadingMessage || !mobileNumber}>
                  {loadingMessage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 获取中...
                    </>
                  ) : (
                    "获取短信"
                  )}
                </Button>
                {message && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>短信已获取</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                      <CopyableText text={message.code} />
                      <CopyButton textToCopy={message.code} />
                    </AlertDescription>
                    <p className="text-xs text-muted-foreground mt-2">
                      完整消息: {message.message}
                      <br />
                      获取时间: {message.timestamp}
                    </p>
                  </Alert>
                )}
                <div className="flex space-x-2">
                  <Button
                    onClick={releaseMobile}
                    className="w-full bg-transparent"
                    variant="outline"
                    disabled={loadingRelease || !mobileNumber}
                  >
                    {loadingRelease ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 释放中...
                      </>
                    ) : (
                      "释放手机号"
                    )}
                  </Button>
                  <Button
                    onClick={blacklistMobile}
                    className="w-full"
                    variant="destructive"
                    disabled={loadingBlacklist || !mobileNumber}
                  >
                    {loadingBlacklist ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 拉黑中...
                      </>
                    ) : (
                      <>
                        <Ban className="mr-2 h-4 w-4" /> 拉黑手机号
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
