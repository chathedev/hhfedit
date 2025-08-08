import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { commitChanges } from "@/lib/git/commitChanges"

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10

const commitSchema = z.object({
  changes: z.array(
    z.object({
      filePath: z.string().refine((path) => path.startsWith("content/") && !path.includes(".."), {
        message: "File path must be under 'content/' and not contain path traversal.",
      }),
      content: z.string(),
    })
  ),
})

export async function POST(req: NextRequest) {
  const ip = req.ip || "unknown"

  // Rate limiting logic
  const now = Date.now()
  const entry = rateLimitStore.get(ip) || { count: 0, lastReset: now }

  if (now - entry.lastReset > RATE_LIMIT_WINDOW_MS) {
    entry.count = 1
    entry.lastReset = now
  } else {
    entry.count++
  }
  rateLimitStore.set(ip, entry)

  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    return new NextResponse("Too many requests. Please try again later.", { status: 429 })
  }

  try {
    const body = await req.json()
    const validatedBody = commitSchema.parse(body)

    const { changes } = validatedBody

    const GITHUB_OWNER = process.env.GITHUB_OWNER
    const GITHUB_REPO = process.env.GITHUB_REPO
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const GIT_AUTHOR_NAME = process.env.GIT_AUTHOR_NAME
    const GIT_AUTHOR_EMAIL = process.env.GIT_AUTHOR_EMAIL

    if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN || !GIT_AUTHOR_NAME || !GIT_AUTHOR_EMAIL) {
      return new NextResponse("Missing Git environment variables.", { status: 500 })
    }

    const prUrl = await commitChanges({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      token: GITHUB_TOKEN,
      authorName: GIT_AUTHOR_NAME,
      authorEmail: GIT_AUTHOR_EMAIL,
      changes,
    })

    return NextResponse.json({ prUrl })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: "Invalid request body", details: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    console.error("API commit error:", error)
    return new NextResponse("Failed to commit changes.", { status: 500 })
  }
}
