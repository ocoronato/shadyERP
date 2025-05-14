"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  addProduto,
  updateProduto,
  getCategorias,
  getEstoqueTamanhos,
  type Produto,
  type Categoria,
} from "@/lib/supabase"
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
    tipo_estoque: "unidade" as "unidade" | "par",
  })
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [estoqueTamanhos, setEstoqueTamanhos] = useState<{ tamanho: number; quantidade: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Gerar array de tamanhos de 1 a 50
  const tamanhos = Array.from({ length: 50 }, (_, i) => i + 1)

  useEffect(() => {
    async function carregarDados() {
      try {
        const categoriasData = await getCategorias()
        setCategorias(categoriasData)

        if (produto?.id && produto.tipo_estoque === "par") {
          const estoqueTamanhosData = await getEstoqueTamanhos(produto.id)
          setEstoqueTamanhos(
            estoqueTamanhosData.map((et) => ({
              tamanho: et.tamanho,
              quantidade: et.quantidade,
            })),
          )
        } else {
          // Inicializar estoque de tamanhos vazio
          setEstoqueTamanhos(
            tamanhos.map((tamanho) => ({
              tamanho,
              quantidade: 0,
            })),
          )
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados necessários.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    carregarDados()
  }, [produto, toast])

  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome || "",
        categoria: produto.categoria || "",
        preco: produto.preco ? produto.preco.toString() : "",
        estoque: produto.estoque ? produto.estoque.toString() : "",
        tipo_estoque: produto.tipo_estoque || "unidade",
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

  const handleTipoEstoqueChange = (value: "unidade" | "par") => {
    setFormData((prev) => ({ ...prev, tipo_estoque: value }))
  }

  const handleTamanhoQuantidadeChange = (tamanho: number, quantidade: string) => {
    const quantidadeNum = Number.parseInt(quantidade) || 0
    setEstoqueTamanhos((prev) => prev.map((et) => (et.tamanho === tamanho ? { ...et, quantidade: quantidadeNum } : et)))
  }

  const calcularEstoqueTotal = () => {
    return estoqueTamanhos.reduce((total, et) => total + et.quantidade, 0)
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
        estoque: formData.tipo_estoque === "unidade" ? Number.parseInt(formData.estoque) || 0 : calcularEstoqueTotal(),
        tipo_estoque: formData.tipo_estoque,
      }

      // Filtrar apenas os tamanhos com quantidade > 0 para produtos do tipo "par"
      const tamanhosFiltrados = formData.tipo_estoque === "par" ? estoqueTamanhos.filter((et) => et.quantidade > 0) : []

      if (produto) {
        // Atualizar produto existente
        const produtoAtualizado = await updateProduto(produto.id, produtoFinal, tamanhosFiltrados)
        onSave(produtoAtualizado)
      } else {
        // Adicionar novo produto
        const novoProduto = await addProduto(produtoFinal, tamanhosFiltrados)
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

  // Organizar categorias em hierarquia para o select
  const categoriasHierarquicas = categorias.filter((cat) => !cat.categoria_pai_id)

  // Função para encontrar subcategorias
  const encontrarSubcategorias = (categoriaId: number) => {
    return categorias.filter((cat) => cat.categoria_pai_id === categoriaId)
  }

  // Função para renderizar opções de categoria com indentação
  const renderizarOpcoesCategoria = (categorias: Categoria[], nivel = 0) => {
    return categorias.flatMap((categoria) => {
      const subcategorias = encontrarSubcategorias(categoria.id)
      const indentacao = nivel > 0 ? "—".repeat(nivel) + " " : ""

      return [
        <SelectItem key={categoria.id} value={categoria.nome}>
          {indentacao}
          {categoria.nome}
        </SelectItem>,
        ...renderizarOpcoesCategoria(subcategorias, nivel + 1),
      ]
    })
  }

  if (isLoading) {
    return <div className="p-4 text-center">Carregando dados...</div>
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
            <SelectContent>{renderizarOpcoesCategoria(categoriasHierarquicas)}</SelectContent>
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
          <Label>Tipo de Estoque</Label>
          <RadioGroup
            value={formData.tipo_estoque}
            onValueChange={(value) => handleTipoEstoqueChange(value as "unidade" | "par")}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unidade" id="unidade" />
              <Label htmlFor="unidade" className="cursor-pointer">
                Unidade
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="par" id="par" />
              <Label htmlFor="par" className="cursor-pointer">
                Par (com tamanhos)
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {formData.tipo_estoque === "unidade" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
      ) : (
        <div className="mt-4 mb-6">
          <Label>Estoque por Tamanho</Label>
          <Card className="mt-2">
            <CardContent className="pt-4">
              <Tabs defaultValue="grid" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="grid">Visualização em Grade</TabsTrigger>
                  <TabsTrigger value="list">Visualização em Lista</TabsTrigger>
                </TabsList>

                <TabsContent value="grid" className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {estoqueTamanhos.map((et) => (
                      <div key={et.tamanho} className="border rounded p-2">
                        <Label htmlFor={`tamanho-${et.tamanho}`} className="text-sm font-medium block mb-1">
                          Tamanho {et.tamanho}
                        </Label>
                        <Input
                          id={`tamanho-${et.tamanho}`}
                          type="number"
                          min="0"
                          value={et.quantidade.toString()}
                          onChange={(e) => handleTamanhoQuantidadeChange(et.tamanho, e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="list">
                  <div className="space-y-2">
                    {estoqueTamanhos.map((et) => (
                      <div key={et.tamanho} className="flex items-center space-x-2">
                        <Label htmlFor={`tamanho-list-${et.tamanho}`} className="w-24">
                          Tamanho {et.tamanho}:
                        </Label>
                        <Input
                          id={`tamanho-list-${et.tamanho}`}
                          type="number"
                          min="0"
                          value={et.quantidade.toString()}
                          onChange={(e) => handleTamanhoQuantidadeChange(et.tamanho, e.target.value)}
                          className="w-24"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estoque Total:</span>
                  <span className="font-bold text-lg">{calcularEstoqueTotal()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
