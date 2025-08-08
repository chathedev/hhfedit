"use client"

import { useEffect, useState } from "react"
import { useTina } from "tinacms/dist/react"
import { Button } from "@/components/ui/button"
import { Pencil } from 'lucide-react'

export function EditGate() {
  const [showEditButton, setShowEditButton] = useState(false)
  const { TinaCMS, active } = useTina()

  useEffect(() => {
    // Check for the 'edit' cookie
    const cookies = document.cookie.split(";")
    const editCookie = cookies.find((cookie) => cookie.trim().startsWith("edit="))
    if (editCookie && editCookie.split("=")[1] === "1") {
      setShowEditButton(true)
    }
  }, [])

  if (!showEditButton) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        className="rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        style={{ backgroundColor: "#3B82F6" }} // Blue color for the pill
        onClick={() => TinaCMS.toggle()}
        aria-label={active ? "Close TinaCMS" : "Open TinaCMS"}
      >
        <Pencil className="w-5 h-5 text-white" />
        <span className="sr-only">{active ? "Close TinaCMS" : "Open TinaCMS"}</span>
      </Button>
    </div>
  )
}
