"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LucideDatabase, LucideLoader2, LucideCheck, LucideAlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function InitializeDatabasePage() {
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [message, setMessage] = useState("Preparando para inicializar o banco de dados...")
  const router = useRouter()

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setStatus("running")
        setMessage("Criando tabelas no banco de dados...")

        // Executar o SQL inline para criar as tabelas
        await executeSql()

        setStatus("success")
        setMessage("Banco de dados inicializado com sucesso!")
      } catch (error) {
        console.error("Erro ao inicializar banco de dados:", error)
        setStatus("error")
        setMessage("Ocorreu um erro ao inicializar o banco de dados. Tente novamente.")
      }
    }

    // Iniciar a inicialização automaticamente
    initializeDatabase()
  }, [])

  const voltar = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center text-center">
          {status === "idle" && <LucideDatabase className="h-16 w-16 text-blue-500 mb-4" />}
          {status === "running" && <LucideLoader2 className="h-16 w-16 text-blue-500 mb-4 animate-spin" />}
          {status === "success" && <LucideCheck className="h-16 w-16 text-green-500 mb-4" />}
          {status === "error" && <LucideAlertCircle className="h-16 w-16 text-red-500 mb-4" />}

          <h1 className="text-2xl font-bold mb-2">Inicialização do Banco de Dados</h1>
          <p className="text-gray-600 mb-6">{message}</p>

          <Button
            onClick={voltar}
            disabled={status === "running"}
            className={status === "success" ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {status === "success" ? "Voltar para o sistema" : status === "error" ? "Tentar novamente" : "Aguarde..."}
          </Button>
        </div>
      </Card>
    </div>
  )
}

async function executeSql() {
  // Aqui vamos usar o SQL inline do v0
  await fetch("/api/execute-sql", {
    method: "POST",
  })
}
