"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LucidePlus, LucideSearch, LucideEye, LucideTrash } from "lucide-react"
import { getPedidos, deletePedido, getFornecedores, type Pedido, type Fornecedor } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function PedidosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Usar useCallback para evitar recriações desnecessárias da função
  const carregarDados = useCallback(async () => {
    try {
      setIsLoading(true)
      const [pedidosData, fornecedoresData] = await Promise.all([getPedidos(), getFornecedores()])
      setPedidos(pedidosData)
      setFornecedores(fornecedoresData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // Função para obter o nome do fornecedor
  const getNomeFornecedor = useCallback(
    (fornecedorId: number) => {
      const fornecedor = fornecedores.find((f) => f.id === fornecedorId)
      return fornecedor ? fornecedor.razao_social : "Fornecedor não encontrado"
    },
    [fornecedores],
  )

  // Usar useMemo para calcular pedidos filtrados apenas quando necessário
  const filteredPedidos = useMemo(() => {
    if (searchTerm.trim() === "") {
      return pedidos
    }

    const searchTermLower = searchTerm.toLowerCase()
    return pedidos.filter((pedido) => {
      const fornecedorNome = getNomeFornecedor(pedido.fornecedor_id).toLowerCase()
      return fornecedorNome.includes(searchTermLower) || pedido.status.toLowerCase().includes(searchTermLower)
    })
  }, [searchTerm, pedidos, getNomeFornecedor])

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este pedido?")) {
      try {
        await deletePedido(id)
        setPedidos(pedidos.filter((pedido) => pedido.id !== id))
        toast({
          title: "Pedido excluído",
          description: "O pedido foi excluído com sucesso.",
        })
      } catch (error) {
        console.error("Erro ao excluir pedido:", error)
        toast({
          title: "Erro",
          description: "Não foi possível excluir o pedido.",
          variant: "destructive",
        })
      }
    }
  }

  const formatarData = useCallback((dataString: string) => {
    try {
      return format(parseISO(dataString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dataString
    }
  }, [])

  const formatarPreco = useCallback((preco: number) => {
    return `R$ ${preco.toFixed(2).replace(".", ",")}`
  }, [])

  const getStatusBadgeVariant = useCallback((status: string) => {
    switch (status) {
      case "Recebido":
        return "success"
      case "Cancelado":
        return "destructive"
      default:
        return "warning"
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Pedidos</h1>
          <Button onClick={() => router.push("/pedidos/novo")}>
            <LucidePlus className="h-4 w-4 mr-2" /> Novo Pedido
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar pedidos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Carregando pedidos...</p>
          </div>
        ) : filteredPedidos.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Nenhum pedido encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{pedido.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getNomeFornecedor(pedido.fornecedor_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(pedido.data_pedido)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarPreco(pedido.total)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge variant={getStatusBadgeVariant(pedido.status)}>{pedido.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/pedidos/${pedido.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <LucideEye className="h-4 w-4" />
                        </Button>
                        {pedido.status !== "Recebido" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(pedido.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <LucideTrash className="h-4 w-4" />
                          </Button>
                        )}
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
