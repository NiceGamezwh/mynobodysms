"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { getPerformanceStats, API_CONFIG } from "@/lib/api-config"
import { Activity, Clock, TrendingUp, TrendingDown, RefreshCw, Zap } from "lucide-react"

export function PerformanceMonitor() {
  const [stats, setStats] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  const refreshStats = () => {
    const newStats = getPerformanceStats()
    setStats(newStats)
  }

  useEffect(() => {
    refreshStats()
    const interval = setInterval(refreshStats, 5000) // 每5秒更新一次
    return () => clearInterval(interval)
  }, [])

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm hover:scale-105 transition-transform"
      >
        <Activity className="h-4 w-4 mr-2" />
        性能监控
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-white/95 backdrop-blur-sm shadow-lg animate-in slide-in-from-bottom-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Activity className="h-4 w-4 mr-2 text-blue-600" />
            性能监控
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={refreshStats} className="h-6 w-6 p-0">
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="h-6 w-6 p-0">
              ×
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs">实时API性能统计</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats ? (
          <>
            {/* 总体统计 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-semibold text-blue-700">总请求数</div>
                <div className="text-lg font-bold text-blue-800">{stats.totalRequests}</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="font-semibold text-green-700">成功率</div>
                <div className="text-lg font-bold text-green-800">{stats.successRate.toFixed(1)}%</div>
              </div>
            </div>

            {/* 成功率进度条 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>成功率</span>
                <span>{stats.successRate.toFixed(1)}%</span>
              </div>
              <Progress value={stats.successRate} className="h-2" />
            </div>

            {/* 响应时间统计 */}
            <div className="space-y-2">
              <div className="text-xs font-semibold flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                响应时间 (ms)
              </div>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <div className="text-center">
                  <div className="text-gray-500">平均</div>
                  <Badge
                    variant={
                      stats.avgDuration > API_CONFIG.PERFORMANCE.slowRequestThreshold ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {stats.avgDuration}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">最快</div>
                  <Badge variant="outline" className="text-xs text-green-600">
                    {stats.minDuration}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">最慢</div>
                  <Badge
                    variant={
                      stats.maxDuration > API_CONFIG.PERFORMANCE.verySlowRequestThreshold ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {stats.maxDuration}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 慢请求警告 */}
            {stats.slowRequests > 0 && (
              <Alert className="py-2">
                <TrendingDown className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  检测到 {stats.slowRequests} 个慢请求 (&gt;{API_CONFIG.PERFORMANCE.slowRequestThreshold / 1000}s)
                </AlertDescription>
              </Alert>
            )}

            {/* 性能建议 */}
            {stats.avgDuration > API_CONFIG.PERFORMANCE.slowRequestThreshold && (
              <Alert className="py-2 border-yellow-200 bg-yellow-50">
                <Zap className="h-3 w-3 text-yellow-600" />
                <AlertDescription className="text-xs text-yellow-800">
                  <strong>性能建议：</strong>
                  <br />• 平均响应时间较慢，可能是网络或服务器问题
                  <br />• 建议检查网络连接或联系技术支持
                </AlertDescription>
              </Alert>
            )}

            {/* 性能等级 */}
            <div className="flex items-center justify-between text-xs">
              <span>性能等级:</span>
              {stats.avgDuration < 1000 ? (
                <Badge className="bg-green-500 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  优秀
                </Badge>
              ) : stats.avgDuration < 3000 ? (
                <Badge className="bg-yellow-500 text-white">
                  <Clock className="h-3 w-3 mr-1" />
                  良好
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  需优化
                </Badge>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-xs text-gray-500 py-4">暂无性能数据</div>
        )}
      </CardContent>
    </Card>
  )
}
