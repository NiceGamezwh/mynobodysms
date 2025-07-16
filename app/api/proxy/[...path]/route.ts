export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

// 外部API端点配置 - 使用 HTTPS
const API_ENDPOINTS = ["https://api.sqhyw.net:90", "https://api.nnanx.com:90"]

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, await params, "GET")
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, await params, "POST")
}

async function handleProxyRequest(request: NextRequest, { path }: { path: string[] }, method: string) {
  try {
    console.log(`🔄 HTTPS代理请求: ${method} /${path.join("/")}`)

    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    // 获取请求体（如果是POST）
    let body = null
    if (method === "POST") {
      try {
        body = await request.text()
        console.log(`📝 请求体:`, body)
      } catch (error) {
        console.log(`⚠️ 无法读取请求体:`, error)
      }
    }

    const targetPath = `/${path.join("/")}`
    console.log(`🎯 目标路径: ${targetPath}`)
    console.log(`🔗 查询参数: ${queryString}`)

    let lastError: Error | null = null

    // 尝试所有API端点
    for (let i = 0; i < API_ENDPOINTS.length; i++) {
      const endpoint = API_ENDPOINTS[i]
      const fullUrl = `${endpoint}${targetPath}${queryString ? "?" + queryString : ""}`

      try {
        console.log(`🌐 尝试HTTPS端点 ${i + 1}/${API_ENDPOINTS.length}: ${fullUrl}`)

        // 使用 HTTPS fetch
        const proxyResponse = await fetch(fullUrl, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; NobodySMS-HTTPS/1.0)",
            Accept: "application/json, text/plain, */*",
            "Cache-Control": "no-cache",
          },
          body: body,
          signal: AbortSignal.timeout(15000),
        })

        console.log(`📡 HTTPS端点 ${i + 1} 响应状态: ${proxyResponse.status}`)

        const responseText = await proxyResponse.text()
        console.log(`📄 HTTPS端点 ${i + 1} 响应内容: ${responseText.substring(0, 200)}...`)

        if (proxyResponse.ok && responseText.trim()) {
          // 成功响应，返回结果
          try {
            const jsonData = JSON.parse(responseText)
            console.log(`✅ HTTPS端点 ${i + 1} 成功返回JSON数据`)

            return NextResponse.json(jsonData, {
              status: 200,
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
              },
            })
          } catch (parseError) {
            console.error(`❌ HTTPS端点 ${i + 1} JSON解析失败:`, parseError)
            console.log(`📄 原始响应内容:`, responseText)

            // 如果不是JSON，检查是否是错误消息
            if (responseText.includes("Invalid request") || responseText.includes("error")) {
              return NextResponse.json(
                {
                  error: responseText.trim(),
                  endpoint: endpoint,
                  status: proxyResponse.status,
                },
                { status: 400 },
              )
            }

            // 直接返回文本
            return new NextResponse(responseText, {
              status: proxyResponse.status,
              headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
              },
            })
          }
        } else {
          console.log(`❌ HTTPS端点 ${i + 1} 失败: ${proxyResponse.status} ${proxyResponse.statusText}`)
          console.log(`📄 错误响应内容: ${responseText}`)
          lastError = new Error(`HTTP ${proxyResponse.status}: ${responseText.substring(0, 100)}`)
          continue
        }
      } catch (error) {
        console.error(`💥 HTTPS端点 ${i + 1} 请求失败:`, error)
        lastError = error as Error
        continue
      }
    }

    // 所有端点都失败
    console.error(`💥 所有HTTPS API端点都失败了`)
    return NextResponse.json(
      {
        error: "所有HTTPS API端点都无法访问",
        details: lastError?.message || "未知错误",
        endpoints: API_ENDPOINTS,
        note: "当前使用HTTPS直连模式",
      },
      {
        status: 503,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    )
  } catch (error) {
    console.error(`🔥 HTTPS代理处理错误:`, error)
    return NextResponse.json(
      {
        error: "HTTPS代理服务器内部错误",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    )
  }
}

// 处理OPTIONS预检请求
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}
