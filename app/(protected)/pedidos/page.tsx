"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucidePlus, LucideEdit, LucideTrash2 } from "lucide-react"
import { getPedidos, deletePedido, updatePedidoStatus } from "@/lib/supabase"

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPedidos()
  }, [])

  async function loadPedidos() {
    try {
      setLoading(true)
      const data = await getPedidos()
      setPedidos(data)
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (window.confirm("Tem certeza que deseja excluir este pedido?")) {
      try {
        await deletePedido(id)
        loadPedidos()
      } catch (error) {
        console.error("Erro ao excluir pedido:", error)
        alert("Erro ao excluir pedido. Verifique o console para mais detalhes.")
      }
    }
  }

  async function handleStatusChange(id: number, status: string) {
    try {
      await updatePedidoStatus(id, status)
      loadPedidos()
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error)
      alert("Erro ao atualizar status do pedido. Verifique o console para mais detalhes.")
    }
  }

  return (
    <div className="space-y-6 text-gray-200">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">Pedidos</h1>
        <Link href="/pedidos/novo">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <LucidePlus className="mr-2 h-4 w-4" /> Novo Pedido
          </Button>
        </Link>
      </div>

      <Card className="bg-neutral-800 shadow-lg border-neutral-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhum pedido encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="py-2 px-4 text-left text-gray-300">ID</th>
                    <th className="py-2 px-4 text-left text-gray-300">Marca</th>
                    <th className="py-2 px-4 text-left text-gray-300">Fornecedor</th>
                    <th className="py-2 px-4 text-left text-gray-300">Previsão de Entrega</th>
                    <th className="py-2 px-4 text-left text-gray-300">Status</th>
                    <th className="py-2 px-4 text-left text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="border-b border-neutral-700 hover:bg-neutral-700/50">
                      <td className="py-2 px-4 text-gray-300">{pedido.id}</td>
                      <td className="py-2 px-4 text-gray-300">{pedido.marca || "-"}</td>
                      <td className="py-2 px-4 text-gray-300">{pedido.fornecedor_nome || "-"}</td>
                      <td className="py-2 px-4 text-gray-300">
                        {pedido.previsao_entrega ? new Date(pedido.previsao_entrega).toLocaleDateString("pt-BR") : "-"}
                      </td>
                      <td className="py-2 px-4 text-gray-300">
                        <select
                          value={pedido.status}
                          onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                          className="border rounded p-1 bg-neutral-700 border-neutral-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Em Processamento">Em Processamento</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregue">Entregue</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td className="py-2 px-4 text-gray-300">
                        <div className="flex space-x-2">
                          <Link href={`/pedidos/${pedido.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white"
                            >
                              <LucideEdit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(pedido.id)}
                            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                          >
                            <LucideTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
