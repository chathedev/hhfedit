import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const hasHeader = req.headers.has("cf-access-jwt-assertion")
  const hasCookie = req.cookies.has("CF_Authorization")

  return NextResponse.json({ hasHeader, hasCookie })
}
