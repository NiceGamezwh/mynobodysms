const API_BASE_URLS = [
  process.env.NEXT_PUBLIC_API_URL || "https://api.example.com", // 主 API 地址
  process.env.NEXT_PUBLIC_BACKUP_API_URL || "https://backup-api.example.com", // 备用 API 地址
]

export const API_ROUTES = {
  LOGIN: "/api/login",
  USER_INFO: "/api/user/info",
  PRICING: "/api/pricing",
  GET_MOBILE: "/api/sms/get-mobile",
  GET_MESSAGE: "/api/sms/get-message",
  RELEASE_MOBILE: "/api/sms/release-mobile",
  BLACKLIST_MOBILE: "/api/sms/blacklist-mobile",
  PROJECTS: "/api/projects", // 新增项目列表路由
}

// 演示模式的用户名和密码
const DEMO_USERNAME = "demo"
const DEMO_PASSWORD = "demo123"

export const isDemoMode = (username: string, password: string) => {
  return username === DEMO_USERNAME && password === DEMO_PASSWORD
}

export const generateDemoResponse = (route: keyof typeof API_ROUTES) => {
  switch (route) {
    case API_ROUTES.LOGIN:
      return {
        code: 0,
        token: "demo_token_12345",
        data: { username: "demo_user", money: "100.50" },
        msg: "success",
        isDemo: true,
      }
    case API_ROUTES.USER_INFO:
      return {
        code: 0,
        data: { username: "demo_user", money: "100.50" },
        msg: "success",
        isDemo: true,
      }
    case API_ROUTES.PRICING:
      return {
        code: 0,
        data: [
          { id: "1", name: "Telegram", price: "0.50" },
          { id: "2", name: "WhatsApp", price: "0.60" },
        ],
        msg: "success",
        isDemo: true,
      }
    case API_ROUTES.GET_MOBILE:
      return {
        code: 0,
        data: { mobile: "13800138000" },
        msg: "success",
        isDemo: true,
      }
    case API_ROUTES.GET_MESSAGE:
      return {
        code: 0,
        data: { code: "123456", message: "Your verification code is 123456" },
        msg: "success",
        isDemo: true,
      }
    case API_ROUTES.RELEASE_MOBILE:
    case API_ROUTES.BLACKLIST_MOBILE:
      return {
        code: 0,
        msg: "success",
        isDemo: true,
      }
    case API_ROUTES.PROJECTS:
      return {
        code: 0,
        data: [
          { id: "1", name: "Telegram" },
          { id: "2", name: "WhatsApp" },
          { id: "3", name: "Google" },
          { id: "4", name: "Facebook" },
          { id: "5", name: "Other" },
        ],
        msg: "success",
        isDemo: true,
      }
    default:
      return { code: 1, msg: "Demo route not found", isDemo: true }
  }
}

export async function makeFailoverRequest(
  route: string,
  body?: Record<string, any>,
  token?: string,
  method: "GET" | "POST" = "POST",
) {
  let lastError: any = null

  for (const baseUrl of API_BASE_URLS) {
    const url = `${baseUrl}${route}`
    console.log(`尝试连接 API: ${url}`)
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const fetchOptions: RequestInit = {
        method: method,
        headers: headers,
        signal: AbortSignal.timeout(10000), // 10秒超时
      }

      if (body && method === "POST") {
        fetchOptions.body = JSON.stringify(body)
      }

      const response = await fetch(url, fetchOptions)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API ${url} 返回错误状态码: ${response.status}, 响应: ${errorText}`)
        throw new Error(`API请求失败: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`API ${url} 响应成功:`, data)
      return data
    } catch (error) {
      console.error(`连接 API ${url} 失败:`, error)
      lastError = error
      // 如果是 AbortError 或 TypeError (网络错误)，则尝试下一个
      if (error instanceof Error && (error.name === "AbortError" || error instanceof TypeError)) {
        continue
      } else {
        // 其他类型的错误直接抛出
        throw error
      }
    }
  }
  // 所有 API 地址都失败了
  throw new Error(`所有 API 地址连接失败: ${lastError?.message || "未知错误"}`)
}
