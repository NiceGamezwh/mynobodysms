export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { makeFailoverRequest, API_ROUTES } from "@/lib/api-config"

export async function GET(request: Request) {
  try {
    // 从请求头获取 token，或者从 cookie 中获取
    const authHeader = request.headers.get("Authorization")
    const token = authHeader ? authHeader.split(" ")[1] : null

    if (!token) {
      return NextResponse.json({ error: "Authorization token missing" }, { status: 401 })
    }

    const data = await makeFailoverRequest(API_ROUTES.USER_INFO, {}, token)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching user info:", error)
    return NextResponse.json({ error: "Failed to fetch user info" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
