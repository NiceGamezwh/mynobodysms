export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

// 项目价格配置（显示价格，实际价格的3倍）
const PROJECT_PRICES: Record<string, number> = {
  // 这里可以配置不同专属项目的价格
  // 'exclusive_project_1': 0.6, // 实际0.2元 * 3
  // 'exclusive_project_2': 0.9, // 实际0.3元 * 3
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("project_id")
    const isExclusive = searchParams.get("exclusive") === "1"

    let price = 0.3 // 默认普通项目价格（0.1 * 3）

    if (isExclusive && projectId && PROJECT_PRICES[projectId]) {
      price = PROJECT_PRICES[projectId]
    }

    return NextResponse.json({
      success: true,
      data: {
        project_id: projectId,
        is_exclusive: isExclusive,
        display_price: price,
        actual_price: price / 3, // 实际扣费价格
        currency: "CNY",
      },
    })
  } catch (error) {
    console.error("Get pricing error:", error)
    return NextResponse.json({ error: "获取价格信息失败" }, { status: 500 })
  }
}
