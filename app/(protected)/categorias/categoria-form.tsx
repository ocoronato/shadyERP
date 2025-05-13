"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addCategoria, updateCategoria, getCategorias, type Categoria } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface CategoriaFormProps {
  categoria: Categoria | null
  onSave: (categoria: Categoria) => void
  onCancel: () => void
}

export default function CategoriaForm({ categoria, onSave, onCancel }: CategoriaFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria_pai_id: null as number | null,
  })
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Carregar categorias para o select de categoria pai
  useEffect(() => {
    async function carregarCategorias() {
      try {
        const data = await getCategorias()
        // Filtrar a categoria atual (se estiver editando) para evitar ciclos
        const categoriasDisponiveis = categoria ? data.filter((cat) => cat.id !== categoria.id) : data
        setCategorias(categoriasDisponiveis)
      } catch (error) {
        console.error("Erro ao carregar categorias:", error)
      } finally {
        setIsLoading(false)
      }
    }

    carregarCategorias()
  }, [categoria])

  useEffect(() => {
    if (categoria) {
      setFormData({
        nome: categoria.nome || "",
        descricao: categoria.descricao || "",
        categoria_pai_id: categoria.categoria_pai_id || null,
      })
    }
  }, [categoria])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome) {
      toast({
        title: "Nome obrigatório",
        description: "O nome da categoria é obrigatório!",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const categoriaDados = {
        nome: formData.nome,
        descricao: formData.descricao,
        categoria_pai_id: formData.categoria_pai_id,
      }

      if (categoria) {
        // Atualizar categoria existente
        const categoriaAtualizada = await updateCategoria(categoria.id, categoriaDados)
        onSave(categoriaAtualizada)
      } else {
        // Adicionar nova categoria
        const novaCategoria = await addCategoria(categoriaDados)
        onSave(novaCategoria)
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a categoria.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center">Carregando categorias...</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium mb-4">{categoria ? "Editar Categoria" : "Nova Categoria"}</h2>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome da categoria"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria_pai_id">Categoria Pai (opcional)</Label>
          <Select
            value={formData.categoria_pai_id?.toString() || ""}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                categoria_pai_id: value ? Number.parseInt(value) : null,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria pai (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Nenhuma (Categoria Principal)</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descrição da categoria"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : categoria ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
