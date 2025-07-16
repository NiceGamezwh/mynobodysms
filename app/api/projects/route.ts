export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("📋 项目列表接口已停用")

    // 新API不提供项目列表功能，返回空列表
    return NextResponse.json({
      success: true,
      data: [],
      message: "新API不支持项目列表功能，请直接输入项目ID",
    })
  } catch (error) {
    console.error("🔥 获取项目列表错误:", error)
    return NextResponse.json({ error: "获取项目列表失败" }, { status: 500 })
  }
}
