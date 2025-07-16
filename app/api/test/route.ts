export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      status: "success",
      message: "API test endpoint working",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
