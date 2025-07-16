const https = require("https")
const http = require("http")
const { URL } = require("url")

// API 配置 - 从环境变量获取
const API_CONFIG = {
  endpoints: [process.env.NEXT_PUBLIC_API_URL, process.env.NEXT_PUBLIC_BACKUP_API_URL].filter(Boolean),
  routes: {
    "/api/auth/login": "/api/logins",
    "/api/user/info": "/api/get_myinfo",
    "/api/projects": "/api/get_join",
    "/api/sms/get-mobile": "/api/get_mobile",
    "/api/sms/get-message": "/api/get_message",
    "/api/sms/release-mobile": "/api/free_mobile",
    "/api/sms/blacklist-mobile": "/api/add_blacklist",
  },
  timeout: 15000, // 增加超时时间
}

exports.handler = async (event, context) => {
  const startTime = Date.now()

  console.log("=== Netlify API Proxy Handler ===")
  console.log("Event path:", event.path)
  console.log("Method:", event.httpMethod)
  console.log("Headers:", JSON.stringify(event.headers, null, 2))

  // CORS 头
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
  }

  // 处理 OPTIONS 预检请求
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS preflight request")
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    }
  }

  try {
    // 检查API配置
    if (API_CONFIG.endpoints.length === 0) {
      console.error("❌ No API endpoints configured")
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Service configuration error",
          message: "API endpoints not configured. Please set NEXT_PUBLIC_API_URL environment variable.",
        }),
      }
    }

    console.log("📡 Configured endpoints:", API_CONFIG.endpoints.length)

    let apiPath = event.path

    // 从 rawUrl 中提取路径（如果可用）
    if (event.rawUrl && !apiPath.startsWith("/api")) {
      try {
        const url = new URL(event.rawUrl)
        apiPath = url.pathname
        console.log("📍 Extracted path from rawUrl:", apiPath)
      } catch (e) {
        console.log("⚠️ Failed to parse rawUrl, using event.path:", apiPath)
      }
    }

    // 获取目标 API 路径
    const targetPath = API_CONFIG.routes[apiPath]
    if (!targetPath) {
      console.log("❌ Unknown API path:", apiPath)
      console.log("Available routes:", Object.keys(API_CONFIG.routes))
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "API endpoint not found",
          path: apiPath,
          availableRoutes: Object.keys(API_CONFIG.routes),
        }),
      }
    }

    console.log("🎯 Target path:", targetPath)

    // 构建查询参数
    const queryParams = event.queryStringParameters || {}

    // 处理 POST 请求的 body 参数
    if (event.httpMethod === "POST" && event.body) {
      try {
        const bodyParams = JSON.parse(event.body)
        Object.assign(queryParams, bodyParams)
        console.log("📝 Added POST body params to query")
      } catch (e) {
        console.log("⚠️ Failed to parse POST body:", e.message)
      }
    }

    const queryString = new URLSearchParams(queryParams).toString()
    console.log("🔗 Query string:", queryString)

    // 并发尝试所有端点
    const promises = API_CONFIG.endpoints.map((baseUrl, index) => {
      const fullUrl = `${baseUrl}${targetPath}${queryString ? "?" + queryString : ""}`
      console.log(`🚀 Endpoint ${index + 1}: ${fullUrl}`)
      return makeHttpRequest(fullUrl, API_CONFIG.timeout)
    })

    // 等待第一个成功的响应
    const results = await Promise.allSettled(promises)

    console.log(
      "📊 Request results:",
      results.map((r, i) => ({
        endpoint: i + 1,
        status: r.status,
        success: r.status === "fulfilled" ? r.value.success : false,
        error: r.status === "rejected" ? r.reason : r.value.success ? null : r.value.error,
      })),
    )

    // 找到第一个成功的结果
    for (let i = 0; i < results.length; i++) {
      const result = results[i]

      if (result.status === "fulfilled" && result.value.success) {
        const elapsed = Date.now() - startTime
        console.log(`✅ Success with endpoint ${i + 1} in ${elapsed}ms`)

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: result.value.data,
        }
      }
    }

    // 所有请求都失败了
    const elapsed = Date.now() - startTime
    console.log(`❌ All endpoints failed in ${elapsed}ms`)

    // 检查是否是认证错误
    const authErrors = results.filter(
      (r) =>
        r.status === "fulfilled" &&
        r.value.error &&
        (r.value.error.includes("token") || r.value.error.includes("401") || r.value.error.includes("认证")),
    )

    if (authErrors.length > 0) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Authentication failed",
          message: "Please check your credentials and try again",
        }),
      }
    }

    return {
      statusCode: 503,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Service temporarily unavailable",
        message: "All API endpoints are currently unreachable. Please try again later.",
        debug: {
          endpoints: API_CONFIG.endpoints.length,
          elapsed: elapsed,
          errors: results.map((r, i) => ({
            endpoint: i + 1,
            error: r.status === "rejected" ? r.reason : r.value.error,
          })),
        },
      }),
    }
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error(`❌ Proxy handler error in ${elapsed}ms:`, error)

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request",
        elapsed: elapsed,
      }),
    }
  }
}

