"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LucideArrowLeft, LucideSave } from "lucide-react"
import { updateContaReceber, type ContaReceber } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface ContaReceberDetalhesProps {
  conta: ContaReceber
  onVoltar: () => void
  onStatusUpdate: (conta: ContaReceber) => void
}

export default function ContaReceberDetalhes({ conta, onVoltar, onStatusUpdate }: ContaReceberDetalhesProps) {
  const [editando, setEditando] = useState(false)
  const [formData, setFormData] = useState({
    status: conta.status,
    data_recebimento: conta.data_recebimento || "",
    observacao: conta.observacao || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const contaAtualizada = await updateContaReceber(conta.id, {
        status: formData.status,
        data_recebimento:
          formData.status === "Recebido" ? formData.data_recebimento || new Date().toISOString().split("T")[0] : null,
        observacao: formData.observacao,
      })

      onStatusUpdate(contaAtualizada)
      setEditando(false)

      toast({
        title: "Conta atualizada",
        description: "Os dados da conta foram atualizados com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a conta.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={onVoltar} className="mr-4">
            <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <h2 className="text-lg font-medium">Detalhes da Conta a Receber</h2>
        </div>
        <div>{!editando && <Button onClick={() => setEditando(true)}>Editar</Button>}</div>
      </div>

      {editando ? (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Recebido">Recebido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === "Recebido" && (
              <div className="space-y-2">
                <Label htmlFor="data_recebimento">Data de Recebimento</Label>
                <Input
                  id="data_recebimento"
                  name="data_recebimento"
                  type="date"
                  value={formData.data_recebimento}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                name="observacao"
                value={formData.observacao}
                onChange={handleChange}
                placeholder="Observações adicionais"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setEditando(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Salvando..."
              ) : (
                <>
                  <LucideSave className="h-4 w-4 mr-2" /> Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Cliente</h3>
            <p className="text-base">{conta.cliente}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Valor</h3>
            <p className="text-base font-medium text-blue-600">{formatarPreco(conta.valor)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Data de Vencimento</h3>
            <p className="text-base">{formatarData(conta.data_vencimento)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <Badge variant={conta.status === "Recebido" ? "success" : "warning"}>{conta.status}</Badge>
          </div>

          {conta.data_recebimento && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Data de Recebimento</h3>
              <p className="text-base">{formatarData(conta.data_recebimento)}</p>
            </div>
          )}

          {conta.parcela && conta.total_parcelas && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Parcela</h3>
              <p className="text-base">
                {conta.parcela} de {conta.total_parcelas}
              </p>
            </div>
          )}

          {conta.venda_id && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Venda</h3>
              <p className="text-base">#{conta.venda_id}</p>
            </div>
          )}

          {conta.observacao && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Observação</h3>
              <p className="text-base">{conta.observacao}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
