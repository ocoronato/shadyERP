"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addProduto, updateProduto, type Produto } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface ProdutoFormProps {
  produto: Produto | null
  onSave: (produto: Produto) => void
  onCancel: () => void
}

export default function ProdutoForm({ produto, onSave, onCancel }: ProdutoFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    preco: "",
    estoque: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const categorias = ["Eletrônicos", "Periféricos", "Acessórios", "Móveis", "Outros"]

  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome || "",
        categoria: produto.categoria || "",
        preco: produto.preco ? produto.preco.toString() : "",
        estoque: produto.estoque ? produto.estoque.toString() : "",
      })
    }
  }, [produto])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoriaChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoria: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome || !formData.categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e categoria são obrigatórios!",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const produtoFinal = {
        nome: formData.nome,
        categoria: formData.categoria,
        preco: Number.parseFloat(formData.preco) || 0,
        estoque: Number.parseInt(formData.estoque) || 0,
      }

      if (produto) {
        // Atualizar produto existente
        const produtoAtualizado = await updateProduto(produto.id, produtoFinal)
        onSave(produtoAtualizado)
      } else {
        // Adicionar novo produto
        const novoProduto = await addProduto(produtoFinal)
        onSave(novoProduto)
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o produto.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium mb-4">{produto ? "Editar Produto" : "Novo Produto"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome do produto"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={formData.categoria} onValueChange={handleCategoriaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preco">Preço (R$)</Label>
          <Input
            id="preco"
            name="preco"
            type="number"
            step="0.01"
            min="0"
            value={formData.preco}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estoque">Estoque</Label>
          <Input
            id="estoque"
            name="estoque"
            type="number"
            min="0"
            value={formData.estoque}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : produto ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
