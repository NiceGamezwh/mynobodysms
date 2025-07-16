export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { makeFailoverRequest, API_ROUTES } from "@/lib/api-config"

export async function POST(request: Request) {
  try {
    const { mobile, project_id } = await request.json()
    if (!mobile || !project_id) {
      return NextResponse.json({ error: "Mobile number and project ID are required" }, { status: 400 })
    }
    const data = await makeFailoverRequest(API_ROUTES.GET_MESSAGE, { mobile, project_id })
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error getting message:", error)
    return NextResponse.json({ error: "Failed to get message" }, { status: 500 })
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
