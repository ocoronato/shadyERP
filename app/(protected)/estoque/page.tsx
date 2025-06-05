"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  LucidePlus,
  LucideSearch,
  LucideEdit,
  LucideTrash,
  LucideRefreshCw,
  LucideDatabase,
  LucidePackage,
  LucideRuler,
  LucidePrinter,
} from "lucide-react"
import ProdutoForm from "./produto-form"
import { getProdutos, deleteProduto, type Produto, checkTablesExist, getEstoqueTamanhos } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import InitializeDatabase from "@/components/initialize-database"
// Adicionar importação do componente de carregamento
import { LoadingSpinner } from "@/components/loading-spinner"
import { ImprimirEtiquetaButton } from "@/components/produto-etiqueta"
import { ProdutoEtiquetaTamanhos } from "@/components/produto-etiqueta-tamanhos"

export default function Estoque() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [busca, setBusca] = useState("")
  const [mostrarForm, setMostrarForm] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsInitialization, setNeedsInitialization] = useState(false)
  const [showInitialize, setShowInitialize] = useState(false)
  const { toast } = useToast()

  // Adicionar estado para controlar a ordenação
  const [ordenacao, setOrdenacao] = useState<{ campo: string; direcao: "asc" | "desc" }>({
    campo: "id",
    direcao: "asc",
  })

  // Adicionar estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(10)

  const [estoqueTamanhosPorProduto, setEstoqueTamanhosPorProduto] = useState<Record<number, any[]>>({})

  // Adicionar função para calcular a margem de lucro
  const calcularMargem = (preco: number, custo: number) => {
    if (custo === 0) return 0
    const margem = ((preco - custo) / preco) * 100
    return Math.round(margem * 100) / 100 // Arredondar para 2 casas decimais
  }

  const verificarTabelas = async () => {
    const tablesStatus = await checkTablesExist()
    if (!tablesStatus.allExist) {
      setNeedsInitialization(true)
      setError("O banco de dados precisa ser inicializado. Clique no botão abaixo para criar as tabelas necessárias.")
      return false
    }
    return true
  }

  const carregarProdutos = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Verificar se as tabelas existem
      const tabelasOk = await verificarTabelas()
      if (!tabelasOk) {
        setIsLoading(false)
        return
      }

      const data = await getProdutos()
      setProdutos(data)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      setError("Não foi possível carregar a lista de produtos. Tente novamente.")
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarProdutos()
  }, [])

  // Função para ordenar produtos
  const ordenarProdutos = (produtos: Produto[]) => {
    return [...produtos].sort((a, b) => {
      if (ordenacao.campo === "margem") {
        const margemA = calcularMargem(a.preco, a.custo || 0)
        const margemB = calcularMargem(b.preco, b.custo || 0)
        return ordenacao.direcao === "asc" ? margemA - margemB : margemB - margemA
      } else if (ordenacao.campo === "preco") {
        return ordenacao.direcao === "asc" ? a.preco - b.preco : b.preco - a.preco
      } else if (ordenacao.campo === "estoque") {
        return ordenacao.direcao === "asc" ? a.estoque - b.estoque : b.estoque - a.estoque
      } else if (ordenacao.campo === "nome") {
        return ordenacao.direcao === "asc" ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)
      } else if (ordenacao.campo === "marca") {
        // Adicionar ordenação por marca
        const marcaA = a.marca || "Sem marca"
        const marcaB = b.marca || "Sem marca"
        return ordenacao.direcao === "asc" ? marcaA.localeCompare(marcaB) : marcaB.localeCompare(marcaA)
      } else {
        // Ordenação padrão por ID
        return ordenacao.direcao === "asc" ? a.id - b.id : b.id - a.id
      }
    })
  }

  const carregarEstoqueTamanhos = async (produtoId: number) => {
    try {
      const tamanhos = await getEstoqueTamanhos(produtoId)
      setEstoqueTamanhosPorProduto((prev) => ({
        ...prev,
        [produtoId]: tamanhos,
      }))
      return tamanhos
    } catch (error) {
      console.error("Erro ao carregar tamanhos:", error)
      return []
    }
  }

  // Modificar a função produtosFiltrados para incluir a ordenação
  const produtosFiltrados = ordenarProdutos(
    produtos.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (produto.marca && produto.marca.toLowerCase().includes(busca.toLowerCase())) ||
        produto.categoria.toLowerCase().includes(busca.toLowerCase()) ||
        produto.id.toString().includes(busca),
    ),
  )

  // Calcular o total de páginas
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina)

  // Obter apenas os produtos da página atual
  const produtosPaginados = produtosFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina)

  // Adicionar função para alternar ordenação
  const alternarOrdenacao = (campo: string) => {
    if (ordenacao.campo === campo) {
      setOrdenacao({
        campo,
        direcao: ordenacao.direcao === "asc" ? "desc" : "asc",
      })
    } else {
      setOrdenacao({
        campo,
        direcao: "asc",
      })
    }
  }

  const adicionarProduto = (novoProduto: Produto) => {
    setProdutos([...produtos, novoProduto])
    setMostrarForm(false)
    toast({
      title: "Produto adicionado",
      description: "O produto foi adicionado com sucesso.",
    })
  }

  const atualizarProduto = (produtoAtualizado: Produto) => {
    setProdutos(produtos.map((p) => (p.id === produtoAtualizado.id ? produtoAtualizado : p)))
    setProdutoEditando(null)
    setMostrarForm(false)
    toast({
      title: "Produto atualizado",
      description: "Os dados do produto foram atualizados com sucesso.",
    })
  }

  const excluirProduto = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteProduto(id)
        setProdutos(produtos.filter((p) => p.id !== id))
        toast({
          title: "Produto excluído",
          description: "O produto foi excluído com sucesso.",
        })
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o produto.",
          variant: "destructive",
        })
      }
    }
  }

  const editarProduto = (produto: Produto) => {
    setProdutoEditando(produto)
    setMostrarForm(true)
  }

  const formatarPreco = (preco: number) => {
    return `R$ ${preco.toFixed(2).replace(".", ",")}`
  }

  const handleInitializeSuccess = () => {
    setNeedsInitialization(false)
    setError(null)
    carregarProdutos()
    toast({
      title: "Banco de dados inicializado",
      description: "O banco de dados foi inicializado com sucesso.",
    })
  }

  // Substituir o componente de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen py-8 text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Estoque</h1>
          </div>
          <Card className="p-6 bg-neutral-800">
            <LoadingSpinner size="lg" text="Carregando produtos..." />
          </Card>
        </div>
      </div>
    )
  }

  if (needsInitialization || showInitialize) {
    return (
      <div className="min-h-screen py-8 text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Estoque</h1>
          </div>
          <Card className="p-6 bg-neutral-800">
            <div className="flex flex-col justify-center items-center gap-4">
              <LucideDatabase className="h-12 w-12 text-indigo-500 mb-2" />
              <h2 className="text-xl font-medium text-gray-100">Inicialização do Banco de Dados</h2>
              {error && <p className="text-red-400 text-center">{error}</p>}
              <p className="text-gray-400 text-center mb-4">
                É necessário criar as tabelas no banco de dados antes de usar o sistema.
              </p>
              <InitializeDatabase onSuccess={handleInitializeSuccess} />
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Estoque</h1>
            <Button
              variant="outline"
              className="border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white"
              onClick={() => setShowInitialize(true)}
            >
              <LucideDatabase className="h-4 w-4 mr-2" /> Inicializar Banco de Dados
            </Button>
          </div>
          <Card className="p-6 bg-neutral-800">
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-400">{error}</p>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={carregarProdutos}>
                <LucideRefreshCw className="h-4 w-4 mr-2" /> Tentar novamente
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Estoque</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white"
              onClick={() => setShowInitialize(true)}
            >
              <LucideDatabase className="h-4 w-4 mr-2" /> Inicializar BD
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {
                setProdutoEditando(null)
                setMostrarForm(true)
              }}
            >
              <LucidePlus className="h-4 w-4 mr-2" /> Novo Produto
            </Button>
          </div>
        </div>

        {mostrarForm ? (
          <Card className="p-6 mb-6 bg-neutral-800 shadow-lg">
            <ProdutoForm
              produto={produtoEditando}
              onSave={produtoEditando ? atualizarProduto : adicionarProduto}
              onCancel={() => {
                setMostrarForm(false)
                setProdutoEditando(null)
              }}
            />
          </Card>
        ) : (
          <Card className="p-6 mb-6 bg-neutral-800 shadow-lg">
            <div className="flex items-center">
              <div className="relative flex-grow">
                <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 bg-neutral-700 border-neutral-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-neutral-800 shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-neutral-700">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => alternarOrdenacao("id")}
                  >
                    ID {ordenacao.campo === "id" && (ordenacao.direcao === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => alternarOrdenacao("nome")}
                  >
                    Nome {ordenacao.campo === "nome" && (ordenacao.direcao === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => alternarOrdenacao("marca")}
                  >
                    Marca {ordenacao.campo === "marca" && (ordenacao.direcao === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Custo
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => alternarOrdenacao("preco")}
                  >
                    Preço Venda {ordenacao.campo === "preco" && (ordenacao.direcao === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => alternarOrdenacao("margem")}
                  >
                    Margem {ordenacao.campo === "margem" && (ordenacao.direcao === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => alternarOrdenacao("estoque")}
                  >
                    Estoque {ordenacao.campo === "estoque" && (ordenacao.direcao === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                {produtosPaginados.map((produto) => (
                  <tr key={produto.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{produto.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{produto.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {produto.marca || "Sem marca"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{produto.categoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatarPreco(produto.custo || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatarPreco(produto.preco)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`
                          ${produto.custo && calcularMargem(produto.preco, produto.custo) > 40 ? "text-green-400 font-medium" : ""}
                          ${produto.custo && calcularMargem(produto.preco, produto.custo) < 20 ? "text-red-400 font-medium" : ""}
                          ${!produto.custo || (calcularMargem(produto.preco, produto.custo) >= 20 && calcularMargem(produto.preco, produto.custo) <= 40) ? "text-gray-300" : ""}
                        `}
                      >
                        {calcularMargem(produto.preco, produto.custo || 0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{produto.estoque}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <Badge
                        variant={produto.tipo_estoque === "unidade" ? "outline" : "secondary"}
                        className={`flex items-center gap-1 ${produto.tipo_estoque === "unidade" ? "border-neutral-600 text-gray-300 bg-neutral-700/50" : "bg-neutral-700 text-gray-300"}`}
                      >
                        {produto.tipo_estoque === "unidade" ? (
                          <LucidePackage className="h-3 w-3" />
                        ) : (
                          <LucideRuler className="h-3 w-3" />
                        )}
                        {produto.tipo_estoque === "unidade" ? "Unidade" : "Par"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        {produto.tipo_estoque === "unidade" ? (
                          <ImprimirEtiquetaButton produto={produto} />
                        ) : (
                          <>
                            {/* Carregar tamanhos e mostrar o componente ProdutoEtiquetaTamanhos */}
                            {estoqueTamanhosPorProduto[produto.id] ? (
                              <ProdutoEtiquetaTamanhos
                                produto={produto}
                                estoqueTamanhos={estoqueTamanhosPorProduto[produto.id]}
                              />
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white"
                                onClick={async () => {
                                  const tamanhos = await carregarEstoqueTamanhos(produto.id)
                                  if (tamanhos && tamanhos.length > 0) {
                                    setEstoqueTamanhosPorProduto((prev) => ({
                                      ...prev,
                                      [produto.id]: tamanhos,
                                    }))
                                  } else {
                                    toast({
                                      title: "Sem tamanhos",
                                      description: "Este produto não possui tamanhos cadastrados.",
                                      variant: "destructive",
                                    })
                                  }
                                }}
                              >
                                <LucidePrinter className="h-4 w-4" />
                                <span className="hidden sm:inline">Imprimir Etiqueta</span>
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-indigo-400"
                          onClick={() => editarProduto(produto)}
                        >
                          <LucideEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-400"
                          onClick={() => excluirProduto(produto.id)}
                        >
                          <LucideTrash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {produtosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-400">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        {/* Adicionar controles de paginação após a tabela */}
        <div className="flex items-center justify-between border-t border-neutral-700 bg-neutral-800 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              className="border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white disabled:text-gray-500 disabled:border-neutral-700"
              onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
              disabled={paginaAtual === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              className="border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white disabled:text-gray-500 disabled:border-neutral-700"
              onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
              disabled={paginaAtual === totalPaginas}
            >
              Próxima
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-300">
                Mostrando <span className="font-medium">{(paginaAtual - 1) * itensPorPagina + 1}</span> a{" "}
                <span className="font-medium">{Math.min(paginaAtual * itensPorPagina, produtosFiltrados.length)}</span>{" "}
                de <span className="font-medium">{produtosFiltrados.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  variant="outline"
                  className="rounded-l-md border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white disabled:text-gray-500 disabled:border-neutral-700"
                  onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                  disabled={paginaAtual === 1}
                >
                  Anterior
                </Button>
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  const pageNumber =
                    paginaAtual <= 3
                      ? i + 1
                      : paginaAtual >= totalPaginas - 2
                        ? totalPaginas - 4 + i
                        : paginaAtual - 2 + i

                  if (pageNumber <= 0 || pageNumber > totalPaginas) return null

                  return (
                    <Button
                      key={pageNumber}
                      variant={paginaAtual === pageNumber ? "default" : "outline"}
                      onClick={() => setPaginaAtual(pageNumber)}
                      className={`px-4 ${paginaAtual === pageNumber ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600" : "border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white disabled:text-gray-500 disabled:border-neutral-700"}`}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  className="rounded-r-md border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white disabled:text-gray-500 disabled:border-neutral-700"
                  onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                  disabled={paginaAtual === totalPaginas}
                >
                  Próxima
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
