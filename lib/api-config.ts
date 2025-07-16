// 更新的 API 配置 - 使用新的 API 文档
export const API_CONFIG = {
  // 主要 API 端点 - 使用新的服务器地址
  PRIMARY_ENDPOINT: "https://api.haozhuma.com",
  // 备用 API 端点
  BACKUP_ENDPOINT: "https://api.haozhuyun.com",
  // 请求超时时间（毫秒）
  TIMEOUT: 15000,
  // 重试次数
  MAX_RETRIES: 1,
  // 演示模式配置
  DEMO_MODE: {
    enabled: true,
    username: "demo",
    password: "demo123",
  },
  // 性能监控配置
  PERFORMANCE: {
    slowRequestThreshold: 5000,
    verySlowRequestThreshold: 10000,
    enablePerformanceLogging: true,
  },
}

// API路径映射（根据新文档）
export const API_ROUTES = {
  LOGIN: "/sms/?api=login",
  USER_INFO: "/sms/?api=getSummary",
  GET_MOBILE: "/sms/?api=getPhone",
  GET_MESSAGE: "/sms/?api=getMessage",
  RELEASE_MOBILE: "/sms/?api=cancelRecv",
  BLACKLIST_MOBILE: "/sms/?api=addBlacklist",
  RELEASE_ALL: "/sms/?api=cancelAllRecv",
}

// 性能监控
interface PerformanceMetrics {
  endpoint: string
  path: string
  duration: number
  success: boolean
  timestamp: number
}

const performanceMetrics: PerformanceMetrics[] = []

export function logPerformance(metrics: PerformanceMetrics) {
  if (!API_CONFIG.PERFORMANCE.enablePerformanceLogging) return

  performanceMetrics.push(metrics)

  if (performanceMetrics.length > 100) {
    performanceMetrics.shift()
  }

  if (metrics.duration > API_CONFIG.PERFORMANCE.verySlowRequestThreshold) {
    console.warn(`🐌 很慢的请求: ${metrics.endpoint}${metrics.path} 耗时 ${metrics.duration}ms`)
  } else if (metrics.duration > API_CONFIG.PERFORMANCE.slowRequestThreshold) {
    console.warn(`⏰ 慢请求: ${metrics.endpoint}${metrics.path} 耗时 ${metrics.duration}ms`)
  }
}

export function getPerformanceStats() {
  if (performanceMetrics.length === 0) return null

  const successful = performanceMetrics.filter((m) => m.success)
  const failed = performanceMetrics.filter((m) => !m.success)

  const avgDuration = successful.reduce((sum, m) => sum + m.duration, 0) / successful.length
  const maxDuration = Math.max(...successful.map((m) => m.duration))
  const minDuration = Math.min(...successful.map((m) => m.duration))

  return {
    totalRequests: performanceMetrics.length,
    successfulRequests: successful.length,
    failedRequests: failed.length,
    successRate: (successful.length / performanceMetrics.length) * 100,
    avgDuration: Math.round(avgDuration),
    maxDuration,
    minDuration,
    slowRequests: successful.filter((m) => m.duration > API_CONFIG.PERFORMANCE.slowRequestThreshold).length,
  }
}

// 获取所有可用的 API 端点
export function getApiEndpoints(): string[] {
  return [API_CONFIG.PRIMARY_ENDPOINT, API_CONFIG.BACKUP_ENDPOINT].filter(Boolean)
}