// HTTP/HTTPS 请求函数 - 优化版本
function makeHttpRequest(url, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const startTime = Date.now()

    try {
      const urlObj = new URL(url)
      const isHttps = urlObj.protocol === "https:"
      const client = isHttps ? https : http

      console.log(
        `🌐 Making ${isHttps ? "HTTPS" : "HTTP"} request to: ${urlObj.hostname}:${urlObj.port || (isHttps ? 443 : 80)}`,
      )

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NobodySMS-Netlify/1.0)",
          Accept: "application/json, text/plain, */*",
          "Accept-Encoding": "gzip, deflate",
          Connection: "close",
          "Cache-Control": "no-cache",
        },
        timeout: timeoutMs,
        // 对于 HTTPS，允许自签名证书
        rejectUnauthorized: false,
      }

      const req = client.request(options, (res) => {
        let data = ""
        let chunks = 0

        // 处理 gzip 压缩
        let stream = res
        if (res.headers["content-encoding"] === "gzip") {
          const zlib = require("zlib")
          stream = res.pipe(zlib.createGunzip())
        }

        stream.on("data", (chunk) => {
          data += chunk
          chunks++
        })

        stream.on("end", () => {
          const elapsed = Date.now() - startTime
          console.log(`📥 Response: ${res.statusCode}, ${data.length} bytes, ${chunks} chunks, ${elapsed}ms`)

          if (res.statusCode === 200 && data.trim()) {
            // 验证 JSON
            try {
              const parsed = JSON.parse(data)
              console.log("✅ Valid JSON response received")
              resolve({
                success: true,
                data: data,
              })
            } catch (parseError) {
              console.log("❌ Invalid JSON response:", data.substring(0, 100))
              resolve({
                success: false,
                error: "Invalid JSON response from server",
              })
            }
          } else {
            console.log(`❌ HTTP ${res.statusCode}:`, data.substring(0, 100))
            resolve({
              success: false,
              error: `HTTP ${res.statusCode}: ${data.substring(0, 100)}`,
            })
          }
        })

        stream.on("error", (error) => {
          const elapsed = Date.now() - startTime
          console.log(`❌ Stream error in ${elapsed}ms:`, error.message)
          resolve({
            success: false,
            error: `Stream error: ${error.message}`,
          })
        })
      })

      req.on("error", (error) => {
        const elapsed = Date.now() - startTime
        console.log(`❌ Request error in ${elapsed}ms:`, error.message)
        resolve({
          success: false,
          error: `Request error: ${error.message}`,
        })
      })

      req.on("timeout", () => {
        const elapsed = Date.now() - startTime
        console.log(`⏰ Request timeout in ${elapsed}ms`)
        req.destroy()
        resolve({
          success: false,
          error: "Request timeout",
        })
      })

      req.setTimeout(timeoutMs)
      req.end()
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.log(`❌ URL error in ${elapsed}ms:`, error.message)
      resolve({
        success: false,
        error: `URL error: ${error.message}`,
      })
    }
  })
}
