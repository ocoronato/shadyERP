"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LucideArrowLeft } from "lucide-react"
import ProdutoForm from "../produto-form"
import { useToast } from "@/hooks/use-toast"

export default function NovoProduto() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Produto adicionado",
      description: "O produto foi adicionado com sucesso",
    })
    router.push("/estoque")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push("/estoque")} className="mr-4">
            <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Novo Produto</h1>
        </div>

        <Card className="p-6">
          <ProdutoForm produto={null} onSave={handleSave} onCancel={() => router.push("/estoque")} />
        </Card>
      </div>
    </div>
  )
}
