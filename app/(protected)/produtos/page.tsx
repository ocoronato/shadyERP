"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LucidePlus, LucideSearch, LucideEdit, LucideTrash } from "lucide-react"
import { getProdutos, deleteProduto, type Produto } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function ProdutosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        setIsLoading(true)
        const data = await getProdutos()
        setProdutos(data)
        setFilteredProdutos(data)
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    carregarProdutos()
  }, [toast])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProdutos(produtos)
    } else {
      const filtered = produtos.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProdutos(filtered)
    }
  }, [searchTerm, produtos])

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteProduto(id)
        setProdutos(produtos.filter((produto) => produto.id !== id))
        setFilteredProdutos(filteredProdutos.filter((produto) => produto.id !== id))
        toast({
          title: "Produto excluído",
          description: "O produto foi excluído com sucesso.",
        })
      } catch (error) {
        console.error("Erro ao excluir produto:", error)
        toast({
          title: "Erro",
          description: "Não foi possível excluir o produto.",
          variant: "destructive",
        })
      }
    }
  }

  const formatarPreco = (preco: number) => {
    return `R$ ${preco.toFixed(2).replace(".", ",")}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
          <Button onClick={() => router.push("/produtos/novo")}>
            <LucidePlus className="h-4 w-4 mr-2" /> Novo Produto
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Carregando produtos...</p>
          </div>
        ) : filteredProdutos.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Nenhum produto encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProdutos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{produto.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.categoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge variant="outline">{produto.tipo_estoque === "unidade" ? "Unidade" : "Par"}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarPreco(produto.preco)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge
                        variant={produto.estoque > 0 ? "default" : "destructive"}
                        className={produto.estoque > 0 ? "bg-green-100 text-green-800" : ""}
                      >
                        {produto.estoque}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/produtos/${produto.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <LucideEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(produto.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <LucideTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
