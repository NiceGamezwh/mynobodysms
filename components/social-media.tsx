import { ExternalLink, ShoppingBag } from "lucide-react"

export function SocialMediaLinks() {
  return (
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
  )
}
