import { draftMode } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  draftMode().enable()
  return new NextResponse("Preview enabled", { status: 200 })
}
