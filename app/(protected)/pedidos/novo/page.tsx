"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LucideArrowLeft,
  LucidePlus,
  LucideTrash,
  LucidePackage,
  LucideCalendar,
  LucideSearch,
  LucideShoppingCart,
} from "lucide-react"
import {
  getFornecedores,
  getCategorias,
  getProdutos,
  addPedido,
  type Fornecedor,
  type Categoria,
  type Produto,
} from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function NovoPedidoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  // Estado do formulário
  const [fornecedorId, setFornecedorId] = useState<string>("")
  const [descricao, setDescricao] = useState("")
  const [dataPedido, setDataPedido] = useState(new Date().toISOString().split("T")[0])
  const [totalParcelas, setTotalParcelas] = useState<string>("1")

  // Estado dos itens
  const [itens, setItens] = useState<
    {
      nome: string
      tipo_estoque: "unidade" | "par"
      quantidade: number
      preco_unitario: number
      categoria: string
      tamanhos?: { tamanho: number; quantidade: number }[]
    }[]
  >([])

  // Estado do item atual sendo adicionado
  const [itemNome, setItemNome] = useState("")
  const [itemTipoEstoque, setItemTipoEstoque] = useState<"unidade" | "par">("unidade")
  const [itemQuantidade, setItemQuantidade] = useState<string>("1")
  const [itemPreco, setItemPreco] = useState<string>("")
  const [itemCategoria, setItemCategoria] = useState<string>("")
  const [itemTamanhos, setItemTamanhos] = useState<{ tamanho: number; quantidade: number; selecionado: boolean }[]>([])

  // Estado das parcelas
  const [parcelas, setParcelas] = useState<
    {
      numero_parcela: number
      data_vencimento: string
      valor: number
    }[]
  >([])

  // Inicializar os tamanhos (1 a 50)
  useEffect(() => {
    const tamanhos = Array.from({ length: 50 }, (_, i) => ({
      tamanho: i + 1,
      quantidade: 0,
      selecionado: false,
    }))
    setItemTamanhos(tamanhos)
  }, [])

  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true)
      try {
        const [fornecedoresData, categoriasData, produtosData] = await Promise.all([
          getFornecedores(),
          getCategorias(),
          getProdutos(),
        ])
        setFornecedores(fornecedoresData)
        setCategorias(categoriasData)
        setProdutos(produtosData)
        setProdutosFiltrados(produtosData)
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
  }, [toast])

  // Filtrar produtos com base no termo de busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setProdutosFiltrados(produtos)
    } else {
      const filtered = produtos.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setProdutosFiltrados(filtered)
    }
  }, [searchTerm, produtos])

  // Selecionar um produto existente
  const selecionarProduto = (produto: Produto) => {
    setItemNome(produto.nome)
    setItemTipoEstoque(produto.tipo_estoque as "unidade" | "par")
    setItemPreco(produto.preco.toString().replace(".", ","))

    // Encontrar o ID da categoria
    const categoria = categorias.find((c) => c.nome === produto.categoria)
    if (categoria) {
      setItemCategoria(categoria.id.toString())
    }

    setDialogOpen(false)
  }

  // Calcular o total do pedido
  const calcularTotal = () => {
    return itens.reduce((total, item) => {
      if (item.tipo_estoque === "unidade") {
        return total + item.quantidade * item.preco_unitario
      } else {
        // Para tipo "par", somar as quantidades de todos os tamanhos
        const quantidadeTotal = item.tamanhos
          ? item.tamanhos.reduce((sum, t) => sum + t.quantidade, 0)
          : item.quantidade
        return total + quantidadeTotal * item.preco_unitario
      }
    }, 0)
  }

  // Adicionar um item à lista
  const adicionarItem = () => {
    if (!itemNome.trim()) {
      toast({
        title: "Nome do produto obrigatório",
        description: "Informe o nome do produto.",
        variant: "destructive",
      })
      return
    }

    if (!itemCategoria) {
      toast({
        title: "Categoria obrigatória",
        description: "Selecione uma categoria para o produto.",
        variant: "destructive",
      })
      return
    }

    const preco = Number.parseFloat(itemPreco.replace(",", "."))
    if (isNaN(preco) || preco <= 0) {
      toast({
        title: "Preço inválido",
        description: "O preço deve ser um número maior que zero.",
        variant: "destructive",
      })
      return
    }

    if (itemTipoEstoque === "par") {
      // Verificar se pelo menos um tamanho foi selecionado
      const tamanhosSelecionados = itemTamanhos.filter((t) => t.selecionado && t.quantidade > 0)
      if (tamanhosSelecionados.length === 0) {
        toast({
          title: "Tamanhos obrigatórios",
          description: "Selecione pelo menos um tamanho e informe a quantidade.",
          variant: "destructive",
        })
        return
      }

      // Adicionar o item com os tamanhos selecionados
      setItens([
        ...itens,
        {
          nome: itemNome,
          tipo_estoque: "par",
          quantidade: tamanhosSelecionados.reduce((sum, t) => sum + t.quantidade, 0),
          preco_unitario: preco,
          categoria: itemCategoria,
          tamanhos: tamanhosSelecionados.map((t) => ({ tamanho: t.tamanho, quantidade: t.quantidade })),
        },
      ])
    } else {
      // Para tipo "unidade"
      const quantidade = Number.parseInt(itemQuantidade)
      if (isNaN(quantidade) || quantidade <= 0) {
        toast({
          title: "Quantidade inválida",
          description: "A quantidade deve ser um número maior que zero.",
          variant: "destructive",
        })
        return
      }

      // Adicionar o item sem tamanhos
      setItens([
        ...itens,
        {
          nome: itemNome,
          tipo_estoque: "unidade",
          quantidade,
          preco_unitario: preco,
          categoria: itemCategoria,
        },
      ])
    }

    // Limpar os campos
    setItemNome("")
    setItemTipoEstoque("unidade")
    setItemQuantidade("1")
    setItemPreco("")
    setItemCategoria("")
    // Resetar os tamanhos
    setItemTamanhos(
      itemTamanhos.map((t) => ({
        ...t,
        quantidade: 0,
        selecionado: false,
      })),
    )
  }

  // Remover um item da lista
  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  // Atualizar a seleção de tamanho
  const atualizarSelecaoTamanho = (tamanho: number, selecionado: boolean) => {
    setItemTamanhos(
      itemTamanhos.map((t) => {
        if (t.tamanho === tamanho) {
          return { ...t, selecionado, quantidade: selecionado ? t.quantidade || 1 : 0 }
        }
        return t
      }),
    )
  }

  // Atualizar a quantidade de um tamanho
  const atualizarQuantidadeTamanho = (tamanho: number, quantidade: number) => {
    setItemTamanhos(
      itemTamanhos.map((t) => {
        if (t.tamanho === tamanho) {
          return { ...t, quantidade }
        }
        return t
      }),
    )
  }

  // Calcular e gerar as parcelas
  const gerarParcelas = () => {
    const total = calcularTotal()
    const numParcelas = Number.parseInt(totalParcelas)

    if (isNaN(numParcelas) || numParcelas <= 0) {
      toast({
        title: "Número de parcelas inválido",
        description: "O número de parcelas deve ser maior que zero.",
        variant: "destructive",
      })
      return
    }

    const valorParcela = total / numParcelas
    const novasParcelas = []
    const dataBase = new Date(dataPedido)

    for (let i = 1; i <= numParcelas; i++) {
      const dataVencimento = new Date(dataBase)
      dataVencimento.setDate(dataVencimento.getDate() + 30 * i)

      novasParcelas.push({
        numero_parcela: i,
        data_vencimento: dataVencimento.toISOString().split("T")[0],
        valor: valorParcela,
      })
    }

    setParcelas(novasParcelas)
  }

  // Atualizar parcelas quando os itens ou o número de parcelas mudar
  useEffect(() => {
    if (itens.length > 0 && Number.parseInt(totalParcelas) > 0) {
      gerarParcelas()
    } else {
      setParcelas([])
    }
  }, [itens, totalParcelas, dataPedido])

  // Atualizar data de vencimento de uma parcela
  const atualizarDataVencimento = (index: number, novaData: string) => {
    setParcelas(
      parcelas.map((parcela, i) => {
        if (i === index) {
          return { ...parcela, data_vencimento: novaData }
        }
        return parcela
      }),
    )
  }

  // Atualizar valor de uma parcela
  const atualizarValorParcela = (index: number, novoValor: string) => {
    const valor = Number.parseFloat(novoValor.replace(",", "."))
    if (isNaN(valor)) return

    setParcelas(
      parcelas.map((parcela, i) => {
        if (i === index) {
          return { ...parcela, valor }
        }
        return parcela
      }),
    )
  }

  // Formatar preço para exibição
  const formatarPreco = (preco: number) => {
    return `R$ ${preco.toFixed(2).replace(".", ",")}`
  }

  // Enviar o formulário
  const enviarFormulario = async () => {
    // Validar campos obrigatórios
    if (!fornecedorId) {
      toast({
        title: "Fornecedor obrigatório",
        description: "Selecione um fornecedor para o pedido.",
        variant: "destructive",
      })
      return
    }

    if (itens.length === 0) {
      toast({
        title: "Itens obrigatórios",
        description: "Adicione pelo menos um item ao pedido.",
        variant: "destructive",
      })
      return
    }

    if (parcelas.length === 0) {
      toast({
        title: "Parcelas não geradas",
        description: "Gere as parcelas antes de salvar o pedido.",
        variant: "destructive",
      })
      return
    }

    // Verificar se o total das parcelas é igual ao total do pedido
    const totalParcelas = parcelas.reduce((sum, p) => sum + p.valor, 0)
    const totalPedido = calcularTotal()

    if (Math.abs(totalParcelas - totalPedido) > 0.01) {
      toast({
        title: "Valores inconsistentes",
        description: "O total das parcelas deve ser igual ao total do pedido.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar os itens para envio (converter formato de tamanhos)
      const itensParaEnviar = itens.map((item) => {
        if (item.tipo_estoque === "unidade" || !item.tamanhos) {
          return {
            nome: item.nome,
            tipo_estoque: item.tipo_estoque,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            categoria: item.categoria,
          }
        }

        // Para itens do tipo "par", calcular a quantidade total
        const quantidadeTotal = item.tamanhos.reduce((sum, t) => sum + t.quantidade, 0)

        return {
          nome: item.nome,
          tipo_estoque: item.tipo_estoque,
          quantidade: quantidadeTotal,
          preco_unitario: item.preco_unitario,
          categoria: item.categoria,
        }
      })

      const pedido = {
        fornecedor_id: Number.parseInt(fornecedorId),
        descricao,
        data_pedido: dataPedido,
        status: "Pendente",
        total: totalPedido,
        parcelas: parcelas.length,
      }

      const resultado = await addPedido(pedido, itensParaEnviar, parcelas)

      toast({
        title: "Pedido criado",
        description: `Pedido #${resultado.id} criado com sucesso.`,
      })

      // Redirecionar para a página de detalhes do pedido
      router.push(`/pedidos/${resultado.id}`)
    } catch (error) {
      console.error("Erro ao criar pedido:", error)
      toast({
        title: "Erro ao criar pedido",
        description: "Ocorreu um erro ao criar o pedido. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => router.push("/pedidos")} className="mr-4">
            <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Novo Pedido</h1>
        </div>

        {isLoading ? (
          <Card className="p-6">
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Carregando dados...</p>
            </div>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Informações do Pedido</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Select value={fornecedorId} onValueChange={setFornecedorId}>
                      <SelectTrigger id="fornecedor">
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {fornecedores.map((fornecedor) => (
                          <SelectItem key={fornecedor.id} value={fornecedor.id.toString()}>
                            {fornecedor.razao_social}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="data-pedido">Data do Pedido</Label>
                    <Input
                      id="data-pedido"
                      type="date"
                      value={dataPedido}
                      onChange={(e) => setDataPedido(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="descricao">Descrição (opcional)</Label>
                    <Textarea
                      id="descricao"
                      placeholder="Descreva o pedido..."
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Adicionar Produtos</h2>

                <Tabs defaultValue="novo" className="mb-6">
                  <TabsList className="mb-4">
                    <TabsTrigger value="novo">Novo Produto</TabsTrigger>
                    <TabsTrigger value="existente">Produto Existente</TabsTrigger>
                  </TabsList>

                  <TabsContent value="novo">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="item-nome">Nome do Produto</Label>
                        <Input
                          id="item-nome"
                          placeholder="Nome do produto"
                          value={itemNome}
                          onChange={(e) => setItemNome(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="item-categoria">Categoria</Label>
                        <Select value={itemCategoria} onValueChange={setItemCategoria}>
                          <SelectTrigger id="item-categoria">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.map((categoria) => (
                              <SelectItem key={categoria.id} value={categoria.id.toString()}>
                                {categoria.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Tipo de Estoque</Label>
                        <RadioGroup
                          value={itemTipoEstoque}
                          onValueChange={(value) => setItemTipoEstoque(value as "unidade" | "par")}
                          className="flex space-x-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="unidade" id="tipo-unidade" />
                            <Label htmlFor="tipo-unidade" className="flex items-center cursor-pointer">
                              <LucidePackage className="h-4 w-4 mr-1" /> Unidade
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="par" id="tipo-par" />
                            <Label htmlFor="tipo-par" className="flex items-center cursor-pointer">
                              <LucideCalendar className="h-4 w-4 mr-1" /> Par
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {itemTipoEstoque === "unidade" ? (
                        <div>
                          <Label htmlFor="item-quantidade">Quantidade</Label>
                          <Input
                            id="item-quantidade"
                            type="number"
                            min="1"
                            value={itemQuantidade}
                            onChange={(e) => setItemQuantidade(e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="md:col-span-2">
                          <Label>Tamanhos e Quantidades</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                            {itemTamanhos.map((tamanho) => (
                              <div key={tamanho.tamanho} className="border rounded-md p-2">
                                <div className="flex items-center mb-1">
                                  <Checkbox
                                    id={`tamanho-${tamanho.tamanho}`}
                                    checked={tamanho.selecionado}
                                    onCheckedChange={(checked) =>
                                      atualizarSelecaoTamanho(tamanho.tamanho, checked === true)
                                    }
                                  />
                                  <Label
                                    htmlFor={`tamanho-${tamanho.tamanho}`}
                                    className="ml-2 cursor-pointer text-sm font-medium"
                                  >
                                    Tamanho {tamanho.tamanho}
                                  </Label>
                                </div>
                                {tamanho.selecionado && (
                                  <Input
                                    type="number"
                                    min="1"
                                    value={tamanho.quantidade || ""}
                                    onChange={(e) =>
                                      atualizarQuantidadeTamanho(tamanho.tamanho, Number.parseInt(e.target.value) || 0)
                                    }
                                    className="mt-1 h-8 text-sm"
                                    placeholder="Qtd"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="item-preco">Preço Unitário (R$)</Label>
                        <Input
                          id="item-preco"
                          placeholder="0,00"
                          value={itemPreco}
                          onChange={(e) => setItemPreco(e.target.value)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="existente">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-grow">
                          <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Buscar produtos existentes..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-60 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Nome
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Categoria
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Preço
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ação
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {produtosFiltrados.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Nenhum produto encontrado
                                  </td>
                                </tr>
                              ) : (
                                produtosFiltrados.map((produto) => (
                                  <tr key={produto.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {produto.nome}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {produto.categoria}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <Badge variant="outline">
                                        {produto.tipo_estoque === "unidade" ? "Unidade" : "Par"}
                                      </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {formatarPreco(produto.preco)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => selecionarProduto(produto)}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        <LucideShoppingCart className="h-4 w-4 mr-1" /> Selecionar
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {itemNome && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800 font-medium">
                            Produto selecionado: <span className="font-bold">{itemNome}</span>
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Complete as informações de quantidade e adicione ao pedido.
                          </p>
                        </div>
                      )}

                      {itemTipoEstoque === "unidade" ? (
                        <div>
                          <Label htmlFor="item-quantidade-existente">Quantidade</Label>
                          <Input
                            id="item-quantidade-existente"
                            type="number"
                            min="1"
                            value={itemQuantidade}
                            onChange={(e) => setItemQuantidade(e.target.value)}
                          />
                        </div>
                      ) : (
                        <div>
                          <Label>Tamanhos e Quantidades</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                            {itemTamanhos.map((tamanho) => (
                              <div key={tamanho.tamanho} className="border rounded-md p-2">
                                <div className="flex items-center mb-1">
                                  <Checkbox
                                    id={`tamanho-existente-${tamanho.tamanho}`}
                                    checked={tamanho.selecionado}
                                    onCheckedChange={(checked) =>
                                      atualizarSelecaoTamanho(tamanho.tamanho, checked === true)
                                    }
                                  />
                                  <Label
                                    htmlFor={`tamanho-existente-${tamanho.tamanho}`}
                                    className="ml-2 cursor-pointer text-sm font-medium"
                                  >
                                    Tamanho {tamanho.tamanho}
                                  </Label>
                                </div>
                                {tamanho.selecionado && (
                                  <Input
                                    type="number"
                                    min="1"
                                    value={tamanho.quantidade || ""}
                                    onChange={(e) =>
                                      atualizarQuantidadeTamanho(tamanho.tamanho, Number.parseInt(e.target.value) || 0)
                                    }
                                    className="mt-1 h-8 text-sm"
                                    placeholder="Qtd"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end mt-4">
                  <Button onClick={adicionarItem} type="button" disabled={!itemNome || !itemCategoria}>
                    <LucidePlus className="h-4 w-4 mr-2" /> Adicionar Item
                  </Button>
                </div>

                {itens.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium mb-2">Itens do Pedido</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Produto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Categoria
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantidade
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Preço Unitário
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subtotal
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {itens.map((item, index) => {
                            const categoria = categorias.find((c) => c.id.toString() === item.categoria)
                            return (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.nome}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {categoria?.nome || "Categoria não encontrada"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    {item.tipo_estoque === "unidade" ? (
                                      <LucidePackage className="h-3 w-3" />
                                    ) : (
                                      <LucideCalendar className="h-3 w-3" />
                                    )}
                                    {item.tipo_estoque === "unidade" ? "Unidade" : "Par"}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.tipo_estoque === "par" && item.tamanhos ? (
                                    <div className="flex flex-col">
                                      <span>{item.quantidade} total</span>
                                      <span className="text-xs text-gray-400">{item.tamanhos.length} tamanhos</span>
                                    </div>
                                  ) : (
                                    item.quantidade
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatarPreco(item.preco_unitario)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatarPreco(item.quantidade * item.preco_unitario)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removerItem(index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <LucideTrash className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                              Total:
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              {formatarPreco(calcularTotal())}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Parcelas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <Label htmlFor="total-parcelas">Número de Parcelas</Label>
                    <Input
                      id="total-parcelas"
                      type="number"
                      min="1"
                      value={totalParcelas}
                      onChange={(e) => setTotalParcelas(e.target.value)}
                    />
                  </div>
                </div>

                {parcelas.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parcela
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data de Vencimento
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parcelas.map((parcela, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {parcela.numero_parcela}/{parcelas.length}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Input
                                type="date"
                                value={parcela.data_vencimento}
                                onChange={(e) => atualizarDataVencimento(index, e.target.value)}
                                className="w-40"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Input
                                type="text"
                                value={parcela.valor.toFixed(2).replace(".", ",")}
                                onChange={(e) => atualizarValorParcela(index, e.target.value)}
                                className="w-32"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={2} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                            Total das Parcelas:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {formatarPreco(parcelas.reduce((sum, p) => sum + p.valor, 0))}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                            Total do Pedido:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {formatarPreco(calcularTotal())}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => router.push("/pedidos")} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={enviarFormulario} disabled={isSubmitting || itens.length === 0 || parcelas.length === 0}>
                {isSubmitting ? "Salvando..." : "Salvar Pedido"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
