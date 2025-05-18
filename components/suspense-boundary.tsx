"use client"

import { Suspense, type ReactNode } from "react"
import { LoadingSpinner } from "./loading-spinner"

interface SuspenseBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SuspenseBoundary({ children, fallback }: SuspenseBoundaryProps) {
  return <Suspense fallback={fallback || <LoadingSpinner />}>{children}</Suspense>
}
