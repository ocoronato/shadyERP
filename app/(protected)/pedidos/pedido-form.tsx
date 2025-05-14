"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LucideLoader2 } from "lucide-react"
import { getFornecedores, createPedido } from "@/lib/supabase"

interface PedidoFormProps {
  pedidoId?: number
  initialData?: any
  onSuccess?: (id: number) => void
}

export default function PedidoForm({ pedidoId, initialData, onSuccess }: PedidoFormProps) {
  const router = useRouter()
  const [fornecedores, setFornecedores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    marca: "",
    fornecedor_id: "",
    previsao_entrega: "",
  })

  useEffect(() => {
    async function loadData() {
      try {
        const fornecedoresData = await getFornecedores()
        setFornecedores(fornecedoresData || [])

        if (initialData) {
          setFormData(initialData)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const fornecedor = fornecedores.find((f) => f.id === Number.parseInt(formData.fornecedor_id))
      const pedidoData = {
        ...formData,
        fornecedor_nome: fornecedor ? fornecedor.razao_social : "",
        status: "Pendente",
      }

      let id
      if (pedidoId) {
        // Lógica para atualizar pedido existente
        // id = await updatePedido(pedidoId, pedidoData)
      } else {
        // Criar novo pedido
        id = await createPedido(pedidoData)
      }

      if (onSuccess) {
        onSuccess(id)
      } else {
        router.push(`/pedidos/${id}`)
      }
    } catch (error) {
      console.error("Erro ao salvar pedido:", error)
      alert("Erro ao salvar pedido. Verifique o console para mais detalhes.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Marca</label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className="w-full border rounded-md p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fornecedor</label>
              <select
                name="fornecedor_id"
                value={formData.fornecedor_id}
                onChange={handleChange}
                className="w-full border rounded-md p-2"
                required
              >
                <option value="">Selecione um fornecedor</option>
                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.razao_social}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Previsão de Entrega</label>
              <input
                type="date"
                name="previsao_entrega"
                value={formData.previsao_entrega}
                onChange={handleChange}
                className="w-full border rounded-md p-2"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.push("/pedidos")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {pedidoId ? "Atualizar Pedido" : "Criar Pedido"}
        </Button>
      </div>
    </form>
  )
}
