"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"

interface ApiTest {
  name: string
  endpoint: string
  method: string
  status: "pending" | "success" | "error"
  response?: any
  error?: string
  duration?: number
}

export default function DebugPage() {
  const [tests, setTests] = useState<ApiTest[]>([
    { name: "Health Check", endpoint: "/api/health", method: "GET", status: "pending" },
    { name: "Test Endpoint", endpoint: "/api/test", method: "GET", status: "pending" },
    { name: "Login Endpoint", endpoint: "/api/auth/login", method: "POST", status: "pending" },
    { name: "User Info", endpoint: "/api/user/info", method: "GET", status: "pending" },
    { name: "Projects", endpoint: "/api/projects", method: "GET", status: "pending" },
  ])

  const [isRunning, setIsRunning] = useState(false)

  const runTest = async (test: ApiTest): Promise<ApiTest> => {
    const startTime = Date.now()

    try {
      let response: Response

      if (test.method === "POST") {
        response = await fetch(test.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: "demo", password: "demo123" }),
        })
      } else {
        response = await fetch(test.endpoint, {
          method: test.method,
          headers: {
            Authorization: "Bearer demo_token_123",
          },
        })
      }

      const duration = Date.now() - startTime
      const responseData = await response.text()

      let parsedData
      try {
        parsedData = JSON.parse(responseData)
      } catch {
        parsedData = responseData
      }

      return {
        ...test,
        status: response.ok ? "success" : "error",
        response: parsedData,
        duration,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      return {
        ...test,
        status: "error",
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      setTests((prev) => prev.map((t, idx) => (idx === i ? { ...t, status: "pending" } : t)))

      const result = await runTest(test)

      setTests((prev) => prev.map((t, idx) => (idx === i ? result : t)))

      // 添加延迟避免过快请求
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  useEffect(() => {
    runAllTests()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">成功</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">失败</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">测试中</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">未知</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔧 API 诊断工具
              <Button onClick={runAllTests} disabled={isRunning} size="sm" variant="outline">
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                重新测试
              </Button>
            </CardTitle>
            <CardDescription>测试所有 API 端点的连接状态和响应时间</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {tests.map((test, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    {getStatusBadge(test.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-mono">{test.method}</span>
                    <span>{test.endpoint}</span>
                    {test.duration && <span className="text-blue-600">{test.duration}ms</span>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {test.error && (
                  <Alert className="mb-3" variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>错误:</strong> {test.error}
                    </AlertDescription>
                  </Alert>
                )}

                {test.response && (
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-sm font-medium mb-2">响应数据:</p>
                    <pre className="text-xs overflow-x-auto">{JSON.stringify(test.response, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🛠️ 故障排除建议</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <AlertDescription>
                <strong>如果所有 API 都返回 404:</strong>
                <br />
                1. 检查 Netlify 部署日志中是否有构建错误
                <br />
                2. 确认 @netlify/plugin-nextjs 插件已正确安装
                <br />
                3. 验证 netlify.toml 配置是否正确
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertDescription>
                <strong>如果部分 API 失败:</strong>
                <br />
                1. 检查 API 路由文件是否存在于 app/api/ 目录
                <br />
                2. 确认每个路由都导出了正确的 HTTP 方法函数
                <br />
                3. 查看 Netlify Functions 日志获取详细错误信息
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertDescription>
                <strong>推荐解决方案:</strong>
                <br />
                1. 使用演示模式：用户名 demo，密码 demo123
                <br />
                2. 联系技术支持获取帮助
                <br />
                3. 检查网络连接和防火墙设置
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
