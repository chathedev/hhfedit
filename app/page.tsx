import { cookies } from "next/headers"
import { TinaEditProvider } from "tinacms/dist/react"
import { EditableField } from "@/components/EditableField"
import { EditGate } from "@/components/EditGate"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// This is a Server Component
export default async function HomePage() {
  const cookieStore = cookies()
  const userEmail = cookieStore.get("user_email")?.value || "N/A"
  const isEditMode = cookieStore.get("edit")?.value === "1"

  return (
    <TinaEditProvider editMode={isEditMode} branch={process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || "main"}>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="container px-4 md:px-6 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  <EditableField filePath="content/home.json" field="heroTitle" component="span" />
                </h1>
                <p className="mx-auto max-w-[700px] text-lg md:text-xl">
                  <EditableField filePath="content/home.json" field="heroSubtitle" component="span" />
                </p>
                <Button
                  className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-blue-600 shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  asChild
                >
                  <Link href="#">
                    <EditableField filePath="content/home.json" field="ctaText" component="span" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
            <div className="container px-4 md:px-6">
              <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Editor Status</h2>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Authenticated Email:</strong> {userEmail}
                  </p>
                  <p>
                    <strong>Edit Mode:</strong> {isEditMode ? "Enabled" : "Disabled"}
                  </p>
                  {isEditMode && (
                    <p className="text-sm text-gray-500">
                      Click the blue button at the bottom right to open TinaCMS.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Harnosandshf. All rights reserved.
          </p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4">
              Terms of Service
            </Link>
          </nav>
        </footer>
      </div>
      <EditGate />
    </TinaEditProvider>
  )
}
