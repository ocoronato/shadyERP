"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideArrowLeft, LucideEdit, LucidePackage, LucideRuler, LucideLoader2 } from "lucide-react"
import ProdutoForm from "../produto-form"
import { getProdutos, type Produto } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

// Importar o componente MargemLucroBadge
import { MargemLucroBadge } from "@/components/margem-lucro-badge"

// Adicionar função para calcular a margem de lucro
const calcularMargem = (preco: number, custo: number) => {
  if (custo === 0) return 0
  const margem = ((preco - custo) / preco) * 100
  return Math.round(margem * 100) / 100 // Arredondar para 2 casas decimais
}

export default function ProdutoDetalhes({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    async function carregarProduto() {
      try {
        setIsLoading(true)
        const produtos = await getProdutos()
        const produtoEncontrado = produtos.find((p) => p.id === Number(params.id))

        if (produtoEncontrado) {
          setProduto(produtoEncontrado)
        } else {
          setError("Produto não encontrado")
          toast({
            title: "Erro",
            description: "Produto não encontrado",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error)
        setError("Não foi possível carregar os dados do produto")
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do produto",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    carregarProduto()
  }, [params.id, toast])

  const formatarPreco = (preco: number) => {
    return `R$ ${preco.toFixed(2).replace(".", ",")}`
  }

  const handleSave = (produtoAtualizado: Produto) => {
    setProduto(produtoAtualizado)
    setEditando(false)
    toast({
      title: "Produto atualizado",
      description: "Os dados do produto foram atualizados com sucesso",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Detalhes do Produto</h1>
          </div>
          <Card className="p-6">
            <div className="flex justify-center items-center h-32">
              <LucideLoader2 className="h-8 w-8 text-blue-500 animate-spin mr-2" />
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Detalhes do Produto</h1>
          </div>
          <Card className="p-6">
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-500">{error || "Produto não encontrado"}</p>
              <Button onClick={() => router.push("/estoque")}>
                <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar para Estoque
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={() => router.push("/estoque")} className="mr-4">
              <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {editando ? "Editar Produto" : "Detalhes do Produto"}
            </h1>
          </div>
          {!editando && (
            <Button onClick={() => setEditando(true)}>
              <LucideEdit className="h-4 w-4 mr-2" /> Editar
            </Button>
          )}
        </div>

        <Card className="p-6">
          {editando ? (
            <ProdutoForm produto={produto} onSave={handleSave} onCancel={() => setEditando(false)} />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Informações Básicas</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Nome</p>
                      <p className="font-medium">{produto.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Categoria</p>
                      <p className="font-medium">{produto.categoria}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Custo</p>
                      <p className="font-medium">{formatarPreco(produto.custo || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Preço de Venda</p>
                      <p className="font-medium text-blue-600">{formatarPreco(produto.preco)}</p>
                    </div>
                    {/* Na seção onde exibe as informações do produto, adicionar uma visualização mais detalhada da margem: */}
                    <div>
                      <p className="text-sm text-gray-500">Margem de Lucro</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-medium">{calcularMargem(produto.preco, produto.custo || 0)}%</p>
                        <MargemLucroBadge preco={produto.preco} custo={produto.custo || 0} />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Estoque</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Estoque</p>
                      <Badge
                        variant={produto.tipo_estoque === "unidade" ? "outline" : "secondary"}
                        className="mt-1 flex items-center w-fit gap-1"
                      >
                        {produto.tipo_estoque === "unidade" ? (
                          <LucidePackage className="h-3 w-3" />
                        ) : (
                          <LucideRuler className="h-3 w-3" />
                        )}
                        {produto.tipo_estoque === "unidade" ? "Unidade" : "Par (com tamanhos)"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantidade em Estoque</p>
                      <p className="font-medium">
                        {produto.estoque} {produto.tipo_estoque === "unidade" ? "unidades" : "pares"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
