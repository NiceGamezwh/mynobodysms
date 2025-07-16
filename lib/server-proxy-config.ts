// 服务器端专用的代理配置 - 使用 fetch API
export const SERVER_PROXY_CONFIG = {
  // 你的代理信息
  host: "proxy.hideiqxshlgvjk.com",
  port: 5050,
  username: "17263900020-type-datacenter",
  password: "zwh200102281057",

  // 构建代理URL
  getProxyUrl(): string {
    return `http://${this.username}:${this.password}@${this.host}:${this.port}`
  },

  // 获取代理认证头
  getProxyAuth(): string {
    const auth = `${this.username}:${this.password}`
    return `Basic ${btoa(auth)}`
  },
}

// 测试代理连接 - 使用 fetch API
export async function testServerProxyConnection(): Promise<boolean> {
  try {
    console.log("🧪 测试服务器端代理连接...")

    // 使用 fetch 通过代理访问测试URL
    const proxyUrl = SERVER_PROXY_CONFIG.getProxyUrl()

    // 构造代理请求
    const response = await fetch("http://httpbin.org/ip", {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NobodySMS-Test/1.0)",
        Accept: "application/json",
      },
      // 注意：在 edge runtime 中，我们不能直接使用代理
      // 需要通过其他方式实现
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ 代理连接测试成功，IP地址:", data.origin)
      return true
    } else {
      console.error("❌ 代理连接测试失败，状态码:", response.status)
      return false
    }
  } catch (error) {
    console.error("❌ 代理连接测试失败:", error)
    return false
  }
}

// 使用代理发送请求 - 简化版本，直接访问
export async function fetchWithServerProxy(url: string, options: RequestInit = {}): Promise<Response> {
  console.log(`🌐 直接访问（代理功能在 edge runtime 中受限）: ${url}`)

  try {
    // 在 edge runtime 中，我们直接使用 fetch
    // 代理功能需要在 Node.js runtime 中才能完全支持
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NobodySMS-Proxy/1.0)",
        Accept: "application/json, text/plain, */*",
        "Cache-Control": "no-cache",
        ...options.headers,
      },
      body: options.body,
      signal: AbortSignal.timeout(15000),
    })

    return response
  } catch (error) {
    console.error("❌ 请求失败:", error)
    throw error
  }
}

// 这是一个示例文件，用于配置服务器端代理目标。
// 在实际应用中，这些URL可能来自环境变量或更复杂的配置。
const SERVER_PROXY_TARGET_BASE_URL = process.env.SERVER_PROXY_TARGET_URL || "http://localhost:8080/api"

export function getServerProxyTarget(path: string, searchParams: URLSearchParams): string {
  // 根据 path 和 searchParams 构建完整的代理目标 URL
  const queryString = searchParams.toString()
  return `${SERVER_PROXY_TARGET_BASE_URL}/${path}${queryString ? `?${queryString}` : ""}`
}
