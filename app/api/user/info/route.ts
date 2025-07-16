export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { makeFailoverRequest, generateDemoResponse, API_ROUTES } from "@/lib/api-config"

export async function GET(request: NextRequest) {
  try {
    console.log("📋 收到获取用户信息请求")

    const { searchParams } = new URL(request.url)
    let token = searchParams.get("token")

    if (!token) {
      const cookieStore = await cookies()
      const tokenCookie = cookieStore.get("auth_token")
      token = tokenCookie?.value
    }

    if (!token) {
      console.log("🚫 未找到登录token")
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查是否为演示模式 token
    if (token.startsWith("demo_token_")) {
      console.log("🎭 使用演示模式获取用户信息")
      const demoResponse = generateDemoResponse("userinfo")
      return NextResponse.json({
        data: {
          money: demoResponse.money,
          id: "demo_user",
        },
      })
    }

    try {
      const data = await makeFailoverRequest(API_ROUTES.USER_INFO, {
        token: token,
      })

      console.log("📊 用户信息响应:", data)

      if (data.code === 0 && data.money !== undefined) {
        return NextResponse.json({
          data: {
            money: data.money,
            id: "user",
            num: data.num,
          },
        })
      }

      if (data.msg && data.msg.includes("token")) {
        return NextResponse.json({ error: "登录已过期，请重新登录" }, { status: 401 })
      }

      return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 })
    } catch (error) {
      console.error("💥 API请求失败:", error)
      return NextResponse.json(
        {
          error: "获取用户信息失败",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("🔥 Get user info error:", error)
    return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 })
  }
}
