"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { LucideAlertCircle, CheckSquare } from "lucide-react"
import Link from "next/link"

export default function Login() {
  const [identifier, setIdentifier] = useState("") // Renomeado de email para identifier
  const [senha, setSenha] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  if (isAuthenticated) {
    router.push("/dashboard")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(identifier, senha) // Passar identifier para a função login
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Ocorreu um erro ao fazer login. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-800 to-blue-950 p-8 md:p-12 flex flex-col justify-center text-white">
        <div className="mb-8 flex items-center">
          <CheckSquare className="h-10 w-10 mr-3" />
          <span className="text-3xl font-bold italic">SHADY</span>
        </div>
        <h1 className="text-5xl font-bold mb-4">Opa, eae!</h1>
        <p className="text-xl mb-6">Bem vindo a Shady ERP!</p>
        <p className="text-lg leading-relaxed">Nós providenciamos tudo de melhor para o seu negocio.</p>
      </div>

      <div className="w-full md:w-1/2 bg-gray-800 flex items-center justify-center p-4 md:p-12">
        <div className="bg-neutral-900 p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-semibold mb-6 text-white text-center">Bem vindo de volta!</h2>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900 border-red-700">
              <LucideAlertCircle className="h-4 w-4 text-red-300" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="identifier" className="block text-sm font-medium text-gray-300 sr-only">
                Usuário ou Email
              </Label>
              <Input
                id="identifier"
                type="text" // Alterado de "email" para "text"
                placeholder="Usuário ou Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-neutral-800 border-neutral-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-300 sr-only">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-neutral-800 border-neutral-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="text-right">
              <Link
                href="https://api.whatsapp.com/send?phone=5544997128291&text=Ol%C3%A1%20Tudo%20bem?%20Esqueci%20minha%20Senha"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            {"Não é cliente shady?"}{" "}
            <Link
              href="https://api.whatsapp.com/send?phone=5544997128291&text=Ol%C3%A1%20Tudo%20bem?%20Quero%20ser%20Shady"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
