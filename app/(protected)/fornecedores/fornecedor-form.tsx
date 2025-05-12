"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { addFornecedor, updateFornecedor, type Fornecedor } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface FornecedorFormProps {
  fornecedor: Fornecedor | null
  onSave: (fornecedor: Fornecedor) => void
  onCancel: () => void
}

export default function FornecedorForm({ fornecedor, onSave, onCancel }: FornecedorFormProps) {
  const [formData, setFormData] = useState({
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    inscricao_estadual: "",
    inscricao_estadual_isento: false,
    data_nascimento: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (fornecedor) {
      setFormData({
        cnpj: fornecedor.cnpj || "",
        razao_social: fornecedor.razao_social || "",
        nome_fantasia: fornecedor.nome_fantasia || "",
        inscricao_estadual: fornecedor.inscricao_estadual || "",
        inscricao_estadual_isento: fornecedor.inscricao_estadual_isento || false,
        data_nascimento: fornecedor.data_nascimento ? fornecedor.data_nascimento.split("T")[0] : "",
      })
    }
  }, [fornecedor])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      inscricao_estadual_isento: checked,
      // Se marcar como isento, limpar o campo de inscrição estadual
      inscricao_estadual: checked ? "" : prev.inscricao_estadual,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.cnpj || !formData.razao_social) {
      toast({
        title: "Campos obrigatórios",
        description: "CNPJ e Razão Social são obrigatórios!",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const fornecedorFinal = {
        cnpj: formData.cnpj,
        razao_social: formData.razao_social,
        nome_fantasia: formData.nome_fantasia || null,
        inscricao_estadual: formData.inscricao_estadual_isento ? null : formData.inscricao_estadual || null,
        inscricao_estadual_isento: formData.inscricao_estadual_isento,
        data_nascimento: formData.data_nascimento || null,
      }

      if (fornecedor) {
        // Atualizar fornecedor existente
        const fornecedorAtualizado = await updateFornecedor(fornecedor.id, fornecedorFinal)
        onSave(fornecedorAtualizado)
      } else {
        // Adicionar novo fornecedor
        const novoFornecedor = await addFornecedor(fornecedorFinal)
        onSave(novoFornecedor)
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o fornecedor.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para formatar CNPJ enquanto digita
  const formatarCNPJ = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cnpjLimpo = value.replace(/\D/g, "")

    // Aplica a máscara do CNPJ: XX.XXX.XXX/XXXX-XX
    let cnpjFormatado = ""
    if (cnpjLimpo.length <= 2) {
      cnpjFormatado = cnpjLimpo
    } else if (cnpjLimpo.length <= 5) {
      cnpjFormatado = `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2)}`
    } else if (cnpjLimpo.length <= 8) {
      cnpjFormatado = `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2, 5)}.${cnpjLimpo.slice(5)}`
    } else if (cnpjLimpo.length <= 12) {
      cnpjFormatado = `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2, 5)}.${cnpjLimpo.slice(5, 8)}/${cnpjLimpo.slice(8)}`
    } else {
      cnpjFormatado = `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2, 5)}.${cnpjLimpo.slice(5, 8)}/${cnpjLimpo.slice(8, 12)}-${cnpjLimpo.slice(12, 14)}`
    }

    return cnpjFormatado
  }

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const cnpjFormatado = formatarCNPJ(value)
    setFormData((prev) => ({ ...prev, cnpj: cnpjFormatado }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium mb-4">{fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleCNPJChange}
            placeholder="XX.XXX.XXX/XXXX-XX"
            maxLength={18}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="razao_social">Razão Social</Label>
          <Input
            id="razao_social"
            name="razao_social"
            value={formData.razao_social}
            onChange={handleChange}
            placeholder="Razão Social do fornecedor"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
          <Input
            id="nome_fantasia"
            name="nome_fantasia"
            value={formData.nome_fantasia}
            onChange={handleChange}
            placeholder="Nome Fantasia (opcional)"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="inscricao_estadual_isento"
                checked={formData.inscricao_estadual_isento}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="inscricao_estadual_isento" className="text-sm">
                Isento
              </Label>
            </div>
          </div>
          <Input
            id="inscricao_estadual"
            name="inscricao_estadual"
            value={formData.inscricao_estadual}
            onChange={handleChange}
            placeholder="Inscrição Estadual"
            disabled={formData.inscricao_estadual_isento}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_nascimento">Data de Nascimento</Label>
          <Input
            id="data_nascimento"
            name="data_nascimento"
            type="date"
            value={formData.data_nascimento}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : fornecedor ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
