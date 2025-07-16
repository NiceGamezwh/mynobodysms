"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Phone, MessageSquare, CreditCard, Shield, Zap } from "lucide-react"

export function UsageGuide() {
  const steps = [
    {
      icon: Phone,
      title: "获取手机号",
      description: "选择项目并获取手机号",
      status: "免费",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: MessageSquare,
      title: "接收短信",
      description: "等待并获取验证码",
      status: "免费",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: CreditCard,
      title: "成功扣费",
      description: "仅在收到验证码后扣费",
      status: "收费",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <Card className="nobody-card backdrop-blur-sm animate-in slide-in-from-top-4 duration-700">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-green-600 animate-pulse" />
          使用说明
        </CardTitle>
        <CardDescription>了解NobodySMS的计费方式和使用流程</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 重要提示 */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 animate-in fade-in-50 duration-500">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 animate-bounce" />
            <div>
              <h3 className="font-semibold text-green-800 mb-2">💰 重要：仅成功收费原则</h3>
              <p className="text-sm text-green-700 mb-2">
                <strong>只有在成功收到验证码后才会扣费！</strong>
              </p>
              <ul className="text-xs text-green-600 space-y-1">
                <li>• 获取手机号：完全免费</li>
                <li>• 等待短信：不产生费用</li>
                <li>• 收到验证码：才开始计费</li>
                <li>• 未收到短信：不会扣费</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用流程 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-500 animate-pulse" />
            使用流程
          </h3>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md animate-in slide-in-from-left-4 ${step.bgColor} border-gray-200`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${step.bgColor}`}>
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-800">
                        步骤 {index + 1}: {step.title}
                      </h4>
                      <Badge
                        variant={step.status === "免费" ? "secondary" : "outline"}
                        className={`${
                          step.status === "免费"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-orange-100 text-orange-700 border-orange-300"
                        } animate-pulse`}
                      >
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 费用说明 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 animate-in slide-in-from-bottom-4 duration-1000">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
            <CreditCard className="h-4 w-4 mr-2 animate-pulse" />
            费用说明
          </h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>
              • <strong>普通项目</strong>：¥0.30/条（仅在收到验证码后扣费）
            </p>
            <p>
              • <strong>专属项目</strong>：价格根据项目而定（仅在收到验证码后扣费）
            </p>
            <p>
              • <strong>失败保障</strong>：未收到短信不扣费，余额安全有保障
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
