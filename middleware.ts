import { NextResponse, type NextRequest } from "next/server"
import { verifyCloudflareAccess } from "./lib/security/verify-cloudflare-access"

export const config = {
  matcher: ["/:path*"],
}

export async function middleware(req: NextRequest) {
  const headerJwt = req.headers.get("cf-access-jwt-assertion")
  const cookieJwt = req.cookies.get("CF_Authorization")?.value
  const token = headerJwt || cookieJwt

  if (!token) {
    return new NextResponse("Unauthorized: Missing Cloudflare Access token", { status: 401 })
  }

  try {
    const payload = await verifyCloudflareAccess(token)
    // Optionally, you can pass the payload to the request headers for server components
    // req.headers.set('x-user-email', payload.email as string);

    const response = NextResponse.next()

    // Set the edit cookie on successful authentication for the root path
    // This cookie is used by the client-side EditGate component
    response.cookies.set("edit", "1", {
      path: "/",
      domain: ".harnosandshf.se", // Ensure this matches your domain
      sameSite: "strict",
      secure: true,
      httpOnly: true,
      maxAge: 3600, // 1 hour
    })

    // Store user email in a temporary cookie for display on the page
    // This is not for security, just for display purposes
    if (payload.email) {
      response.cookies.set("user_email", payload.email as string, {
        path: "/",
        sameSite: "strict",
        secure: true,
        httpOnly: true,
        maxAge: 3600,
      })
    }

    return response
  } catch (error) {
    console.error("Cloudflare Access verification failed:", error)
    return new NextResponse("Unauthorized: Invalid Cloudflare Access token", { status: 401 })
  }
}
