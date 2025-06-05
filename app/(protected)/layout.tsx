"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import LoadingSpinner from "@/components/loading-spinner"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/protected-route"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return <LoadingSpinner />
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 md:p-6">{children}</main>
        {/* Você pode adicionar um Footer aqui se desejar */}
      </div>
    </ProtectedRoute>
  )
}
