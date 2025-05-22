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
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  addProduto,
  updateProduto,
  getCategorias,
  getMarcas,
  getEstoqueTamanhos,
  type Produto,
  type Categoria,
  type Marca,
} from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ProdutoFormProps {
  produto: Produto | null
  onSave: (produto: Produto) => void
  onCancel: () => void
}

interface Unidade {
  id: number
  nome: string
  sigla: string
}

interface Tamanho {
  id: number
  nome: string
  ordem: number
  selecionado?: boolean
  quantidade?: number
}

export default function ProdutoForm({ produto, onSave, onCancel }: ProdutoFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    marca: "",
    preco: "",
    custo: "",
    estoque: "",
    tipo_estoque: "unidade" as "unidade" | "tamanho",
    unidade_id: "",
  })
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([])
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState<Tamanho[]>([])
  const [estoqueTamanhos, setEstoqueTamanhos] = useState<{ tamanho: number; quantidade: number; nome?: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTamanhosDialog, setShowTamanhosDialog] = useState(false)
  const [colunaUnidadeExiste, setColunaUnidadeExiste] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Verificar se a coluna unidade_id existe
  useEffect(() => {
    async function verificarColunaUnidade() {
      try {
        // Executar o script para adicionar a coluna se não existir
        await supabase.rpc("execute_sql", {
          sql_query: `
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'produtos' 
                    AND column_name = 'unidade_id'
                ) THEN
                    ALTER TABLE produtos ADD COLUMN unidade_id INTEGER;
                END IF;
            END $$;
          `,
        })

        // Verificar se a coluna existe agora
        const { data, error } = await supabase.rpc("execute_sql", {
          sql_query: `
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = 'produtos' 
                AND column_name = 'unidade_id'
            ) as coluna_existe;
          `,
        })

        if (!error && data && data[0] && data[0][0]) {
          const resultado = JSON.parse(data[0][0])
          if (resultado && resultado.length > 0) {
            setColunaUnidadeExiste(resultado[0].coluna_existe)
          }
        }
      } catch (error) {
        console.error("Erro ao verificar coluna unidade_id:", error)
        // Assumir que a coluna não existe em caso de erro
        setColunaUnidadeExiste(false)
      }
    }

    verificarColunaUnidade()
  }, [supabase])

  useEffect(() => {
    async function carregarDados() {
      try {
        const [categoriasData, marcasData, unidadesData, tamanhosData] = await Promise.all([
          getCategorias(),
          getMarcas(),
          carregarUnidades(),
          carregarTamanhos(),
        ])

        setCategorias(categoriasData)
        setMarcas(marcasData)
        setUnidades(unidadesData)
        setTamanhos(tamanhosData)

        if (produto?.id && produto.tipo_estoque === "tamanho") {
          const estoqueTamanhosData = await getEstoqueTamanhos(produto.id)

          // Mapear os tamanhos do banco com os nomes dos tamanhos
          const tamanhosComNomes = await Promise.all(
            estoqueTamanhosData.map(async (et) => {
              const { data } = await supabase.from("tamanhos").select("nome").eq("id", et.tamanho).single()

              return {
                tamanho: et.tamanho,
                quantidade: et.quantidade,
                nome: data?.nome || `Tamanho ${et.tamanho}`,
              }
            }),
          )

          setEstoqueTamanhos(tamanhosComNomes)

          // Marcar os tamanhos que já estão selecionados
          const tamanhoIds = estoqueTamanhosData.map((et) => et.tamanho)
          setTamanhosSelecionados(
            tamanhosData
              .filter((t) => tamanhoIds.includes(t.id))
              .map((t) => ({
                ...t,
                quantidade: estoqueTamanhosData.find((et) => et.tamanho === t.id)?.quantidade || 0,
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
  }, [produto, toast, supabase])

  async function carregarUnidades() {
    try {
      const { data, error } = await supabase.from("unidades").select("*").order("nome")
      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erro ao carregar unidades:", error)
      return []
    }
  }

  async function carregarTamanhos() {
    try {
      const { data, error } = await supabase.from("tamanhos").select("*").order("ordem")
      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erro ao carregar tamanhos:", error)
      return []
    }
  }

  useEffect(() => {
    if (produto) {
      // Buscar unidade_id diretamente do banco de dados apenas se a coluna existir
      async function buscarUnidadeId() {
        if (!colunaUnidadeExiste) return

        try {
          // Usar SQL bruto para buscar o unidade_id
          const { data, error } = await supabase.rpc("execute_sql", {
            sql_query: `SELECT unidade_id FROM produtos WHERE id = ${produto.id}`,
          })

          if (!error && data && data[0] && data[0][0]) {
            const resultado = JSON.parse(data[0][0])
            if (resultado && resultado.length > 0 && resultado[0].unidade_id) {
              setFormData((prev) => ({
                ...prev,
                unidade_id: resultado[0].unidade_id.toString(),
              }))
            }
          }
        } catch (error) {
          console.error("Erro ao buscar unidade_id:", error)
        }
      }

      setFormData({
        nome: produto.nome || "",
        categoria: produto.categoria || "",
        marca: produto.marca || "",
        preco: produto.preco ? produto.preco.toString() : "",
        custo: produto.custo ? produto.custo.toString() : "",
        estoque: produto.estoque ? produto.estoque.toString() : "",
        tipo_estoque: produto.tipo_estoque === "par" ? "tamanho" : produto.tipo_estoque || "unidade",
        unidade_id: produto.unidade_id ? produto.unidade_id.toString() : "",
      })

      // Buscar unidade_id se não estiver disponível e a coluna existir
      if (colunaUnidadeExiste && !produto.unidade_id) {
        buscarUnidadeId()
      }
    }
  }, [produto, supabase, colunaUnidadeExiste])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoriaChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoria: value }))
  }

  const handleMarcaChange = (value: string) => {
    setFormData((prev) => ({ ...prev, marca: value }))
  }

  const handleUnidadeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, unidade_id: value }))
  }

  const handleTipoEstoqueChange = (value: "unidade" | "tamanho") => {
    setFormData((prev) => ({ ...prev, tipo_estoque: value }))

    // Se mudar para tamanho e não tiver tamanhos selecionados, abrir o diálogo
    if (value === "tamanho" && tamanhosSelecionados.length === 0) {
      setShowTamanhosDialog(true)
    }
  }

  const handleTamanhoQuantidadeChange = (tamanhoId: number, quantidade: string) => {
    const quantidadeNum = Number.parseInt(quantidade) || 0

    setEstoqueTamanhos((prev) =>
      prev.map((et) => (et.tamanho === tamanhoId ? { ...et, quantidade: quantidadeNum } : et)),
    )
  }

  const handleTamanhoCheckboxChange = (tamanhoId: number, checked: boolean) => {
    setTamanhos((prev) => prev.map((t) => (t.id === tamanhoId ? { ...t, selecionado: checked } : t)))
  }

  const handleConfirmTamanhos = () => {
    const selecionados = tamanhos.filter((t) => t.selecionado)
    setTamanhosSelecionados(selecionados)

    // Atualizar o estoqueTamanhos com os tamanhos selecionados
    const novoEstoqueTamanhos = selecionados.map((t) => ({
      tamanho: t.id,
      quantidade: 0,
      nome: t.nome,
    }))

    setEstoqueTamanhos(novoEstoqueTamanhos)
    setShowTamanhosDialog(false)
  }

  const calcularEstoqueTotal = () => {
    return estoqueTamanhos.reduce((total, et) => total + et.quantidade, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome || !formData.categoria || !formData.marca) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, categoria e marca são obrigatórios!",
        variant: "destructive",
      })
      return
    }

    if (formData.tipo_estoque === "tamanho" && estoqueTamanhos.length === 0) {
      toast({
        title: "Tamanhos não selecionados",
        description: "Você precisa selecionar pelo menos um tamanho para este produto.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Criar o objeto produto sem o campo unidade_id se a coluna não existir
      const produtoFinal: any = {
        nome: formData.nome,
        categoria: formData.categoria,
        marca: formData.marca,
        preco: Number.parseFloat(formData.preco) || 0,
        custo: Number.parseFloat(formData.custo) || 0,
        estoque: formData.tipo_estoque === "unidade" ? Number.parseInt(formData.estoque) || 0 : calcularEstoqueTotal(),
        tipo_estoque: formData.tipo_estoque,
      }

      // Adicionar unidade_id apenas se a coluna existir
      if (colunaUnidadeExiste && formData.unidade_id) {
        produtoFinal.unidade_id = Number.parseInt(formData.unidade_id)
      }

      // Filtrar apenas os tamanhos com quantidade > 0 para produtos do tipo "tamanho"
      const tamanhosFiltrados =
        formData.tipo_estoque === "tamanho"
          ? estoqueTamanhos.map((et) => ({
              tamanho: et.tamanho,
              quantidade: et.quantidade,
            }))
          : []

      if (produto) {
        // Atualizar produto existente
        const produtoAtualizado = await updateProduto(produto.id, produtoFinal, tamanhosFiltrados)

        // Se a coluna unidade_id existe e temos um valor, atualizar diretamente via SQL
        if (colunaUnidadeExiste && formData.unidade_id) {
          try {
            await supabase.rpc("execute_sql", {
              sql_query: `UPDATE produtos SET unidade_id = ${Number.parseInt(formData.unidade_id)} WHERE id = ${produto.id}`,
            })
          } catch (error) {
            console.error("Erro ao atualizar unidade_id via SQL:", error)
            // Não interromper o fluxo se falhar
          }
        }

        onSave(produtoAtualizado)
      } else {
        // Adicionar novo produto
        const novoProduto = await addProduto(produtoFinal, tamanhosFiltrados)

        // Se a coluna unidade_id existe e temos um valor, atualizar diretamente via SQL
        if (colunaUnidadeExiste && formData.unidade_id && novoProduto.id) {
          try {
            await supabase.rpc("execute_sql", {
              sql_query: `UPDATE produtos SET unidade_id = ${Number.parseInt(formData.unidade_id)} WHERE id = ${novoProduto.id}`,
            })
          } catch (error) {
            console.error("Erro ao atualizar unidade_id via SQL:", error)
            // Não interromper o fluxo se falhar
          }
        }

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
          <Label htmlFor="marca">Marca</Label>
          <Select value={formData.marca} onValueChange={handleMarcaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma marca" />
            </SelectTrigger>
            <SelectContent>
              {marcas.map((marca) => (
                <SelectItem key={marca.id} value={marca.nome}>
                  {marca.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custo">Custo (R$)</Label>
          <Input
            id="custo"
            name="custo"
            type="number"
            step="0.01"
            min="0"
            value={formData.custo}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preco">Preço de Venda (R$)</Label>
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
            onValueChange={(value) => handleTipoEstoqueChange(value as "unidade" | "tamanho")}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unidade" id="unidade" />
              <Label htmlFor="unidade" className="cursor-pointer">
                Unidade
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tamanho" id="tamanho" />
              <Label htmlFor="tamanho" className="cursor-pointer">
                Tamanho
              </Label>
            </div>
          </RadioGroup>
        </div>

        {colunaUnidadeExiste && (
          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade de Medida</Label>
            <Select value={formData.unidade_id} onValueChange={handleUnidadeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent>
                {unidades.map((unidade) => (
                  <SelectItem key={unidade.id} value={unidade.id.toString()}>
                    {unidade.nome} ({unidade.sigla})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
          <div className="flex justify-between items-center mb-2">
            <Label>Estoque por Tamanho</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowTamanhosDialog(true)}>
              Selecionar Tamanhos
            </Button>
          </div>

          {estoqueTamanhos.length > 0 ? (
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
                            {et.nome || `Tamanho ${et.tamanho}`}
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
                            {et.nome || `Tamanho ${et.tamanho}`}:
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
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
              <p className="text-gray-500">
                Nenhum tamanho selecionado. Clique em "Selecionar Tamanhos" para adicionar.
              </p>
            </div>
          )}
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

      {/* Diálogo para seleção de tamanhos */}
      <Dialog open={showTamanhosDialog} onOpenChange={setShowTamanhosDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Tamanhos</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="max-h-[60vh] overflow-y-auto pr-6">
              {tamanhos.map((tamanho) => (
                <div key={tamanho.id} className="flex items-center space-x-2 py-2 border-b">
                  <Checkbox
                    id={`tamanho-${tamanho.id}`}
                    checked={tamanho.selecionado || tamanhosSelecionados.some((t) => t.id === tamanho.id)}
                    onCheckedChange={(checked) => handleTamanhoCheckboxChange(tamanho.id, checked as boolean)}
                  />
                  <Label htmlFor={`tamanho-${tamanho.id}`} className="flex-1 cursor-pointer">
                    {tamanho.nome}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowTamanhosDialog(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirmTamanhos}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
