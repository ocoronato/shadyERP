import type React from "react"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/protected-route"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="container mx-auto px-4 py-4">{children}</main>
    </ProtectedRoute>
  )
}
