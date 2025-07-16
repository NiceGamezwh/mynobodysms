// 浏览器环境下的代理配置
export const PROXY_CONFIG = {
  // 你的代理信息
  host: "proxy.hideiqxshlgvjk.com",
  port: 5050,
  username: "17263900020-type-datacenter",
  password: "zwh200102281057",

  // 构建代理URL
  getProxyUrl(): string {
    return `http://${this.username}:${this.password}@${this.host}:${this.port}`
  },
}

// 测试代理连接 - 简化版本，适用于浏览器环境
export async function testProxyConnection(): Promise<boolean> {
  try {
    console.log("🧪 测试代理连接...")

    // 在浏览器环境中，我们只能通过服务器端API来测试代理
    const response = await fetch("/api/test-proxy", {
      method: "GET",
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ 代理连接测试结果:", data)
      return data.success
    } else {
      console.error("❌ 代理连接测试失败，状态码:", response.status)
      return false
    }
  } catch (error) {
    console.error("❌ 代理连接测试失败:", error)
    return false
  }
}

// 浏览器环境下不能直接使用代理，需要通过服务器端
export async function fetchWithProxy(url: string, options: RequestInit = {}): Promise<Response> {
  console.log(`🌐 通过服务器代理访问: ${url}`)

  // 在浏览器环境中，我们需要通过服务器端API来使用代理
  // 这个函数实际上不会在浏览器中被调用，只在服务器端使用
  throw new Error("fetchWithProxy should only be used on server side")
}
