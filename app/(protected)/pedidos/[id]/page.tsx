"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideArrowLeft, LucideTrash2 } from "lucide-react"
import { getPedidoById, getProdutosPedido, deletePedido, updatePedidoStatus } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"

export default function PedidoDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const [pedido, setPedido] = useState<any>(null)
  const [itensPedido, setItensPedido] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadPedido(Number(params.id))
    }
  }, [params.id])

  async function loadPedido(id: number) {
    try {
      setLoading(true)
      const pedidoData = await getPedidoById(id)
      const itensPedidoData = await getProdutosPedido(id)

      setPedido(pedidoData)
      setItensPedido(itensPedidoData)
    } catch (error) {
      console.error("Erro ao carregar pedido:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (window.confirm("Tem certeza que deseja excluir este pedido?")) {
      try {
        await deletePedido(Number(params.id))
        router.push("/pedidos")
      } catch (error) {
        console.error("Erro ao excluir pedido:", error)
        alert("Erro ao excluir pedido. Verifique o console para mais detalhes.")
      }
    }
  }

  async function handleStatusChange(status: string) {
    try {
      await updatePedidoStatus(Number(params.id), status)
      loadPedido(Number(params.id))
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error)
      alert("Erro ao atualizar status do pedido. Verifique o console para mais detalhes.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Pedido não encontrado.</p>
        <Button className="mt-4" onClick={() => router.push("/pedidos")}>
          <LucideArrowLeft className="mr-2 h-4 w-4" /> Voltar para Pedidos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Detalhes do Pedido #{pedido.id}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/pedidos")}>
            <LucideArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <LucideTrash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Marca</p>
              <p className="font-medium">{pedido.marca || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fornecedor</p>
              <p className="font-medium">{pedido.fornecedor_nome || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Previsão de Entrega</p>
              <p className="font-medium">
                {pedido.previsao_entrega ? new Date(pedido.previsao_entrega).toLocaleDateString("pt-BR") : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <select
                value={pedido.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="border rounded p-1 mt-1"
              >
                <option value="Pendente">Pendente</option>
                <option value="Em Processamento">Em Processamento</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data de Criação</p>
              <p className="font-medium">
                {pedido.created_at ? new Date(pedido.created_at).toLocaleString("pt-BR") : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {itensPedido.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Produto</th>
                    <th className="py-2 px-4 text-left">Quantidade</th>
                    <th className="py-2 px-4 text-left">Preço Unitário</th>
                    <th className="py-2 px-4 text-left">Tamanho</th>
                    <th className="py-2 px-4 text-left">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {itensPedido.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{item.produto_nome}</td>
                      <td className="py-2 px-4">{item.quantidade}</td>
                      <td className="py-2 px-4">{formatCurrency(item.preco_unitario)}</td>
                      <td className="py-2 px-4">{item.tamanho || "-"}</td>
                      <td className="py-2 px-4">{formatCurrency(item.quantidade * item.preco_unitario)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
