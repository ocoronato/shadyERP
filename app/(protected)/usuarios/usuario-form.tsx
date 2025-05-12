"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { addUsuario, updateUsuario, type Usuario } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface UsuarioFormProps {
  usuario: Usuario | null
  onSave: (usuario: Usuario) => void
  onCancel: () => void
}

export default function UsuarioForm({ usuario, onSave, onCancel }: UsuarioFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    cargo: "Operador",
    ativo: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || "",
        email: usuario.email || "",
        senha: "", // Não preencher a senha ao editar
        cargo: usuario.cargo || "Operador",
        ativo: usuario.ativo !== undefined ? usuario.ativo : true,
      })
    }
  }, [usuario])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome || !formData.email || (!usuario && !formData.senha)) {
      toast({
        title: "Campos obrigatórios",
        description: usuario ? "Nome e email são obrigatórios!" : "Nome, email e senha são obrigatórios!",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (usuario) {
        // Se estiver editando e a senha estiver vazia, não enviar a senha
        const dadosParaAtualizar = formData.senha
          ? formData
          : {
              nome: formData.nome,
              email: formData.email,
              cargo: formData.cargo,
              ativo: formData.ativo,
            }

        const usuarioAtualizado = await updateUsuario(usuario.id, dadosParaAtualizar)
        onSave(usuarioAtualizado)
      } else {
        const novoUsuario = await addUsuario(formData)
        onSave(novoUsuario)
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o usuário.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium mb-4">{usuario ? "Editar Usuário" : "Novo Usuário"}</h2>

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
          <Label htmlFor="senha">{usuario ? "Nova Senha (opcional)" : "Senha"}</Label>
          <Input
            id="senha"
            name="senha"
            type="password"
            value={formData.senha}
            onChange={handleChange}
            placeholder={usuario ? "Deixe em branco para manter a atual" : "Senha"}
            required={!usuario}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo</Label>
          <Select value={formData.cargo} onValueChange={(value) => setFormData((prev) => ({ ...prev, cargo: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Administrador">Administrador</SelectItem>
              <SelectItem value="Gerente">Gerente</SelectItem>
              <SelectItem value="Operador">Operador</SelectItem>
              <SelectItem value="Vendedor">Vendedor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {usuario && (
          <div className="space-y-2">
            <Label htmlFor="ativo" className="block mb-2">
              Ativo
            </Label>
            <div className="flex items-center">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, ativo: checked }))}
              />
              <Label htmlFor="ativo" className="ml-2">
                {formData.ativo ? "Sim" : "Não"}
              </Label>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : usuario ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
