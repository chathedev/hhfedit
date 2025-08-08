import { jwtVerify, createRemoteJWKSet, type JWTPayload } from "jose"

export async function verifyCloudflareAccess(token: string): Promise<JWTPayload> {
  if (!process.env.CF_TEAM_DOMAIN || !process.env.CF_ACCESS_AUD) {
    throw new Error("Missing Cloudflare Access environment variables (CF_TEAM_DOMAIN, CF_ACCESS_AUD)")
  }

  const ISSUER = `https://${process.env.CF_TEAM_DOMAIN}`
  const JWKS_URL = new URL("/cdn-cgi/access/certs", ISSUER)

  const JWKS = createRemoteJWKSet(JWKS_URL)

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      audience: process.env.CF_ACCESS_AUD,
    })
    return payload
  } catch (error) {
    console.error("JWT verification failed:", error)
    throw new Error("Invalid Cloudflare Access JWT")
  }
}
