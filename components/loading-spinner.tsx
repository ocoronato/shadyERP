import { LucideLoader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
}

export function LoadingSpinner({ size = "md", text = "Carregando..." }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <LucideLoader2 className={`${sizeClass[size]} text-blue-500 animate-spin mb-2`} />
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  )
}

// Também exportamos como default para compatibilidade
export default LoadingSpinner
