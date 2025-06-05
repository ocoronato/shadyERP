"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  LucidePlus,
  LucideSearch,
  LucideEdit,
  LucideTrash,
  LucideRefreshCw,
  LucideDatabase,
  LucideChevronRight,
} from "lucide-react"
import CategoriaForm from "./categoria-form"
import { getCategorias, deleteCategoria, type Categoria, checkTablesExist } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import InitializeDatabase from "@/components/initialize-database"
import { Badge } from "@/components/ui/badge"

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [busca, setBusca] = useState("")
  const [mostrarForm, setMostrarForm] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsInitialization, setNeedsInitialization] = useState(false)
  const [showInitialize, setShowInitialize] = useState(false)
  const { toast } = useToast()

  const verificarTabelas = async () => {
    const tablesStatus = await checkTablesExist()
    if (!tablesStatus.allExist) {
      setNeedsInitialization(true)
      setError("O banco de dados precisa ser inicializado. Clique no botão abaixo para criar as tabelas necessárias.")
      return false
    }
    return true
  }

  const carregarCategorias = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Verificar se as tabelas existem
      const tabelasOk = await verificarTabelas()
      if (!tabelasOk) {
        setIsLoading(false)
        return
      }

      const data = await getCategorias()
      setCategorias(data)
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
      setError("Não foi possível carregar a lista de categorias. Tente novamente.")
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar a lista de categorias.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarCategorias()
  }, [])

  // Organizar categorias em hierarquia
  const categoriasHierarquicas = categorias.filter((cat) => !cat.categoria_pai_id)

  // Função para encontrar subcategorias
  const encontrarSubcategorias = (categoriaId: number) => {
    return categorias.filter((cat) => cat.categoria_pai_id === categoriaId)
  }

  // Função para renderizar uma categoria com suas subcategorias
  const renderizarCategoria = (categoria: Categoria, nivel = 0) => {
    const subcategorias = encontrarSubcategorias(categoria.id)
    const matchBusca =
      categoria.nome.toLowerCase().includes(busca.toLowerCase()) || categoria.id.toString().includes(busca)

    if (busca && !matchBusca && subcategorias.length === 0) {
      return null
    }

    return (
      <React.Fragment key={categoria.id}>
        <tr className={nivel > 0 ? "bg-neutral-700/50" : ""}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{categoria.id}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
            <div className="flex items-center">
              {nivel > 0 && (
                <div className="ml-4 mr-2">
                  <LucideChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              )}
              {categoria.nome}
              {nivel === 0 && subcategorias.length > 0 && (
                <Badge variant="outline" className="ml-2 border-neutral-600 text-gray-300 bg-neutral-700">
                  {subcategorias.length} subcategoria{subcategorias.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-gray-300">{categoria.descricao}</td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <Button variant="ghost" size="sm" onClick={() => editarCategoria(categoria)}>
              <LucideEdit className="h-4 w-4 text-gray-400 hover:text-indigo-400" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => excluirCategoria(categoria.id)}>
              <LucideTrash className="h-4 w-4 text-red-500 hover:text-red-400" />
            </Button>
          </td>
        </tr>
        {subcategorias.map((subcat) => renderizarCategoria(subcat, nivel + 1))}
      </React.Fragment>
    )
  }

  const categoriasFiltradas = busca
    ? categorias.filter(
        (categoria) =>
          categoria.nome.toLowerCase().includes(busca.toLowerCase()) || categoria.id.toString().includes(busca),
      )
    : categoriasHierarquicas

  const adicionarCategoria = (novaCategoria: Categoria) => {
    setCategorias([...categorias, novaCategoria])
    setMostrarForm(false)
    toast({
      title: "Categoria adicionada",
      description: "A categoria foi adicionada com sucesso.",
    })
  }

  const atualizarCategoria = (categoriaAtualizada: Categoria) => {
    setCategorias(categorias.map((c) => (c.id === categoriaAtualizada.id ? categoriaAtualizada : c)))
    setCategoriaEditando(null)
    setMostrarForm(false)
    toast({
      title: "Categoria atualizada",
      description: "Os dados da categoria foram atualizados com sucesso.",
    })
  }

  const excluirCategoria = async (id: number) => {
    // Verificar se existem subcategorias
    const temSubcategorias = categorias.some((cat) => cat.categoria_pai_id === id)

    if (temSubcategorias) {
      toast({
        title: "Não é possível excluir",
        description: "Esta categoria possui subcategorias. Remova ou reclassifique as subcategorias primeiro.",
        variant: "destructive",
      })
      return
    }

    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      try {
        await deleteCategoria(id)
        setCategorias(categorias.filter((c) => c.id !== id))
        toast({
          title: "Categoria excluída",
          description: "A categoria foi excluída com sucesso.",
        })
      } catch (error) {
        let mensagem = "Não foi possível excluir a categoria."
        if (error instanceof Error) {
          mensagem = error.message
        }
        toast({
          title: "Erro ao excluir",
          description: mensagem,
          variant: "destructive",
        })
      }
    }
  }

  const editarCategoria = (categoria: Categoria) => {
    setCategoriaEditando(categoria)
    setMostrarForm(true)
  }

  const handleInitializeSuccess = () => {
    setNeedsInitialization(false)
    setError(null)
    carregarCategorias()
    toast({
      title: "Banco de dados inicializado",
      description: "O banco de dados foi inicializado com sucesso.",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Categorias</h1>
          </div>
          <Card className="p-6 bg-neutral-800 shadow-lg">
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-400">Carregando categorias...</p>
            </div>
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
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Categorias</h1>
          </div>
          <Card className="p-6 bg-neutral-800 shadow-lg">
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
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Categorias</h1>
            <Button
              onClick={() => setShowInitialize(true)}
              className="border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white"
              variant="outline"
            >
              <LucideDatabase className="h-4 w-4 mr-2" /> Inicializar Banco de Dados
            </Button>
          </div>
          <Card className="p-6 bg-neutral-800 shadow-lg">
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-400">{error}</p>
              <Button onClick={carregarCategorias} className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
          <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Categorias</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white"
              onClick={() => setShowInitialize(true)}
            >
              <LucideDatabase className="h-4 w-4 mr-2" /> Inicializar BD
            </Button>
            <Button
              onClick={() => {
                setCategoriaEditando(null)
                setMostrarForm(true)
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <LucidePlus className="h-4 w-4 mr-2" /> Nova Categoria
            </Button>
          </div>
        </div>

        {mostrarForm ? (
          <Card className="p-6 mb-6 bg-neutral-800 shadow-lg">
            <CategoriaForm
              categoria={categoriaEditando}
              onSave={categoriaEditando ? atualizarCategoria : adicionarCategoria}
              onCancel={() => {
                setMostrarForm(false)
                setCategoriaEditando(null)
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
                  placeholder="Buscar categorias..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                {busca
                  ? categoriasFiltradas.map((categoria) => renderizarCategoria(categoria))
                  : categoriasHierarquicas.map((categoria) => renderizarCategoria(categoria))}
                {(busca ? categoriasFiltradas.length === 0 : categoriasHierarquicas.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-400">
                      Nenhuma categoria encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
