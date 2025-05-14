"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addContaPagar, updateContaPagar, getFornecedores, type ContaPagar, type Fornecedor } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface ContaPagarFormProps {
  conta: ContaPagar | null
  onSave: (conta: ContaPagar) => void
  onCancel: () => void
}

export default function ContaPagarForm({ conta, onSave, onCancel }: ContaPagarFormProps) {
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    data_vencimento: "",
    data_pagamento: "",
    status: "Pendente",
    fornecedor_id: "", // Alterado para fornecedor_id
    observacao: "",
  })
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Carregar fornecedores ao montar o componente
  useEffect(() => {
    async function carregarFornecedores() {
      try {
        const data = await getFornecedores()
        setFornecedores(data)
      } catch (error) {
        console.error("Erro ao carregar fornecedores:", error)
        toast({
          title: "Erro ao carregar fornecedores",
          description: "Não foi possível carregar a lista de fornecedores.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    carregarFornecedores()
  }, [toast])

  useEffect(() => {
    if (conta) {
      setFormData({
        descricao: conta.descricao || "",
        valor: conta.valor ? conta.valor.toString() : "",
        data_vencimento: conta.data_vencimento || "",
        data_pagamento: conta.data_pagamento || "",
        status: conta.status || "Pendente",
        fornecedor_id: conta.fornecedor_id ? conta.fornecedor_id.toString() : "",
        observacao: conta.observacao || "",
      })
    } else {
      // Definir a data de vencimento padrão como hoje
      const hoje = new Date().toISOString().split("T")[0]
      setFormData((prev) => ({
        ...prev,
        data_vencimento: hoje,
      }))
    }
  }, [conta])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.descricao || !formData.valor || !formData.data_vencimento) {
      toast({
        title: "Campos obrigatórios",
        description: "Descrição, valor e data de vencimento são obrigatórios!",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const contaFinal = {
        descricao: formData.descricao,
        valor: Number.parseFloat(formData.valor),
        data_vencimento: formData.data_vencimento,
        data_pagamento: formData.data_pagamento || null,
        status: formData.status,
        fornecedor_id: formData.fornecedor_id ? Number.parseInt(formData.fornecedor_id) : null,
        observacao: formData.observacao || null,
      }

      if (conta) {
        // Atualizar conta existente
        const contaAtualizada = await updateContaPagar(conta.id, contaFinal)
        onSave(contaAtualizada)
      } else {
        // Adicionar nova conta
        const novaConta = await addContaPagar(contaFinal)
        onSave(novaConta)
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a conta.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center">Carregando fornecedores...</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium mb-4">{conta ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Input
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descrição da conta"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fornecedor_id">Fornecedor</Label>
          <Select
            value={formData.fornecedor_id}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, fornecedor_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {fornecedores.map((fornecedor) => (
                <SelectItem key={fornecedor.id} value={fornecedor.id.toString()}>
                  {fornecedor.razao_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor">Valor (R$)</Label>
          <Input
            id="valor"
            name="valor"
            type="number"
            step="0.01"
            min="0"
            value={formData.valor}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_vencimento">Data de Vencimento</Label>
          <Input
            id="data_vencimento"
            name="data_vencimento"
            type="date"
            value={formData.data_vencimento}
            onChange={handleChange}
            required
          />
        </div>

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
              <SelectItem value="Pago">Pago</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.status === "Pago" && (
          <div className="space-y-2">
            <Label htmlFor="data_pagamento">Data de Pagamento</Label>
            <Input
              id="data_pagamento"
              name="data_pagamento"
              type="date"
              value={formData.data_pagamento}
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : conta ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
