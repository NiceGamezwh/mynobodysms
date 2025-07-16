"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap, Search, ExternalLink, Info, Star, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/utils/pricing"

interface ProjectSelectorProps {
  onProjectSelect: (projectId: string, price: number) => void
  selectedProjectId: string
}

export function ProjectSelector({ onProjectSelect, selectedProjectId }: ProjectSelectorProps) {
  return (
    <Card className="nobody-card backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5 text-yellow-600 animate-pulse" />
          项目管理
        </CardTitle>
        <CardDescription>了解如何获取和使用项目ID</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 项目ID查找工具 */}
        <Alert className="border-indigo-200 bg-indigo-50/90 animate-in fade-in-50 duration-700 backdrop-blur-sm">
          <Search className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-indigo-800">
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <h3 className="font-semibold text-indigo-800">🔍 项目ID查找工具</h3>
                <p className="text-sm text-indigo-700 mt-1">使用区块链查找工具查询可用的项目ID</p>
                <p className="text-xs text-indigo-600 mt-2">💡 数据存储在Sepolia测试网上，确保数据透明可查</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://smsnobody.netlify.app", "_blank")}
                className="text-indigo-700 border-indigo-300 hover:bg-indigo-100 hover:scale-105 transition-transform"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                查找项目ID
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* 普通取卡说明 */}
        <Alert className="border-blue-200 bg-blue-50/90 animate-in fade-in-50 duration-700 backdrop-blur-sm">
          <Star className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-start space-x-3">
              <div>
                <h3 className="font-semibold text-blue-800">普通取卡</h3>
                <p className="text-sm text-blue-700 mt-1">
                  价格: <span className="font-semibold">{formatPrice(0.1)}/条</span>
                </p>
                <p className="text-xs text-blue-600 mt-2">💡 需要项目ID？请联系管理员获取公开项目的对接码</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* 使用说明 */}
        <Alert className="border-green-200 bg-green-50/90 animate-in fade-in-50 duration-900 backdrop-blur-sm">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div>
              <h3 className="font-semibold text-green-800">📝 使用说明</h3>
              <p className="text-sm text-green-700 mt-1">获取项目ID后，请到"获取手机号"页面输入使用</p>
              <ul className="text-xs text-green-600 mt-2 space-y-1">
                <li>• 第一步：使用查找工具获取可用的项目ID</li>
                <li>• 第二步：到"获取手机号"页面输入项目ID</li>
                <li>• 第三步：点击"获取手机号"按钮开始使用</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* API更新说明 */}
        <Alert className="border-orange-200 bg-orange-50/90 animate-in fade-in-50 duration-1000 backdrop-blur-sm">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div>
              <h3 className="font-semibold text-orange-800">📢 API更新说明</h3>
              <p className="text-sm text-orange-700 mt-1">新版API不再提供项目列表功能，请直接输入已知的项目ID</p>
              <ul className="text-xs text-orange-600 mt-2 space-y-1">
                <li>• 使用查找工具获取可用的项目ID</li>
                <li>• 联系管理员获取专属项目ID</li>
                <li>• 直接在"获取手机号"页面输入项目ID</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* 联系管理员 */}
        <Alert className="border-purple-200 bg-purple-50/90 animate-in slide-in-from-bottom-4 duration-1200 backdrop-blur-sm">
          <MessageCircle className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <div className="flex items-start space-x-3">
              <div>
                <h3 className="font-semibold text-purple-800">📞 需要帮助？</h3>
                <p className="text-sm text-purple-700 mt-1">如需获取项目ID或对接专属项目，请联系管理员</p>
                <p className="text-xs text-purple-600 mt-2">💬 通过企业微信客服或官方社交媒体联系我们</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
