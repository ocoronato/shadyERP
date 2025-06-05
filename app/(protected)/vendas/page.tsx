"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LucidePlus, LucideSearch, LucideEye, LucideTrash, LucideRefreshCw, LucideDatabase } from "lucide-react"
import VendaForm from "./venda-form"
import VendaDetalhes from "./venda-detalhes"
import { getVendas, deleteVenda, type Venda, checkTablesExist } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import InitializeDatabase from "@/components/initialize-database"

export default function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [busca, setBusca] = useState("")
  const [mostrarForm, setMostrarForm] = useState(false)
  const [vendaDetalhes, setVendaDetalhes] = useState<Venda | null>(null)
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

  const carregarVendas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Verificar se as tabelas existem
      const tabelasOk = await verificarTabelas()
      if (!tabelasOk) {
        setIsLoading(false)
        return
      }

      const data = await getVendas()
      setVendas(data)
    } catch (error) {
      console.error("Erro ao carregar vendas:", error)
      setError("Não foi possível carregar a lista de vendas. Tente novamente.")
      toast({
        title: "Erro ao carregar vendas",
        description: "Não foi possível carregar a lista de vendas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarVendas()
  }, [])

  const vendasFiltradas = vendas.filter(
    (venda) =>
      venda.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      venda.status.toLowerCase().includes(busca.toLowerCase()),
  )

  const adicionarVenda = (novaVenda: Venda) => {
    setVendas([novaVenda, ...vendas])
    setMostrarForm(false)
    toast({
      title: "Venda registrada",
      description: "A venda foi registrada com sucesso.",
    })
  }

  const excluirVenda = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta venda?")) {
      try {
        await deleteVenda(id)
        setVendas(vendas.filter((v) => v.id !== id))
        toast({
          title: "Venda excluída",
          description: "A venda foi excluída com sucesso.",
        })
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a venda.",
          variant: "destructive",
        })
      }
    }
  }

  const verDetalhes = (venda: Venda) => {
    setVendaDetalhes(venda)
  }

  const atualizarStatusVenda = (vendaAtualizada: Venda) => {
    setVendas(vendas.map((v) => (v.id === vendaAtualizada.id ? vendaAtualizada : v)))
    setVendaDetalhes(vendaAtualizada)
  }

  const formatarPreco = (preco: number) => {
    return `R$ ${preco.toFixed(2).replace(".", ",")}`
  }

  const handleInitializeSuccess = () => {
    setNeedsInitialization(false)
    setError(null)
    carregarVendas()
    toast({
      title: "Banco de dados inicializado",
      description: "O banco de dados foi inicializado com sucesso.",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Vendas</h1>
          </div>
          <Card className="p-6">
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-400">Carregando vendas...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (needsInitialization || showInitialize) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Vendas</h1>
          </div>
          <Card className="p-6">
            <div className="flex flex-col justify-center items-center gap-4">
              <LucideDatabase className="h-12 w-12 text-blue-500 mb-2" />
              <h2 className="text-xl font-medium text-gray-100">Inicialização do Banco de Dados</h2>
              {error && <p className="text-red-500 text-center">{error}</p>}
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
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Vendas</h1>
            <Button onClick={() => setShowInitialize(true)}>
              <LucideDatabase className="h-4 w-4 mr-2" /> Inicializar Banco de Dados
            </Button>
          </div>
          <Card className="p-6">
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-500">{error}</p>
              <Button onClick={carregarVendas}>
                <LucideRefreshCw className="h-4 w-4 mr-2" /> Tentar novamente
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Vendas</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowInitialize(true)}>
              <LucideDatabase className="h-4 w-4 mr-2" /> Inicializar BD
            </Button>
            <Button
              onClick={() => {
                setMostrarForm(true)
                setVendaDetalhes(null)
              }}
            >
              <LucidePlus className="h-4 w-4 mr-2" /> Nova Venda
            </Button>
          </div>
        </div>

        {mostrarForm ? (
          <Card className="p-6 mb-6">
            <VendaForm onSave={adicionarVenda} onCancel={() => setMostrarForm(false)} />
          </Card>
        ) : vendaDetalhes ? (
          <Card className="p-6 mb-6">
            <VendaDetalhes
              venda={vendaDetalhes}
              onVoltar={() => setVendaDetalhes(null)}
              onStatusUpdate={atualizarStatusVenda}
            />
          </Card>
        ) : (
          <Card className="p-6 mb-6">
            <div className="flex items-center">
              <div className="relative flex-grow">
                <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Buscar vendas..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 bg-neutral-700 border-neutral-600 text-gray-100 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </Card>
        )}

        {!mostrarForm && !vendaDetalhes && (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-neutral-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                  {vendasFiltradas.map((venda) => (
                    <tr key={venda.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">#{venda.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{venda.cliente}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{venda.data}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatarPreco(venda.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            venda.status === "Concluída"
                              ? "bg-green-900/60 text-green-300"
                              : venda.status === "Cancelada"
                                ? "bg-red-900/60 text-red-300"
                                : "bg-yellow-900/60 text-yellow-300"
                          }`}
                        >
                          {venda.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => verDetalhes(venda)}>
                          <LucideEye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => excluirVenda(venda.id)}>
                          <LucideTrash className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {vendasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-400">
                        Nenhuma venda encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
