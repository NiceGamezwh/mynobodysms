"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ShoppingBag,
  Clock,
  BookOpen,
  Shield,
  Info,
  MessageCircle,
  Wifi,
  WifiOff,
} from "lucide-react"
// import { AbortSignal } from "abortcontroller-polyfill"
/**
 * Returns an AbortSignal that will automatically abort
 * after `ms` milliseconds.
 * Native `AbortSignal.timeout()` is only available in very
 * new runtimes, so we create a small helper instead.
 */
const timeoutSignal = (ms: number): AbortSignal => {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [debugInfo, setDebugInfo] = useState("")
  const [mounted, setMounted] = useState(false)
  const [requestTime, setRequestTime] = useState<number>(0)
  const [networkStatus, setNetworkStatus] = useState<"checking" | "online" | "offline">("checking")
  const [canUseDemo, setCanUseDemo] = useState(false)
  const router = useRouter()

  // 检查网络状态
  const checkNetworkStatus = async () => {
    setNetworkStatus("checking")
    try {
      // 简单的网络检查
      const response = await fetch("/api/health", {
        method: "GET",
        signal: timeoutSignal(3000), // 3 s 超时
      })
      if (response.ok) {
        setNetworkStatus("online")
      } else {
        setNetworkStatus("offline")
      }
    } catch (error) {
      setNetworkStatus("offline")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuggestion("")
    setCanUseDemo(false)
    setDebugInfo("🔄 正在连接服务器...")

    const startTime = Date.now()
    setRequestTime(0)

    const timeInterval = setInterval(() => {
      setRequestTime(Date.now() - startTime)
    }, 100)

    try {
      setDebugInfo("🌐 正在验证用户信息...")

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
        signal: timeoutSignal(15000), // 15 s 超时
      })

      clearInterval(timeInterval)

      const elapsed = Date.now() - startTime
      console.log("响应状态:", response.status, "耗时:", elapsed + "ms")

      const responseText = await response.text()

      if (responseText.trim().startsWith("<!DOCTYPE") || responseText.includes("<html")) {
        setError("服务器配置错误，请联系管理员")
        setSuggestion("建议使用演示模式：用户名 demo，密码 demo123")
        setCanUseDemo(true)
        return
      }

      let data
      try {
        if (responseText.trim()) {
          data = JSON.parse(responseText)
        } else {
          throw new Error("服务器返回空响应")
        }
      } catch (parseError) {
        console.error("JSON解析错误:", parseError)
        setError("服务器响应格式错误")
        setSuggestion("建议使用演示模式：用户名 demo，密码 demo123")
        setCanUseDemo(true)
        return
      }

      console.log("解析后的数据:", data)

      if (response.ok && data.success && data.token) {
        localStorage.setItem("auth_token", data.token)
        console.log("Token 已保存到本地存储")

        if (data.data) {
          localStorage.setItem("user_info", JSON.stringify(data.data))
          console.log("用户信息已保存")
        }

        const modeText = data.isDemo ? "演示模式" : "真实API"
        setDebugInfo(`✅ ${modeText}登录成功！耗时 ${elapsed}ms，正在跳转...`)

        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        const errorMessage = data.error || "登录失败"
        setError(errorMessage)

        if (data.suggestion) {
          setSuggestion(data.suggestion)
        }

        if (data.networkHelp) {
          setDebugInfo(data.networkHelp)
        }

        if (data.canUseDemo) {
          setCanUseDemo(true)
        }
      }
    } catch (error) {
      clearInterval(timeInterval)
      const elapsed = Date.now() - startTime
      console.error("登录请求错误:", error)

      if (error instanceof Error && error.name === "AbortError") {
        setError("请求超时，服务器响应过慢")
        setSuggestion("请尝试使用演示账号：用户名 demo，密码 demo123")
        setCanUseDemo(true)
        setDebugInfo("可能的原因：1) API服务器响应慢 2) 网络连接不稳定 3) 防火墙限制")
      } else if (error instanceof TypeError && error.message.includes("fetch")) {
        setError("网络连接失败，请检查网络连接")
        setSuggestion("请尝试使用演示账号：用户名 demo，密码 demo123")
        setCanUseDemo(true)
        setDebugInfo("可能的原因：1) 网络连接问题 2) 防火墙阻止 3) CORS限制")
      } else {
        setError("登录请求失败，请稍后重试")
        setSuggestion("请尝试使用演示账号：用户名 demo，密码 demo123")
        setCanUseDemo(true)
      }
    } finally {
      setLoading(false)
      clearInterval(timeInterval)
    }
  }

  const handleDemoLogin = () => {
    setUsername("demo")
    setPassword("demo123")
  }

  useEffect(() => {
    setMounted(true)
    checkNetworkStatus()

    // 检查是否已经登录
    const token = localStorage.getItem("auth_token")
    if (token) {
      console.log("发现已存在的 token，跳转到 dashboard")
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen nobody-background">
      {/* 半透明覆盖层 */}
      <div className="min-h-screen nobody-overlay">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="min-h-screen flex items-center justify-center">
            <Card
              className={`w-full max-w-md nobody-card ${mounted ? "animate-in slide-in-from-bottom-4 duration-500" : "opacity-0"}`}
            >
              <CardHeader className="space-y-1 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <img src="/nobody-logo.png" alt="Nobody Logo" className="h-12 w-12 rounded-full" />
                  <div>
                    <CardTitle className="text-2xl font-bold text-black">NobodySMS</CardTitle>
                    <p className="text-sm text-black/70">Nobody社区 · 专业短信验证服务</p>
                  </div>
                </div>
                <CardDescription className="text-center">请输入您的账号信息</CardDescription>

                {/* 网络状态显示 */}
                <div className="flex items-center justify-center space-x-2">
                  {networkStatus === "checking" && (
                    <div className="flex items-center space-x-1 text-yellow-600 text-xs">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>检查网络状态...</span>
                    </div>
                  )}
                  {networkStatus === "online" && (
                    <div className="flex items-center space-x-1 text-green-600 text-xs">
                      <Wifi className="h-3 w-3" />
                      <span>网络连接正常</span>
                    </div>
                  )}
                  {networkStatus === "offline" && (
                    <div className="flex items-center space-x-1 text-red-600 text-xs">
                      <WifiOff className="h-3 w-3" />
                      <span>网络连接异常</span>
                      <Button variant="ghost" size="sm" onClick={checkNetworkStatus} className="h-4 px-1 text-xs">
                        重试
                      </Button>
                    </div>
                  )}
                </div>

                {/* 请求时间显示 */}
                {loading && requestTime > 0 && (
                  <div className="flex items-center justify-center space-x-1 text-orange-600 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>连接中 {(requestTime / 1000).toFixed(1)}s</span>
                    {requestTime > 8000 && <span className="text-red-600">(请求较慢，建议使用演示模式)</span>}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {/* 企业微信客服 */}
                <Alert className="mb-4 border-blue-200 bg-blue-50/90 animate-in fade-in-50 duration-300 backdrop-blur-sm">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>💬 企业微信客服</strong>
                        <br />
                        <span className="text-sm">点击按钮联系客服获取技术支持</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open("https://work.weixin.qq.com/ca/cawcde545684bd4afc", "_blank")}
                        className="ml-2 text-blue-700 border-blue-300 hover:bg-blue-100"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        联系客服
                      </Button>
                    </div>
                    <p className="text-xs mt-1">遇到问题请点击按钮联系企业微信客服</p>
                  </AlertDescription>
                </Alert>

                {/* 演示模式提示 */}
                <Alert
                  className={`mb-4 border-blue-200 bg-blue-50/90 animate-in fade-in-50 duration-500 backdrop-blur-sm ${canUseDemo ? "border-yellow-300 bg-yellow-50/90" : ""}`}
                >
                  <Info className={`h-4 w-4 ${canUseDemo ? "text-yellow-600" : "text-blue-600"}`} />
                  <AlertDescription className={canUseDemo ? "text-yellow-800" : "text-blue-800"}>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{canUseDemo ? "🎯 推荐使用演示模式" : "🎭 演示模式推荐"}</strong>
                        <br />
                        <span className="text-xs">用户名: demo，密码: demo123</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDemoLogin}
                        className={`ml-2 ${canUseDemo ? "text-yellow-700 border-yellow-300 hover:bg-yellow-100 animate-pulse" : "text-blue-700 border-blue-300 hover:bg-blue-100"}`}
                      >
                        快速填入
                      </Button>
                    </div>
                    <p className="text-xs mt-1">
                      {canUseDemo
                        ? "真实API暂时无法连接，建议使用演示模式体验功能"
                        : networkStatus === "offline"
                          ? "网络异常时建议使用演示模式"
                          : "可以先体验演示功能"}
                    </p>
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="请输入用户名或使用 demo"
                      required
                      disabled={loading}
                      className="border-yellow-200 focus:border-yellow-400 transition-colors bg-white/90"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码或使用 demo123"
                      required
                      disabled={loading}
                      className="border-yellow-200 focus:border-yellow-400 transition-colors bg-white/90"
                    />
                  </div>

                  {debugInfo && (
                    <Alert className="border-yellow-200 bg-yellow-50/90 animate-in slide-in-from-top-2 backdrop-blur-sm">
                      <CheckCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">{debugInfo}</AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert
                      variant="destructive"
                      className="animate-in slide-in-from-top-2 bg-red-50/90 backdrop-blur-sm"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {suggestion && (
                    <Alert className="border-green-200 bg-green-50/90 animate-in slide-in-from-top-2 backdrop-blur-sm">
                      <Info className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>💡 建议：</strong>
                        <br />
                        {suggestion}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full nobody-button hover:scale-105 transition-transform"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? `连接中... ${requestTime > 0 ? `(${(requestTime / 1000).toFixed(1)}s)` : ""}` : "登录"}
                  </Button>
                </form>

                {/* 网络问题说明 */}
                {(networkStatus === "offline" || canUseDemo) && (
                  <Alert className="mt-4 border-orange-200 bg-orange-50/90 animate-in fade-in-50 duration-700 backdrop-blur-sm">
                    <WifiOff className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-xs text-orange-800">
                      <strong>🌐 连接问题说明</strong>
                      <br />• API服务器可能响应较慢或不可用
                      <br />• 可能被防火墙或网络限制阻止
                      <br />• 建议使用演示模式体验完整功能
                      <br />• 演示模式包含所有功能的模拟数据
                    </AlertDescription>
                  </Alert>
                )}

                {/* 使用说明 */}
                <Alert className="mt-4 border-blue-200 bg-blue-50/90 animate-in fade-in-50 duration-700 backdrop-blur-sm">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-800">
                    <strong>📖 使用说明</strong>
                    <br />• 登录后可获取手机号进行短信验证
                    <br />• 获取手机号免费，仅收到验证码时扣费
                    <br />• 支持多种运营商和指定号段
                    <br />• 未收到短信不会产生费用
                  </AlertDescription>
                </Alert>

                {/* 安全提示 */}
                <Alert className="mt-4 border-green-200 bg-green-50/90 animate-in fade-in-50 duration-1000 backdrop-blur-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-xs text-green-800">
                    <strong>🔒 安全保障</strong>
                    <br />• 仅成功收费原则，未收到短信不扣费
                    <br />• 支持手机号释放和黑名单功能
                    <br />• 多端点容错，确保服务稳定性
                  </AlertDescription>
                </Alert>

                <div className="mt-4 p-3 bg-gradient-to-r from-gray-50/90 to-blue-50/90 rounded-lg border border-gray-200 animate-in slide-in-from-bottom-4 duration-700 backdrop-blur-sm">
                  <div className="text-center mb-3">
                    <p className="text-xs text-gray-600 font-semibold mb-2">🔗 官方社交媒体</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="https://x.com/realnobodyxyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-3 bg-white/90 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/90 transition-all duration-300 hover:scale-105 hover:shadow-md backdrop-blur-sm"
                    >
                      <div className="w-8 h-8 mb-2 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-black">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">Nobody官方</span>
                      <span className="text-xs text-gray-500">@realnobodyxyz</span>
                    </a>

                    <a
                      href="https://m.tb.cn/h.hd3s5xz?tk=AkWbVFhrfq5"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-3 bg-white/90 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50/90 transition-all duration-300 hover:scale-105 hover:shadow-md backdrop-blur-sm"
                    >
                      <div className="w-8 h-8 mb-2 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-orange-600" />
                      </div>
                      <span className="text-sm text-orange-700 font-medium">闲鱼官方</span>
                      <span className="text-xs text-gray-500 flex items-center">
                        Nobody店铺
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </span>
                    </a>
                  </div>
                </div>

                <div className="mt-4 text-center animate-in fade-in-50 duration-1000">
                  <p className="text-xs text-gray-500">
                    Powered by{" "}
                    <a
                      href="https://nobody.xyz/zh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-600 hover:text-yellow-700 transition-colors hover:scale-105 inline-block"
                    >
                      Nobody社区
                    </a>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Every Nobody is Somebody</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
