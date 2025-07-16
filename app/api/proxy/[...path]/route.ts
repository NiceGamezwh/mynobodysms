export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { getProxyTarget } from "@/lib/proxy-config"

export async function GET(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url)
  const path = pathname.replace("/api/proxy/", "")
  const targetUrl = getProxyTarget(path, searchParams)

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

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    })
  } catch (error) {
    console.error("Proxy GET request failed:", error)
    return NextResponse.json({ error: "Proxy GET request failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url)
  const path = pathname.replace("/api/proxy/", "")
  const targetUrl = getProxyTarget(path, searchParams)

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: request.headers,
      body: await request.text(), // Use request.text() to handle various body types
      redirect: "follow",
    })

    const headers = new Headers(response.headers)
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    })
  } catch (error) {
    console.error("Proxy POST request failed:", error)
    return NextResponse.json({ error: "Proxy POST request failed" }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  const headers = new Headers(request.headers)
  headers.set("Access-Control-Allow-Origin", "*")
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  headers.set("Access-Control-Max-Age", "86400") // Cache preflight for 24 hours

  return new NextResponse(null, {
    status: 200,
    headers: headers,
  })
}
