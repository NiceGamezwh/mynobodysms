"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, ShoppingBag, ExternalLink } from "lucide-react"

export function SocialMediaSection() {
  return (
    <Card className="nobody-card backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-center justify-center">
          <MessageCircle className="mr-2 h-5 w-5 text-yellow-600" />
          官方社交媒体
        </CardTitle>
        <CardDescription className="text-center">关注我们获取最新动态和技术支持</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* WeChat */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 border-green-200"
              >
                <MessageCircle className="h-6 w-6 text-green-600" />
                <span className="font-medium">微信客服</span>
                <Badge variant="secondary" className="text-xs">
                  扫码添加
                </Badge>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5 text-green-600" />
                  微信客服
                </DialogTitle>
                <DialogDescription>扫描二维码添加微信客服，获取技术支持</DialogDescription>
              </DialogHeader>
              <div className="flex justify-center p-4">
                <img src="/wechat-qr.jpg" alt="微信二维码" className="w-64 h-64 object-contain" />
              </div>
            </DialogContent>
          </Dialog>

          {/* Xianyu */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-orange-50 border-orange-200"
              >
                <ShoppingBag className="h-6 w-6 text-orange-600" />
                <span className="font-medium">闲鱼店铺</span>
                <Badge variant="secondary" className="text-xs">
                  扫码关注
                </Badge>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5 text-orange-600" />
                  闲鱼官方店铺
                </DialogTitle>
                <DialogDescription>扫描二维码关注我们的闲鱼店铺</DialogDescription>
              </DialogHeader>
              <div className="flex justify-center p-4">
                <img src="/xianyu-qr.jpg" alt="闲鱼二维码" className="w-64 h-64 object-contain" />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sponsor Section */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-purple-700 mb-2">🎮 特别感谢赞助商</h3>
            <a
              href="https://polkadotgame.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              Polkadot Game
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            <p className="text-xs text-purple-500 mt-1">感谢赞助商对Nobody社区的大力支持</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
