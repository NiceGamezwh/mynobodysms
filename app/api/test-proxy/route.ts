export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🧪 开始HTTPS连接测试...")

    const startTime = Date.now()

    // 测试HTTPS连接到目标API
    const testEndpoints = ["https://api.sqhyw.net:90", "https://api.nnanx.com:90"]

    const results = []

    for (const endpoint of testEndpoints) {
      let testStart = Date.now()
      try {
        testStart = Date.now()
        const response = await fetch(`${endpoint}/api/get_myinfo?token=test`, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; NobodySMS-HTTPS-Test/1.0)",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(10000),
        })

        const testDuration = Date.now() - testStart
        const responseText = await response.text()

        results.push({
          endpoint,
          status: response.status,
          duration: testDuration,
          success: response.status < 500, // 即使是401也算连接成功
          response: responseText.substring(0, 100),
          protocol: "HTTPS",
        })

        console.log(`✅ HTTPS端点 ${endpoint} 测试完成: ${response.status} (${testDuration}ms)`)
      } catch (error) {
        const testDuration = Date.now() - testStart
        results.push({
          endpoint,
          status: 0,
          duration: testDuration,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          protocol: "HTTPS",
        })
        console.error(`❌ HTTPS端点 ${endpoint} 测试失败:`, error)
      }
    }

    const duration = Date.now() - startTime
    const successfulConnections = results.filter((r) => r.success).length

    return NextResponse.json({
      success: successfulConnections > 0,
      duration: duration,
      results: results,
      summary: {
        total: testEndpoints.length,
        successful: successfulConnections,
        failed: testEndpoints.length - successfulConnections,
      },
      message:
        successfulConnections > 0
          ? `${successfulConnections}/${testEndpoints.length} 个HTTPS端点连接成功，耗时 ${duration}ms`
          : `所有HTTPS端点连接失败，耗时 ${duration}ms`,
      note: "当前使用HTTPS直连模式",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("🔥 HTTPS连接测试错误:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
