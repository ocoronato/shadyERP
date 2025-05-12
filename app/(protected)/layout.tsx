import type React from "react"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/protected-route"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <main>{children}</main>
    </ProtectedRoute>
  )
}
