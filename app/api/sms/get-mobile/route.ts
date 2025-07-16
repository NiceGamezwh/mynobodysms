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

    if (!project_id) {
      return NextResponse.json({ error: "项目ID不能为空" }, { status: 400 })
    }

    // 检查是否为演示模式 token
    if (token.value.startsWith("demo_token_")) {
      console.log("🎭 使用演示模式获取手机号")
      const demoResponse = generateDemoResponse("get_mobile", { sid: project_id })
      return NextResponse.json({
        message: "ok",
        mobile: demoResponse.phone,
        data: [],
        "1分钟内剩余取卡数": "98",
      })
    }

    const params: Record<string, string> = {
      token: token.value,
      sid: project_id,
    }

    // 根据新API文档添加可选参数
    const optionalParams = [
      "isp", // 运营商代码（对应旧的operator）
      "phone", // 指定手机号（对应旧的phone_num）
      "Province", // 省份代码（对应旧的address）
      "ascription", // 号码类型
      "paragraph", // 号段（对应旧的scope）
      "exclude", // 排除号段
      "uid", // 对接码
      "author", // 开发者账号
    ]

    // 参数映射处理
    const operator = searchParams.get("operator")
    if (operator && operator !== "0") {
      // 映射运营商参数：1=移动, 2=联通, 3=电信, 4=实卡, 5=虚卡
      const operatorMap: Record<string, string> = {
        "1": "1", // 移动
        "2": "5", // 联通
        "3": "9", // 电信
        "4": "1", // 实卡 -> 移动
        "5": "16", // 虚卡
      }
      params.isp = operatorMap[operator] || operator
    }

    const phone_num = searchParams.get("phone_num")
    if (phone_num) {
      params.phone = phone_num
    }

    const scope = searchParams.get("scope")
    if (scope) {
      params.paragraph = scope
    }

    // 其他可选参数
    optionalParams.forEach((param) => {
      const value = searchParams.get(param)
      if (value) {
        params[param] = value
      }
    })

    try {
      console.log("📱 获取手机号参数:", params)
      const data = await makeFailoverRequest(API_ROUTES.GET_MOBILE, params)

      console.log("📱 获取手机号响应:", data)

      if (data.code === 0 && data.phone) {
        return NextResponse.json({
          message: "ok",
          mobile: data.phone,
          data: [],
          "1分钟内剩余取卡数": "99",
          shop_name: data.shop_name,
          sp: data.sp,
          phone_gsd: data.phone_gsd,
        })
      }

      if (data.msg && data.msg.includes("token")) {
        return NextResponse.json({ error: "登录已过期，请重新登录" }, { status: 401 })
      }

      return NextResponse.json({ error: data.msg || "获取手机号失败" }, { status: 400 })
    } catch (error) {
      console.error("💥 API请求失败:", error)
      return NextResponse.json(
        {
          error: "获取手机号失败",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("🔥 Get mobile error:", error)
    return NextResponse.json({ error: "获取手机号失败" }, { status: 500 })
  }
}
