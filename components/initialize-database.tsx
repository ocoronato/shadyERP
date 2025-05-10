"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LucideDatabase, LucideLoader2 } from "lucide-react"

export default function InitializeDatabase({ onSuccess }: { onSuccess: () => void }) {
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inicializarBancoDados = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      // Redirecionar para a página de inicialização do banco de dados
      window.location.href = "/initialize-database"
    } catch (error) {
      console.error("Erro ao inicializar banco de dados:", error)
      setError("Ocorreu um erro ao inicializar o banco de dados. Tente novamente.")
      setIsInitializing(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <Button className="w-full" size="lg" onClick={inicializarBancoDados} disabled={isInitializing}>
        {isInitializing ? (
          <>
            <LucideLoader2 className="h-4 w-4 mr-2 animate-spin" /> Inicializando...
          </>
        ) : (
          <>
            <LucideDatabase className="h-4 w-4 mr-2" /> Inicializar Banco de Dados
          </>
        )}
      </Button>
    </div>
  )
}
