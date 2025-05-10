"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addCliente, updateCliente, type Cliente } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface ClienteFormProps {
  cliente: Cliente | null
  onSave: (cliente: Cliente) => void
  onCancel: () => void
}

export default function ClienteForm({ cliente, onSave, onCancel }: ClienteFormProps) {
  // Atualizar o estado inicial do formulário para incluir o campo CPF
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    endereco: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cpfSupported, setCpfSupported] = useState(true) // Estado para controlar se o campo CPF é suportado
  const { toast } = useToast()

  // Atualizar o useEffect para incluir o campo CPF quando estiver editando um cliente
  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || "",
        email: cliente.email || "",
        cpf: cliente.cpf || "",
        telefone: cliente.telefone || "",
        endereco: cliente.endereco || "",
      })

      // Verificar se o cliente tem o campo CPF
      setCpfSupported("cpf" in cliente)
    }
  }, [cliente])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Atualizar a validação do formulário para incluir o CPF como obrigatório apenas se for suportado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome || !formData.email || (cpfSupported && !formData.cpf)) {
      toast({
        title: "Campos obrigatórios",
        description: cpfSupported ? "Nome, email e CPF são obrigatórios!" : "Nome e email são obrigatórios!",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (cliente) {
        // Atualizar cliente existente
        const clienteAtualizado = await updateCliente(cliente.id, formData)
        onSave(clienteAtualizado)
      } else {
        // Adicionar novo cliente
        const novoCliente = await addCliente(formData)
        onSave(novoCliente)
      }
    } catch (error) {
      // Se o erro for relacionado ao campo CPF, desabilitar o campo e tentar novamente
      if (error.message && error.message.includes("cpf")) {
        setCpfSupported(false)
        toast({
          title: "Campo CPF não suportado",
          description: "O campo CPF não está disponível no banco de dados. Execute o SQL para adicionar a coluna.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar o cliente.",
          variant: "destructive",
        })
      }
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium mb-4">{cliente ? "Editar Cliente" : "Novo Cliente"}</h2>

      {/* Adicionar o campo CPF no grid do formulário apenas se for suportado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome completo"
            required
          />
        </div>

        {cpfSupported && (
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              name="cpf"
              type="text"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@exemplo.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            placeholder="Rua, número, bairro"
          />
        </div>
      </div>

      {!cpfSupported && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            O campo CPF não está disponível no banco de dados. Execute o SQL para adicionar a coluna.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : cliente ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
