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
    user: "",
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
        user: usuario.user || "",
        senha: "",
        cargo: usuario.cargo || "Operador",
        ativo: usuario.ativo !== undefined ? usuario.ativo : true,
      })
    } else {
      setFormData({
        nome: "",
        email: "",
        user: "",
        senha: "",
        cargo: "Operador",
        ativo: true,
      })
    }
  }, [usuario])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.user.includes("@")) {
      toast({
        title: "Nome de Usuário Inválido",
        description: "O nome de usuário (User) não pode conter o caractere '@'.",
        variant: "destructive",
      })
      return
    }

    if (!formData.nome || !formData.email || (!usuario && !formData.senha) || !formData.user) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, Email, User e Senha (para novo usuário) são obrigatórios!",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (usuario) {
        const dadosParaAtualizar: Partial<Usuario> & { senha?: string } = {
          nome: formData.nome,
          email: formData.email,
          user: formData.user,
          cargo: formData.cargo,
          ativo: formData.ativo,
        }
        if (formData.senha) {
          dadosParaAtualizar.senha = formData.senha
        }

        const usuarioAtualizado = await updateUsuario(usuario.id, dadosParaAtualizar)
        onSave(usuarioAtualizado)
      } else {
        const novoUsuario = await addUsuario(formData)
        onSave(novoUsuario)
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o usuário.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="text-gray-200">
      <h2 className="text-lg font-medium mb-4 text-gray-100">{usuario ? "Editar Usuário" : "Novo Usuário"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-gray-300">
            Nome
          </Label>
          <Input
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome completo"
            required
            className="bg-neutral-700 border-neutral-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@exemplo.com"
            required
            className="bg-neutral-700 border-neutral-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user" className="text-gray-300">
            User (Nome de Usuário)
          </Label>
          <Input
            id="user"
            name="user"
            value={formData.user}
            onChange={handleChange}
            placeholder="Nome de usuário (sem @)"
            required
            className="bg-neutral-700 border-neutral-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha" className="text-gray-300">
            {usuario ? "Nova Senha (opcional)" : "Senha"}
          </Label>
          <Input
            id="senha"
            name="senha"
            type="password"
            value={formData.senha}
            onChange={handleChange}
            placeholder={usuario ? "Deixe em branco para manter a atual" : "Senha"}
            required={!usuario}
            className="bg-neutral-700 border-neutral-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cargo" className="text-gray-300">
            Cargo
          </Label>
          <Select value={formData.cargo} onValueChange={(value) => setFormData((prev) => ({ ...prev, cargo: value }))}>
            <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white focus:ring-indigo-500 focus:border-indigo-500">
              <SelectValue placeholder="Selecione um cargo" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700 text-gray-200">
              <SelectItem value="Administrador" className="hover:bg-neutral-700">
                Administrador
              </SelectItem>
              <SelectItem value="Gerente" className="hover:bg-neutral-700">
                Gerente
              </SelectItem>
              <SelectItem value="Operador" className="hover:bg-neutral-700">
                Operador
              </SelectItem>
              <SelectItem value="Vendedor" className="hover:bg-neutral-700">
                Vendedor
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {usuario && (
          <div className="space-y-2">
            <Label htmlFor="ativo" className="block mb-2 text-gray-300">
              Ativo
            </Label>
            <div className="flex items-center">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, ativo: checked }))}
                className="data-[state=checked]:bg-indigo-600"
              />
              <Label htmlFor="ativo" className="ml-2 text-gray-300">
                {formData.ativo ? "Sim" : "Não"}
              </Label>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {isSubmitting ? "Salvando..." : usuario ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