// HTTPS 请求（根据新API文档使用HTTPS协议）
export async function makeFailoverRequest(path: string, params: Record<string, string>) {
  const startTime = Date.now()
  const endpoints = getApiEndpoints()

  console.log(`🔄 HTTPS请求: ${path}`)
  console.log(`📝 请求参数:`, params)

  let lastError: Error | null = null

  // 尝试所有端点
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i]

    try {
      // 构建查询参数
      const queryString = new URLSearchParams(params).toString()
      const fullUrl = `${endpoint}${path}${queryString ? "&" + queryString : ""}`

      console.log(`🌐 尝试端点 ${i + 1}/${endpoints.length}: ${fullUrl}`)

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; NobodySMS/1.0)",
          Accept: "application/json, text/plain, */*",
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      })

      const duration = Date.now() - startTime
      console.log(`📡 端点 ${i + 1} 响应状态: ${response.status} (${duration}ms)`)

      if (response.ok) {
        const responseText = await response.text()
        console.log(`📄 端点 ${i + 1} 响应内容: ${responseText.substring(0, 200)}...`)

        if (responseText.trim()) {
          try {
            const data = JSON.parse(responseText)
            console.log(`✅ 端点 ${i + 1} 成功返回数据`)

            // 记录性能指标
            logPerformance({
              endpoint: endpoint,
              path,
              duration,
              success: true,
              timestamp: Date.now(),
            })

            return data
          } catch (parseError) {
            console.error(`❌ 端点 ${i + 1} JSON解析失败:`, parseError)
            lastError = new Error(`JSON解析失败: ${parseError}`)
            continue
          }
        } else {
          console.error(`❌ 端点 ${i + 1} 返回空响应`)
          lastError = new Error("服务器返回空响应")
          continue
        }
      } else {
        const errorText = await response.text()
        console.error(`❌ 端点 ${i + 1} HTTP错误: ${response.status} ${errorText}`)
        lastError = new Error(`HTTP ${response.status}: ${errorText}`)

        // 记录失败的性能指标
        logPerformance({
          endpoint: endpoint,
          path,
          duration,
          success: false,
          timestamp: Date.now(),
        })

        continue
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`💥 端点 ${i + 1} 请求失败 (${duration}ms):`, error)
      lastError = error as Error

      // 记录失败的性能指标
      logPerformance({
        endpoint: endpoint,
        path,
        duration,
        success: false,
        timestamp: Date.now(),
      })

      continue
    }
  }

  // 所有端点都失败了
  const duration = Date.now() - startTime
  console.error(`💥 所有API端点都失败了 (${duration}ms)`)
  throw lastError || new Error("所有API端点都无法访问")
}

// 演示模式数据
export const DEMO_DATA = {
  user: {
    id: "demo_user",
    money: "100.50",
    username: "demo",
  },
  projects: [], // 改为空数组
  phones: ["13812345678", "15987654321", "18765432109"],
  messages: [
    "【淘宝网】您正在申请手机注册，验证码为：123456，1440分钟内有效！",
    "【微信】Your verification code is 789012. Valid for 10 minutes.",
    "【游戏】您正在申请手机注册，验证码为：456789，请勿泄露给他人。",
  ],
}

// 检查是否为演示模式
export function isDemoMode(username?: string, password?: string): boolean {
  if (!API_CONFIG.DEMO_MODE.enabled) return false

  if (username && password) {
    return username === API_CONFIG.DEMO_MODE.username && password === API_CONFIG.DEMO_MODE.password
  }

  return false
}

// 生成演示响应
export function generateDemoResponse(type: string, params?: any) {
  const timestamp = Date.now()

  switch (type) {
    case "login":
      return {
        code: 0,
        msg: "success",
        token: `demo_token_${timestamp}`,
      }

    case "userinfo":
      return {
        code: 0,
        msg: "success",
        money: DEMO_DATA.user.money,
        num: 50,
      }

    case "projects":
      return {
        code: 0,
        msg: "success",
        data: [], // 改为空数组
      }

    case "get_mobile":
      const randomPhone = DEMO_DATA.phones[Math.floor(Math.random() * DEMO_DATA.phones.length)]
      return {
        code: 0,
        msg: "成功",
        sid: params?.sid || "1000",
        shop_name: "淘宝网",
        country_name: "中国",
        country_code: "cn",
        country_qu: "+86",
        uid: null,
        phone: randomPhone,
        sp: "移动",
        phone_gsd: "广东",
      }

    case "get_message":
      const randomMessage = DEMO_DATA.messages[Math.floor(Math.random() * DEMO_DATA.messages.length)]
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      return {
        code: 0,
        msg: "成功",
        sms: randomMessage,
        yzm: code,
      }

    case "release_mobile":
    case "blacklist_mobile":
      return {
        code: 0,
        msg: "success",
        data: null,
      }

    default:
      return {
        code: 0,
        msg: "success",
        data: null,
      }
  }
}
