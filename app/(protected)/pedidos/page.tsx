"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LucidePlus, LucideSearch } from "lucide-react"
import { getPedidos, getFornecedores, type Pedido, type Fornecedor } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function PedidosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtro, setFiltro] = useState("")

  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true)
      try {
        const [pedidosData, fornecedoresData] = await Promise.all([getPedidos(), getFornecedores()])
        setPedidos(pedidosData)
        setFornecedores(fornecedoresData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar a lista de pedidos.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    carregarDados()
  }, [toast])

  const getNomeFornecedor = (fornecedorId: number) => {
    const fornecedor = fornecedores.find((f) => f.id === fornecedorId)
    return fornecedor ? fornecedor.razao_social : "Fornecedor não encontrado"
  }

  const formatarData = (dataString: string) => {
    try {
      return format(parseISO(dataString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dataString
    }
  }

  const formatarPreco = (preco: number) => {
    return `R$ ${preco.toFixed(2).replace(".", ",")}`
  }

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const fornecedorNome = getNomeFornecedor(pedido.fornecedor_id).toLowerCase()
    const filtroLower = filtro.toLowerCase()

    return (
      pedido.id.toString().includes(filtroLower) ||
      fornecedorNome.includes(filtroLower) ||
      pedido.status.toLowerCase().includes(filtroLower) ||
      (pedido.nota_fiscal && pedido.nota_fiscal.toLowerCase().includes(filtroLower))
    )
  })

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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="filtro" className="sr-only">
                  Filtrar
                </Label>
                <div className="relative">
                  <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="filtro"
                    placeholder="Filtrar por ID, fornecedor, status ou nota fiscal..."
                    className="pl-10"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-6 flex justify-center">
              <p className="text-gray-500">Carregando pedidos...</p>
            </CardContent>
          </Card>
        ) : pedidosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">Nenhum pedido encontrado</p>
              <Button onClick={() => router.push("/pedidos/novo")}>
                <LucidePlus className="h-4 w-4 mr-2" /> Criar Novo Pedido
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pedidosFiltrados.map((pedido) => (
              <Card
                key={pedido.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/pedidos/${pedido.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-medium">Pedido #{pedido.id}</h2>
                        <Badge
                          variant={
                            pedido.status === "Recebido"
                              ? "success"
                              : pedido.status === "Cancelado"
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {pedido.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">Fornecedor: {getNomeFornecedor(pedido.fornecedor_id)}</p>
                      <p className="text-sm text-gray-500">Data: {formatarData(pedido.data_pedido)}</p>
                      {pedido.nota_fiscal && <p className="text-sm text-gray-500">Nota Fiscal: {pedido.nota_fiscal}</p>}
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-lg font-medium text-blue-600">{formatarPreco(pedido.total)}</p>
                      <p className="text-sm text-gray-500">
                        {pedido.parcelas} {pedido.parcelas === 1 ? "parcela" : "parcelas"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
