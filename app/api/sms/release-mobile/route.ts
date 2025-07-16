export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { makeFailoverRequest, generateDemoResponse, API_ROUTES } from "@/lib/api-config"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")

    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sid = searchParams.get("project_id") // 兼容旧参数名
    const project_id = searchParams.get("sid") || sid // 新参数名
    const phone_num = searchParams.get("phone_num")
    const phone = searchParams.get("phone") || phone_num // 新参数名

    if (!project_id || !phone) {
      return NextResponse.json({ error: "项目ID和手机号不能为空" }, { status: 400 })
    }

    // 检查是否为演示模式 token
    if (token.value.startsWith("demo_token_")) {
      console.log("🎭 使用演示模式释放手机号")
      const demoResponse = generateDemoResponse("release_mobile")
      return NextResponse.json({
        message: "ok",
        data: [],
      })
    }

    const params: Record<string, string> = {
      token: token.value,
      sid: project_id,
      phone: phone,
    }

    try {
      console.log("🗑️ 释放手机号参数:", params)
      const data = await makeFailoverRequest(API_ROUTES.RELEASE_MOBILE, params)

      console.log("🗑️ 释放手机号响应:", data)

      if (data.code === 0) {
        return NextResponse.json({
          message: "ok",
          data: [],
        })
      }

      return NextResponse.json({ error: data.msg || "释放手机号失败" }, { status: 400 })
    } catch (error) {
      console.error("💥 API请求失败:", error)
      return NextResponse.json(
        {
          error: "释放手机号失败",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("🔥 Release mobile error:", error)
    return NextResponse.json({ error: "释放手机号失败" }, { status: 500 })
  }
}
