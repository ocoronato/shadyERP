"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LucideArrowLeft, LucidePrinter, LucideSave, LucideEdit } from "lucide-react"
import { updateVendaStatus } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function VendaDetalhes({ venda, onVoltar, onStatusUpdate }) {
  const [status, setStatus] = useState(venda.status)
  const [editingStatus, setEditingStatus] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Adicionar estilos de impressão quando o componente for montado
  useEffect(() => {
    // Criar um elemento de estilo para impressão
    const style = document.createElement("style")
    style.id = "print-styles"
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-section, .print-section * {
          visibility: visible;
        }
        .print-section {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
        }
        .no-print {
          display: none !important;
        }
      }
    `
    document.head.appendChild(style)

    // Limpar o estilo quando o componente for desmontado
    return () => {
      const printStyle = document.getElementById("print-styles")
      if (printStyle) {
        document.head.removeChild(printStyle)
      }
    }
  }, [])

  const formatarPreco = (preco) => {
    return `R$ ${preco.toFixed(2).replace(".", ",")}`
  }

  const imprimirVenda = () => {
    // Salvar o título original do documento
    const tituloOriginal = document.title

    // Definir o novo título com o ID da venda
    document.title = `Venda_${venda.id}`

    // Imprimir a página
    window.print()

    // Restaurar o título original após um pequeno delay
    setTimeout(() => {
      document.title = tituloOriginal
    }, 100)
  }

  // Adicionar uma mensagem de feedback quando o status for alterado para "Cancelada"
  const handleSaveStatus = async () => {
    if (status === venda.status) {
      setEditingStatus(false)
      return
    }

    setIsSaving(true)
    try {
      await updateVendaStatus(venda.id, status)

      // Mensagem específica para cancelamento
      if (status === "Cancelada") {
        toast({
          title: "Venda cancelada",
          description:
            "O status da venda foi alterado para Cancelada. Os produtos foram devolvidos ao estoque e as contas a receber associadas foram canceladas.",
        })
      } else {
        toast({
          title: "Status atualizado",
          description: "O status da venda foi atualizado com sucesso.",
        })
      }

      // Atualizar a venda na lista
      onStatusUpdate({ ...venda, status })
      setEditingStatus(false)
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da venda.",
        variant: "destructive",
      })
      console.error("Erro ao atualizar status:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 no-print">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={onVoltar} className="mr-4">
            <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <h2 className="text-lg font-medium">Detalhes da Venda #{venda.id}</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={imprimirVenda}>
            <LucidePrinter className="h-4 w-4 mr-2" /> Imprimir
          </Button>
        </div>
      </div>

      <div className="print-section">
        <h2 className="text-xl font-bold mb-4">Detalhes da Venda #{venda.id}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Cliente</p>
            <p className="font-medium">{venda.cliente}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data</p>
            <p className="font-medium">{venda.data}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            {editingStatus ? (
              <div className="flex items-center space-x-2 no-print">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleSaveStatus} disabled={isSaving}>
                  {isSaving ? "Salvando..." : <LucideSave className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    status === "Concluída"
                      ? "bg-green-100 text-green-800"
                      : status === "Cancelada"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {status}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setEditingStatus(true)} className="no-print">
                  <LucideEdit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="font-medium text-blue-600">{formatarPreco(venda.total)}</p>
          </div>

          {/* Informações de pagamento */}
          {venda.forma_pagamento && (
            <div>
              <p className="text-sm text-gray-500">Forma de Pagamento</p>
              <p className="font-medium">{venda.forma_pagamento}</p>
            </div>
          )}

          {venda.parcelas && venda.parcelas > 1 && (
            <div>
              <p className="text-sm text-gray-500">Parcelas</p>
              <p className="font-medium">
                {venda.parcelas}x de {formatarPreco(venda.valor_parcela || venda.total / venda.parcelas)}
              </p>
            </div>
          )}
        </div>

        <h3 className="text-md font-medium mb-2">Itens da Venda</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Unitário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {venda.itens.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.produto}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantidade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatarPreco(item.preco_unitario)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatarPreco(item.quantidade * item.preco_unitario)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {formatarPreco(venda.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
