"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideArrowLeft, LucidePackage, LucideCalendar } from "lucide-react"
import { getProdutos, getEstoqueTamanhos } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import ProdutoForm from "../produto-form"

export default function EditarProduto({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [produto, setProduto] = useState<any>(null)
  const [estoqueTamanhos, setEstoqueTamanhos] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function carregarProduto() {
      setIsLoading(true)
      setError(null)
      try {
        // Verificar se o ID é um número válido
        const id = Number.parseInt(params.id)
        if (isNaN(id)) {
          setError("ID de produto inválido")
          setIsLoading(false)
          return
        }

        // Buscar todos os produtos
        const produtos = await getProdutos()
        const produtoEncontrado = produtos.find((p) => p.id === id)

        if (!produtoEncontrado) {
          setError("Produto não encontrado")
          setIsLoading(false)
          return
        }

        setProduto(produtoEncontrado)

        // Se for produto do tipo "par", buscar os tamanhos
        if (produtoEncontrado.tipo_estoque === "par") {
          try {
            const tamanhos = await getEstoqueTamanhos(id)
            console.log("Tamanhos carregados:", tamanhos)
            setEstoqueTamanhos(tamanhos || [])
          } catch (error) {
            console.error("Erro ao carregar tamanhos:", error)
            // Não falhar completamente se não conseguir carregar os tamanhos
            setEstoqueTamanhos([])
          }
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error)
        setError("Não foi possível carregar os dados do produto.")
        toast({
          title: "Erro ao carregar produto",
          description: "Não foi possível carregar os dados do produto.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    carregarProduto()
  }, [params.id, toast])

  const handleSave = (produtoAtualizado: any) => {
    toast({
      title: "Produto atualizado",
      description: "O produto foi atualizado com sucesso.",
    })
    router.push("/produtos")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Button variant="outline" onClick={() => router.push("/produtos")} className="mr-4">
              <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Editar Produto</h1>
          </div>
          <Card className="p-6">
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Carregando dados do produto...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !produto) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Button variant="outline" onClick={() => router.push("/produtos")} className="mr-4">
              <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Editar Produto</h1>
          </div>
          <Card className="p-6">
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-500">{error || "Produto não encontrado"}</p>
              <Button onClick={() => router.push("/produtos")}>Voltar para a lista de produtos</Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Filtrar tamanhos para mostrar apenas os que têm estoque
  const tamanhosFiltrados = estoqueTamanhos.filter((et) => et && et.quantidade > 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => router.push("/produtos")} className="mr-4">
            <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Editar Produto</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Informações do Produto</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="font-medium">{produto.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Categoria</p>
                    <p className="font-medium">{produto.categoria}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Preço</p>
                    <p className="font-medium">R$ {produto.preco.toFixed(2).replace(".", ",")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Estoque</p>
                    <Badge variant="outline" className="flex items-center gap-1 mt-1">
                      {produto.tipo_estoque === "unidade" ? (
                        <LucidePackage className="h-3 w-3" />
                      ) : (
                        <LucideCalendar className="h-3 w-3" />
                      )}
                      {produto.tipo_estoque === "unidade" ? "Unidade" : "Par"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Estoque</h2>
                {produto.tipo_estoque === "unidade" ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Quantidade em Estoque</p>
                      <p className="font-medium text-xl">{produto.estoque}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Estoque por Tamanho</p>
                    {tamanhosFiltrados.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {tamanhosFiltrados
                          .sort((a, b) => a.tamanho - b.tamanho)
                          .map((et) => (
                            <div key={et.tamanho} className="border rounded p-2 text-center">
                              <p className="text-xs text-gray-500">Tamanho {et.tamanho}</p>
                              <p className="font-medium">{et.quantidade}</p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Nenhum estoque por tamanho cadastrado.</p>
                    )}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Estoque Total:</span>
                        <span className="font-bold text-lg">
                          {estoqueTamanhos.reduce((total, et) => total + (et ? et.quantidade : 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-medium mb-4">Editar Produto</h2>
              <ProdutoForm produto={produto} onSave={handleSave} onCancel={() => router.push("/produtos")} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
