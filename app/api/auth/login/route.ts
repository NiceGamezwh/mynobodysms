export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { isDemoMode, generateDemoResponse, makeFailoverRequest, API_ROUTES } from "@/lib/api-config"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 })
    }

    console.log(`🚪 登录请求: ${username}`)

    // 检查是否为演示模式
    if (isDemoMode(username, password)) {
      console.log("🎭 使用演示模式登录")
      const demoResponse = generateDemoResponse("login")

      const response = NextResponse.json({
        success: true,
        token: demoResponse.token,
        data: { money: "100.50", id: "demo_user" },
        endpoint: "demo",
        isDemo: true,
        message: "演示模式 - 所有功能均为模拟数据",
      })

      // 设置 cookie
      response.cookies.set("auth_token", demoResponse.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 天
      })

      return response
    }

    // 尝试真实API登录
    console.log("🔄 开始真实API登录流程...")
    try {
      const data = await makeFailoverRequest(API_ROUTES.LOGIN, {
        user: username,
        pass: password,
      })

      console.log("🔍 登录响应数据:", data)

      // 根据新API文档，检查响应格式
      if (data.code === 0 && data.token) {
        console.log(`✅ 真实API登录成功!`)

        const response = NextResponse.json({
          success: true,
          token: data.token,
          data: { money: "0.00", id: username }, // 临时数据，实际会通过getUserInfo获取
          endpoint: "api",
          isDemo: false,
        })

        // 设置 cookie
        response.cookies.set("auth_token", data.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 天
        })

        return response
      }

      // 检查是否有错误消息
      if (data.msg && data.msg !== "success") {
        console.log(`❌ API返回错误:`, data.msg)
        return NextResponse.json(
          {
            error: `登录失败: ${data.msg}`,
            suggestion: "请检查用户名和密码，或使用演示账号：用户名 demo，密码 demo123",
            canUseDemo: true,
          },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          error: "登录失败：服务器响应格式异常",
          suggestion: "请尝试使用演示账号：用户名 demo，密码 demo123",
          canUseDemo: true,
        },
        { status: 401 },
      )
    } catch (error) {
      console.error("💥 真实API登录失败:", error)

      // 提供更详细的错误信息
      let errorMessage = "API连接失败"
      if (error instanceof Error) {
        if (error.message.includes("timeout") || error.message.includes("超时")) {
          errorMessage = "请求超时，API服务器响应过慢"
        } else if (error.message.includes("fetch")) {
          errorMessage = "网络请求失败，可能是网络连接问题"
        } else {
          errorMessage = error.message
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          suggestion: "真实API暂时无法连接，建议使用演示账号体验功能：用户名 demo，密码 demo123",
          networkHelp: "使用HTTPS访问，如仍失败可能是API服务器问题",
          canUseDemo: true,
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("🔥 登录处理错误:", error)
    return NextResponse.json(
      {
        error: "服务器内部错误",
        suggestion: "请尝试使用演示账号：用户名 demo，密码 demo123",
        canUseDemo: true,
      },
      { status: 500 },
    )
  }
}

// 添加 OPTIONS 支持
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
