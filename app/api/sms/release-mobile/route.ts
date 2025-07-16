export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { makeFailoverRequest, API_ROUTES } from "@/lib/api-config"

export async function POST(request: Request) {
  try {
    const { mobile } = await request.json()
    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 })
    }
    const data = await makeFailoverRequest(API_ROUTES.RELEASE_MOBILE, { mobile })
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error releasing mobile:", error)
    return NextResponse.json({ error: "Failed to release mobile" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
