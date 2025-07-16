export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { getProxyTarget } from "@/lib/proxy-config"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testPath = searchParams.get("path") || "test"
  const targetUrl = getProxyTarget(testPath, searchParams)

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: request.headers,
      redirect: "follow",
    })

    const headers = new Headers(response.headers)
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    const responseBody = await response.text() // Get response as text

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    })
  } catch (error) {
    console.error("Test proxy GET request failed:", error)
    return NextResponse.json({ error: "Test proxy GET request failed" }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  const headers = new Headers(request.headers)
  headers.set("Access-Control-Allow-Origin", "*")
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  "Access-Control-Allow-Headers", "Content-Type, Authorization"
  headers.set("Access-Control-Max-Age", "86400") // Cache preflight for 24 hours

  return new NextResponse(null, {
    status: 200,
    headers: headers,
  })
}
