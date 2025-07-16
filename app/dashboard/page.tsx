"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  Phone,
  MessageSquare,
  Trash2,
  Ban,
  LogOut,
  Users,
  Info,
  BookOpen,
  Clock,
  Copy,
  Search,
  ExternalLink,
} from "lucide-react"
import { formatPrice, formatBalance } from "@/utils/pricing"
import { SocialMediaSection } from "@/components/social-media"
import { ProjectSelector } from "@/components/project-selector"
import { UsageGuide } from "@/components/usage-guide"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { CopyButton } from "@/components/copy-button"
import { CopyableText } from "@/components/copyable-text"

interface UserInfo {
  money: string
  id: string
}

interface PhoneRecord {
  mobile: string
  project_id: string
  project_name?: string
  project_price?: number
  timestamp: number
  isReleased?: boolean
  messages: Array<{
    code: string
    content: string
    timestamp: number
  }>
}

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [projectId, setProjectId] = useState("")
  const [selectedProjectPrice, setSelectedProjectPrice] = useState<number>(0.3)
  const [phoneRecords, setPhoneRecords] = useState<PhoneRecord[]>([])
  const [operator, setOperator] = useState("0")
  const [phoneNum, setPhoneNum] = useState("")
  const [scope, setScope] = useState("")
  const [address, setAddress] = useState("")
  const [remainingCards, setRemainingCards] = useState("")
  const [requestTime, setRequestTime] = useState<number>(0)
  const [lastObtainedPhone, setLastObtainedPhone] = useState<string>("")
  const [lastReceivedCode, setLastReceivedCode] = useState<string>("")
  const router = useRouter()
  const [selectedUniqueId, setSelectedUniqueId] = useState("")
  const [batchPhones, setBatchPhones] = useState("")
  const [batchMode, setBatchMode] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 })
  const [batchResults, setBatchResults] = useState<
    Array<{ phone: string; success: boolean; mobile?: string; error?: string }>
  >([])
  // 添加删除功能相关的状态
  const [showDeleteOptions, setShowDeleteOptions] = useState<string>("")

  useEffect(() => {
    // 检查登录状态并获取用户信息
    const checkAuthAndFetchUserInfo = async () => {
      try {
        // 先尝试从 localStorage 获取 token
        const token = localStorage.getItem("auth_token")

        if (!token) {
          console.log("未找到 token，跳转到登录页")
          router.push("/login")
          return
        }

        console.log("找到 token，获取用户信息...")
        await fetchUserInfo(token)
      } catch (error) {
        console.error("检查认证状态失败:", error)
        router.push("/login")
      }
    }

    checkAuthAndFetchUserInfo()

    const savedRecords = localStorage.getItem("phoneRecords")
    if (savedRecords) {
      setPhoneRecords(JSON.parse(savedRecords))
    }
  }, [router])

  const fetchUserInfo = async (token?: string) => {
    const startTime = Date.now()
    try {
      // 如果没有传入 token，尝试从 localStorage 获取
      const authToken = token || localStorage.getItem("auth_token")

      if (!authToken) {
        console.log("未找到认证 token")
        router.push("/login")
        return
      }

      // 使用查询参数传递 token
      const response = await fetch(`/api/user/info?token=${encodeURIComponent(authToken)}`)
      const data = await response.json()
      const duration = Date.now() - startTime

      if (response.ok) {
        setUserInfo(data.data)
        console.log(`用户信息获取成功 (${duration}ms):`, data.data)
      } else if (response.status === 401) {
        console.log("认证失败，清除 token 并跳转到登录页")
        localStorage.removeItem("auth_token")
        router.push("/login")
      } else {
        setError(data.error || "获取用户信息失败")
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`获取用户信息网络错误 (${duration}ms):`, error)
      setError("网络错误")
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      localStorage.removeItem("auth_token") // 清除本地存储的 token
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      localStorage.removeItem("auth_token") // 即使请求失败也清除 token
      router.push("/login")
    }
  }

  const handleProjectSelect = (selectedUniqueId: string, price: number) => {
    const originalProjectId = selectedUniqueId.includes("_") ? selectedUniqueId.split("_")[0] : selectedUniqueId
    setProjectId(originalProjectId)
    setSelectedProjectPrice(price)
    setSelectedUniqueId(selectedUniqueId)
  }

  const getMobile = async () => {
    if (!projectId.trim()) {
      setError("请选择项目或输入项目ID")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")
    setLastObtainedPhone("")

    if (batchMode && batchPhones.trim()) {
      await handleBatchGetMobile()
    } else {
      await handleSingleGetMobile()
    }
  }

  const handleSingleGetMobile = async () => {
    const startTime = Date.now()
    setRequestTime(0)

    const timeInterval = setInterval(() => {
      setRequestTime(Date.now() - startTime)
    }, 100)

    try {
      const params = new URLSearchParams({
        project_id: projectId,
        ...(operator !== "0" && { operator }),
        ...(phoneNum && { phone_num: phoneNum }),
        ...(scope && { scope }),
        ...(address && { address }),
      })

      const response = await fetch(`/api/sms/get-mobile?${params}`)
      const data = await response.json()
      const duration = Date.now() - startTime

      clearInterval(timeInterval)

      if (response.ok && data.mobile) {
        const newRecord: PhoneRecord = {
          mobile: data.mobile,
          project_id: projectId,
          project_price: selectedProjectPrice,
          timestamp: Date.now(),
          messages: [],
        }

        const updatedRecords = [newRecord, ...phoneRecords]
        setPhoneRecords(updatedRecords)
        localStorage.setItem("phoneRecords", JSON.stringify(updatedRecords))

        setRemainingCards(data["1分钟内剩余取卡数"] || "")
        setLastObtainedPhone(data.mobile)
        setSuccess(`✅ 成功获取手机号: ${data.mobile} (免费获取，收到短信后才扣费) - 耗时 ${duration}ms`)

        setPhoneNum("")
        setScope("")
        setAddress("")
      } else {
        setError(data.error || "获取手机号失败")
      }
    } catch (error) {
      clearInterval(timeInterval)
      const duration = Date.now() - startTime
      console.error(`获取手机号失败 (${duration}ms):`, error)
      setError("网络错误")
    } finally {
      setLoading(false)
      clearInterval(timeInterval)
    }
  }

  const handleBatchGetMobile = async () => {
    const phoneList = batchPhones
      .split("\n")
      .map((phone) => phone.trim())
      .filter((phone) => phone)

    if (phoneList.length === 0) {
      setError("请输入要批量获取的手机号列表")
      setLoading(false)
      return
    }

    setBatchProgress({ current: 0, total: phoneList.length, success: 0, failed: 0 })
    setBatchResults([])

    const results: Array<{ phone: string; success: boolean; mobile?: string; error?: string }> = []
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < phoneList.length; i++) {
      const targetPhone = phoneList[i]
      setBatchProgress((prev) => ({ ...prev, current: i + 1 }))

      try {
        const params = new URLSearchParams({
          project_id: projectId,
          phone_num: targetPhone,
          ...(operator !== "0" && { operator }),
          ...(scope && { scope }),
          ...(address && { address }),
        })

        const response = await fetch(`/api/sms/get-mobile?${params}`)
        const data = await response.json()

        if (response.ok && data.mobile) {
          const newRecord: PhoneRecord = {
            mobile: data.mobile,
            project_id: projectId,
            project_price: selectedProjectPrice,
            timestamp: Date.now(),
            messages: [],
          }

          setPhoneRecords((prev) => {
            const updated = [newRecord, ...prev]
            localStorage.setItem("phoneRecords", JSON.stringify(updated))
            return updated
          })

          results.push({ phone: targetPhone, success: true, mobile: data.mobile })
          successCount++
          setBatchProgress((prev) => ({ ...prev, success: successCount }))
        } else {
          results.push({ phone: targetPhone, success: false, error: data.error || "获取失败" })
          failedCount++
          setBatchProgress((prev) => ({ ...prev, failed: failedCount }))
        }
      } catch (error) {
        results.push({ phone: targetPhone, success: false, error: "网络错误" })
        failedCount++
        setBatchProgress((prev) => ({ ...prev, failed: failedCount }))
      }

      setBatchResults([...results])

      // 添加延迟避免请求过快
      if (i < phoneList.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    setSuccess(`✅ 批量获取完成: 成功 ${successCount} 个，失败 ${failedCount} 个`)
    setLoading(false)
  }

  // 检查验证码（支持自动和手动）
  const checkMessage = async (mobile: string, project_id: string, isAutoCheck = false) => {
    if (!isAutoCheck) {
      setLoading(true)
      setError("")
      setLastReceivedCode("")
    }

    const startTime = Date.now()

    try {
      const params = new URLSearchParams({
        project_id,
        phone_num: mobile,
      })

      const response = await fetch(`/api/sms/get-message?${params}`)
      const data = await response.json()
      const duration = Date.now() - startTime

      if (response.ok) {
        if (data.code) {
          // 使用函数式更新确保状态正确更新
          setPhoneRecords((prevRecords) => {
            const updatedRecords = prevRecords.map((record) => {
              if (record.mobile === mobile && record.project_id === project_id) {
                const newMessage = {
                  code: data.code,
                  content: data.data[0]?.modle || "",
                  timestamp: Date.now(),
                }
                return {
                  ...record,
                  messages: [newMessage, ...record.messages],
                  isReleased: true,
                }
              }
              return record
            })

            // 同步更新localStorage
            localStorage.setItem("phoneRecords", JSON.stringify(updatedRecords))
            return updatedRecords
          })

          setLastReceivedCode(data.code)

          // 自动释放手机号
          try {
            const releaseParams = new URLSearchParams({
              project_id,
              phone_num: mobile,
            })

            const releaseResponse = await fetch(`/api/sms/release-mobile?${releaseParams}`)
            const releaseData = await releaseResponse.json()

            if (releaseResponse.ok) {
              const message = isAutoCheck
                ? `🎉 自动收到验证码: ${data.code} (已扣费，手机号已自动释放) - 耗时 ${duration}ms`
                : `🎉 收到验证码: ${data.code} (已扣费，手机号已自动释放) - 耗时 ${duration}ms`
              setSuccess(message)
            } else {
              const message = isAutoCheck
                ? `🎉 自动收到验证码: ${data.code} (已扣费，手机号释放失败: ${releaseData.error}) - 耗时 ${duration}ms`
                : `🎉 收到验证码: ${data.code} (已扣费，手机号释放失败: ${releaseData.error}) - 耗时 ${duration}ms`
              setSuccess(message)
            }
          } catch (releaseError) {
            console.error("自动释放手机号失败:", releaseError)
            const message = isAutoCheck
              ? `🎉 自动收到验证码: ${data.code} (已扣费，手机号自动释放失败) - 耗时 ${duration}ms`
              : `🎉 收到验证码: ${data.code} (已扣费，手机号自动释放失败) - 耗时 ${duration}ms`
            setSuccess(message)
          }

          // 刷新用户信息
          fetchUserInfo()
        } else {
          if (!isAutoCheck) {
            setError(`暂未收到短信，请稍后重试 (未扣费) - 耗时 ${duration}ms`)
          }
        }
      } else {
        if (!isAutoCheck) {
          setError(data.error || "获取短信失败")
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`获取短信失败 (${duration}ms):`, error)
      if (!isAutoCheck) {
        setError("网络错误")
      }
    } finally {
      if (!isAutoCheck) {
        setLoading(false)
      }
    }
  }

  // 释放手机号
  const releaseMobile = async (mobile: string, project_id: string) => {
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams({
        project_id,
        phone_num: mobile,
      })

      const response = await fetch(`/api/sms/release-mobile?${params}`)
      const data = await response.json()

      if (response.ok) {
        const updatedRecords = phoneRecords.map((record) => {
          if (record.mobile === mobile && record.project_id === project_id) {
            return { ...record, isReleased: true }
          }
          return record
        })
        setPhoneRecords(updatedRecords)
        localStorage.setItem("phoneRecords", JSON.stringify(updatedRecords))

        setSuccess(`✅ 手机号 ${mobile} 已释放`)
        fetchUserInfo() // 刷新用户信息
      } else {
        setError(data.error || "释放手机号失败")
      }
    } catch (error) {
      console.error("释放手机号失败:", error)
      setError("网络错误")
    } finally {
      setLoading(false)
    }
  }

  // 拉黑手机号
  const blacklistMobile = async (mobile: string, project_id: string) => {
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams({
        project_id,
        phone_num: mobile,
      })

      const response = await fetch(`/api/sms/blacklist-mobile?${params}`)
      const data = await response.json()

      if (response.ok) {
        const updatedRecords = phoneRecords.map((record) => {
          if (record.mobile === mobile && record.project_id === project_id) {
            return { ...record, isReleased: true }
          }
          return record
        })
        setPhoneRecords(updatedRecords)
        localStorage.setItem("phoneRecords", JSON.stringify(updatedRecords))

        setSuccess(`✅ 手机号 ${mobile} 已拉黑`)
        fetchUserInfo() // 刷新用户信息
      } else {
        setError(data.error || "拉黑手机号失败")
      }
    } catch (error) {
      console.error("拉黑手机号失败:", error)
      setError("网络错误")
    } finally {
      setLoading(false)
    }
  }

  // 删除单条短信记录
  const deleteMessage = (mobile: string, project_id: string, messageIndex: number) => {
    setPhoneRecords((prev) => {
      const updatedRecords = prev.map((record) => {
        if (record.mobile === mobile && record.project_id === project_id) {
          const newMessages = record.messages.filter((_, index) => index !== messageIndex)
          return { ...record, messages: newMessages }
        }
        return record
      })
      localStorage.setItem("phoneRecords", JSON.stringify(updatedRecords))
      return updatedRecords
    })
    setSuccess(`✅ 已删除短信记录`)
  }

  // 删除手机号的所有短信记录
  const deleteAllMessagesForPhone = (mobile: string, project_id: string) => {
    setPhoneRecords((prev) => {
      const updatedRecords = prev.map((record) => {
        if (record.mobile === mobile && record.project_id === project_id) {
          return { ...record, messages: [] }
        }
        return record
      })
      localStorage.setItem("phoneRecords", JSON.stringify(updatedRecords))
      return updatedRecords
    })
    setSuccess(`✅ 已删除手机号 ${mobile} 的所有短信记录`)
  }

  // 删除整个手机号记录
  const deletePhoneRecord = (mobile: string, project_id: string) => {
    setPhoneRecords((prev) => {
      const updatedRecords = prev.filter((record) => !(record.mobile === mobile && record.project_id === project_id))
      localStorage.setItem("phoneRecords", JSON.stringify(updatedRecords))
      return updatedRecords
    })
    setSuccess(`✅ 已删除手机号 ${mobile} 的记录`)
  }

  // 清空所有记录
  const clearAllRecords = () => {
    setPhoneRecords([])
    localStorage.removeItem("phoneRecords")
    setSuccess(`✅ 已清空所有记录`)
  }

  // 组件卸载时清理所有定时器
  useEffect(() => {
    return () => {}
  }, [])

  return (
    <div className="min-h-screen nobody-background">
      <div className="min-h-screen nobody-overlay">
        <div className="nobody-gradient shadow-lg animate-in slide-in-from-top-4 duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <img src="/nobody-logo.png" alt="Nobody Logo" className="h-10 w-10 rounded-full animate-pulse" />
                <div>
                  <h1 className="text-2xl font-bold text-black">NobodySMS</h1>
                  <p className="text-sm text-black/70">Nobody社区 · 专业短信验证服务</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {userInfo && (
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className="bg-white/20 border-white/30 text-black font-semibold animate-pulse"
                    >
                      余额: {formatBalance(userInfo.money)}
                    </Badge>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-white/20 border-black/20 text-black hover:bg-white/30 hover:scale-105 transition-transform"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2 bg-red-50/90 backdrop-blur-sm">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50/90 animate-in slide-in-from-top-2 backdrop-blur-sm">
              <AlertDescription className="text-yellow-800 flex items-center justify-between">
                <span>{success}</span>
                <div className="flex items-center space-x-2 ml-4">
                  {lastObtainedPhone && (
                    <CopyButton
                      text={lastObtainedPhone}
                      showText={true}
                      variant="ghost"
                      className="text-yellow-700 hover:bg-yellow-100"
                      successMessage="手机号已复制!"
                    />
                  )}
                  {lastReceivedCode && (
                    <CopyButton
                      text={lastReceivedCode}
                      showText={true}
                      variant="ghost"
                      className="text-yellow-700 hover:bg-yellow-100"
                      successMessage="验证码已复制!"
                    />
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="get-mobile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm animate-in fade-in-50 duration-500">
              <TabsTrigger
                value="get-mobile"
                className="data-[state=active]:nobody-gradient data-[state=active]:text-black transition-all hover:scale-105"
              >
                获取手机号
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="data-[state=active]:nobody-gradient data-[state=active]:text-black transition-all hover:scale-105"
              >
                项目管理
              </TabsTrigger>
              <TabsTrigger
                value="manage-phones"
                className="data-[state=active]:nobody-gradient data-[state=active]:text-black transition-all hover:scale-105"
              >
                管理手机号
              </TabsTrigger>
              <TabsTrigger
                value="guide"
                className="data-[state=active]:nobody-gradient data-[state=active]:text-black transition-all hover:scale-105"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                使用说明
              </TabsTrigger>
              <TabsTrigger
                value="social"
                className="data-[state=active]:nobody-gradient data-[state=active]:text-black transition-all hover:scale-105"
              >
                <Users className="h-4 w-4 mr-1" />
                联系我们
              </TabsTrigger>
            </TabsList>

            <TabsContent value="get-mobile">
              <Card className="nobody-card backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5 text-yellow-600 animate-pulse" />
                    获取手机号
                    {selectedProjectPrice > 0 && (
                      <Badge variant="outline" className="ml-2 border-yellow-400 text-yellow-700 animate-pulse">
                        当前价格: {formatPrice(selectedProjectPrice / 3)}
                      </Badge>
                    )}
                    {/* 请求时间显示 */}
                    {loading && requestTime > 0 && (
                      <Badge variant="outline" className="ml-2 border-orange-400 text-orange-700 animate-pulse">
                        <Clock className="h-3 w-3 mr-1" />
                        {(requestTime / 1000).toFixed(1)}s
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    选择项目或输入项目ID获取手机号 · 获取手机号免费，仅在收到短信时扣费
                    {remainingCards && (
                      <Badge variant="outline" className="ml-2 border-teal-400 text-teal-700 animate-bounce">
                        剩余取卡数: {remainingCards}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-blue-200 bg-blue-50/90 animate-in fade-in-50 duration-700 backdrop-blur-sm">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>💰 重要提醒：</strong>
                      <br />• 获取手机号：<span className="text-green-600 font-semibold">完全免费</span>
                      <br />• 收到验证码：<span className="text-orange-600 font-semibold">才开始扣费</span>
                      <br />• 未收到短信：<span className="text-green-600 font-semibold">不会扣费</span>
                    </AlertDescription>
                  </Alert>

                  {/* 快速复制区域 */}
                  {(lastObtainedPhone || lastReceivedCode) && (
                    <Alert className="border-green-200 bg-green-50/90 animate-in slide-in-from-top-2 backdrop-blur-sm">
                      <Copy className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <div className="flex flex-col space-y-2">
                          <strong>📋 快速复制：</strong>
                          <div className="flex flex-wrap gap-2">
                            {lastObtainedPhone && (
                              <CopyableText
                                text={lastObtainedPhone}
                                label="手机号"
                                badgeVariant="outline"
                                className="animate-in zoom-in-50"
                              />
                            )}
                            {lastReceivedCode && (
                              <CopyableText
                                text={lastReceivedCode}
                                label="验证码"
                                badgeVariant="outline"
                                className="animate-in zoom-in-50"
                                animate={true}
                              />
                            )}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 animate-in slide-in-from-left-4 duration-500">
                      <Label htmlFor="project-id">项目ID *</Label>
                      <Input
                        id="project-id"
                        value={projectId}
                        onChange={(e) => {
                          setProjectId(e.target.value)
                          if (e.target.value && !selectedProjectPrice) {
                            setSelectedProjectPrice(0.3)
                          }
                        }}
                        placeholder="请输入项目ID或从项目管理中选择"
                        className="border-yellow-200 focus:border-yellow-400 transition-colors bg-white/90"
                      />
                    </div>
                    {/* 项目ID查找提示 */}
                    <div className="md:col-span-2 animate-in slide-in-from-bottom-4 duration-700">
                      <Alert className="border-indigo-200 bg-indigo-50/90 backdrop-blur-sm">
                        <Search className="h-4 w-4 text-indigo-600" />
                        <AlertDescription className="text-indigo-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <strong>🔍 需要查找项目ID？</strong>
                              <br />
                              <span className="text-sm">使用我们的区块链查找工具，数据存储在Sepolia测试网</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open("https://smsnobody.netlify.app", "_blank")}
                              className="ml-2 text-indigo-700 border-indigo-300 hover:bg-indigo-100 hover:scale-105 transition-transform"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              查找工具
                            </Button>
                          </div>
                          <p className="text-xs mt-1">💡 点击按钮打开项目ID查找工具，所有数据透明可查</p>
                        </AlertDescription>
                      </Alert>
                    </div>
                    <div className="space-y-2 animate-in slide-in-from-right-4 duration-500">
                      <Label htmlFor="operator">运营商</Label>
                      <Select value={operator} onValueChange={setOperator}>
                        <SelectTrigger className="border-yellow-200 focus:border-yellow-400 transition-colors bg-white/90">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">默认</SelectItem>
                          <SelectItem value="1">移动</SelectItem>
                          <SelectItem value="2">联通</SelectItem>
                          <SelectItem value="3">电信</SelectItem>
                          <SelectItem value="4">实卡</SelectItem>
                          <SelectItem value="5">虚卡</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 animate-in slide-in-from-left-4 duration-700">
                      <Label htmlFor="phone-num">指定手机号</Label>
                      <Input
                        id="phone-num"
                        value={phoneNum}
                        onChange={(e) => setPhoneNum(e.target.value)}
                        placeholder="可选，指定要获取的手机号"
                        className="border-yellow-200 focus:border-yellow-400 transition-colors bg-white/90"
                      />
                    </div>
                    <div className="space-y-2 animate-in slide-in-from-right-4 duration-700">
                      <Label htmlFor="scope">指定号段</Label>
                      <Input
                        id="scope"
                        value={scope}
                        onChange={(e) => setScope(e.target.value)}
                        placeholder="可选，如170或16511"
                        className="border-yellow-200 focus:border-yellow-400 transition-colors bg-white/90"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2 animate-in slide-in-from-bottom-4 duration-900">
                      <Label htmlFor="address">归属地</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="可选，如湖北、甘肃"
                        className="border-yellow-200 focus:border-yellow-400 transition-colors bg-white/90"
                      />
                    </div>
                  </div>
                  {/* 批量获取设置 */}
                  <Alert className="border-purple-200 bg-purple-50/90 animate-in fade-in-50 duration-700 backdrop-blur-sm">
                    <Phone className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong>📱 批量获取模式</strong>
                          <br />
                          <span className="text-sm">一次指定多个手机号，自动逐个尝试获取</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={batchMode}
                              onChange={(e) => setBatchMode(e.target.checked)}
                              className="rounded border-purple-300"
                            />
                            <span className="text-sm">启用批量模式</span>
                          </label>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-purple-600">
                          💡 批量模式下会逐个尝试指定的手机号，直到获取成功或全部尝试完毕
                        </span>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* 批量手机号输入框 */}
                  {batchMode && (
                    <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                      <Label htmlFor="batch-phones">批量手机号列表</Label>
                      <Textarea
                        id="batch-phones"
                        value={batchPhones}
                        onChange={(e) => setBatchPhones(e.target.value)}
                        placeholder="请输入手机号列表，每行一个手机号&#10;例如：&#10;13812345678&#10;15987654321&#10;18765432109"
                        rows={6}
                        className="border-purple-200 focus:border-purple-400 transition-colors bg-white/90"
                      />
                      <div className="text-xs text-gray-600">
                        💡 每行输入一个手机号，系统会按顺序尝试获取，直到成功或全部尝试完毕
                      </div>
                    </div>
                  )}

                  {/* 批量获取进度 */}
                  {loading && batchMode && batchProgress.total > 0 && (
                    <Alert className="border-blue-200 bg-blue-50/90 animate-in slide-in-from-top-2 backdrop-blur-sm">
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      <AlertDescription className="text-blue-800">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <strong>📊 批量获取进度</strong>
                            <span className="text-sm">
                              {batchProgress.current}/{batchProgress.total}
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">成功: {batchProgress.success}</span>
                            <span className="text-red-600">失败: {batchProgress.failed}</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* 批量获取结果 */}
                  {batchResults.length > 0 && (
                    <Alert className="border-gray-200 bg-gray-50/90 animate-in slide-in-from-bottom-4 backdrop-blur-sm">
                      <Info className="h-4 w-4 text-gray-600" />
                      <AlertDescription className="text-gray-800">
                        <div className="space-y-2">
                          <strong>📋 批量获取结果</strong>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {batchResults.map((result, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-xs p-2 rounded bg-white/50"
                              >
                                <span className="font-mono">{result.phone}</span>
                                {result.success ? (
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="border-green-400 text-green-700">
                                      ✅ {result.mobile}
                                    </Badge>
                                    <CopyButton text={result.mobile || ""} className="h-4 w-4 p-0" />
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="border-red-400 text-red-700">
                                    ❌ {result.error}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    onClick={getMobile}
                    disabled={loading}
                    className="w-full nobody-button hover:scale-105 transition-transform animate-in zoom-in-50 duration-500"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {batchMode ? "批量获取手机号" : "获取手机号"} (免费)
                    {loading && requestTime > 0 && <span className="ml-2">({(requestTime / 1000).toFixed(1)}s)</span>}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects">
              <ProjectSelector onProjectSelect={handleProjectSelect} selectedProjectId={selectedUniqueId} />
            </TabsContent>

            <TabsContent value="guide">
              <UsageGuide />
            </TabsContent>

            <TabsContent value="manage-phones">
              <Card className="nobody-card backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5 text-teal-600 animate-pulse" />
                        管理手机号
                      </CardTitle>
                      <CardDescription>管理已获取的手机号，获取短信验证码</CardDescription>
                    </div>
                    {phoneRecords.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={clearAllRecords}
                        className="hover:scale-105 transition-transform"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        清空所有记录
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {phoneRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 animate-in fade-in-50 duration-1000">
                      <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-pulse" />
                      <p>暂无手机号记录，请先获取手机号</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {phoneRecords.map((record, index) => (
                        <div
                          key={`${record.mobile}-${record.project_id}-${index}`}
                          className="border rounded-lg p-4 bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-bottom-2"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <CopyableText
                                text={record.mobile}
                                badgeVariant="outline"
                                className="border-yellow-400 text-yellow-700 animate-pulse"
                              />
                              <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                                项目: {record.project_id}
                              </Badge>
                              {record.project_price && (
                                <Badge variant="outline" className="border-green-400 text-green-700 animate-bounce">
                                  {formatPrice(record.project_price / 3)}/条
                                </Badge>
                              )}
                              {record.isReleased && (
                                <Badge variant="outline" className="border-gray-400 text-gray-600">
                                  已释放
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {!record.isReleased && (
                                <Button
                                  size="sm"
                                  onClick={() => checkMessage(record.mobile, record.project_id)}
                                  disabled={loading}
                                  className="nobody-button hover:scale-105 transition-transform"
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  获取验证码
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => releaseMobile(record.mobile, record.project_id)}
                                disabled={loading || record.isReleased}
                                className="border-gray-300 hover:bg-gray-50 hover:scale-105 transition-transform"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                {record.isReleased ? "已释放" : "释放"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => blacklistMobile(record.mobile, record.project_id)}
                                disabled={loading}
                                className="hover:scale-105 transition-transform"
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                拉黑
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setShowDeleteOptions(
                                    showDeleteOptions === `${record.mobile}_${record.project_id}`
                                      ? ""
                                      : `${record.mobile}_${record.project_id}`,
                                  )
                                }
                                className="border-red-300 text-red-600 hover:bg-red-50 hover:scale-105 transition-transform"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                删除选项
                              </Button>
                            </div>
                          </div>

                          {/* 删除选项面板 */}
                          {showDeleteOptions === `${record.mobile}_${record.project_id}` && (
                            <div className="mt-3 p-3 bg-red-50/90 rounded border border-red-200 animate-in slide-in-from-top-2 backdrop-blur-sm">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteAllMessagesForPhone(record.mobile, record.project_id)}
                                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  删除所有短信
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deletePhoneRecord(record.mobile, record.project_id)}
                                  className="hover:scale-105 transition-transform"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  删除整个记录
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setShowDeleteOptions("")}
                                  className="text-gray-600"
                                >
                                  取消
                                </Button>
                              </div>
                            </div>
                          )}

                          {record.messages.length > 0 && (
                            <div className="space-y-2">
                              <Label>收到的短信:</Label>
                              {record.messages.map((message, msgIndex) => (
                                <div
                                  key={msgIndex}
                                  className="bg-gradient-to-r from-yellow-50/90 to-teal-50/90 p-3 rounded border-l-4 border-yellow-400 animate-in slide-in-from-left-2 backdrop-blur-sm"
                                  style={{ animationDelay: `${msgIndex * 100}ms` }}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <CopyableText
                                      text={message.code}
                                      label="验证码"
                                      badgeVariant="outline"
                                      className="border-yellow-500 text-yellow-700 animate-pulse"
                                    />
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-500">
                                        {new Date(message.timestamp).toLocaleString()}
                                      </span>
                                      <CopyButton
                                        text={message.content}
                                        className="h-6 w-6 p-0"
                                        successMessage="短信内容已复制!"
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => deleteMessage(record.mobile, record.project_id, msgIndex)}
                                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:scale-105 transition-transform"
                                        title="删除这条短信"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <Textarea
                                    value={message.content}
                                    readOnly
                                    className="text-sm bg-white/50 cursor-pointer select-all"
                                    rows={2}
                                    title="点击选择文本"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <SocialMediaSection />
            </TabsContent>
          </Tabs>

          <div className="mt-12 text-center animate-in fade-in-50 duration-1000">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src="/nobody-logo.png" alt="Nobody Logo" className="h-6 w-6 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">
                Powered by{" "}
                <a
                  href="https://nobody.xyz/zh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-600 hover:text-yellow-700 font-semibold hover:scale-105 transition-transform inline-block"
                >
                  Nobody社区
                </a>
              </span>
            </div>
            <p className="text-xs text-gray-500">Every Nobody is Somebody</p>
          </div>
        </div>

        {/* 性能监控组件 */}
        <PerformanceMonitor />
      </div>
    </div>
  )
}
