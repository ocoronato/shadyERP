"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LucideSearch, LucideTrash, LucideRefreshCw, LucideFilter, LucideCheck, LucideEye } from "lucide-react"
import ContaReceberDetalhes from "./conta-receber-detalhes"
import { getContasReceber, deleteContaReceber, updateContaReceber, type ContaReceber } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export default function ContasReceber() {
  const [contas, setContas] = useState<ContaReceber[]>([])
  const [busca, setBusca] = useState("")
  const [contaDetalhes, setContaDetalhes] = useState<ContaReceber | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroDataInicio, setFiltroDataInicio] = useState("")
  const [filtroDataFim, setFiltroDataFim] = useState("")
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const { toast } = useToast()

  const carregarContas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const filtro = {}
      if (filtroDataInicio) filtro["inicio"] = filtroDataInicio
      if (filtroDataFim) filtro["fim"] = filtroDataFim

      const data = await getContasReceber(Object.keys(filtro).length > 0 ? filtro : undefined)
      setContas(data)
    } catch (error) {
      console.error("Erro ao carregar contas a receber:", error)
      setError("Não foi possível carregar a lista de contas a receber. Tente novamente.")
      toast({
        title: "Erro ao carregar contas",
        description: "Não foi possível carregar a lista de contas a receber.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarContas()
  }, [filtroDataInicio, filtroDataFim])

  const contasFiltradas = contas.filter(
    (conta) =>
      conta.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      (conta.observacao && conta.observacao.toLowerCase().includes(busca.toLowerCase())),
  )

  const atualizarConta = (contaAtualizada: ContaReceber) => {
    setContas(contas.map((c) => (c.id === contaAtualizada.id ? contaAtualizada : c)))
    setContaDetalhes(contaAtualizada)
    toast({
      title: "Conta atualizada",
      description: "Os dados da conta foram atualizados com sucesso.",
    })
  }

  const excluirConta = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta conta?")) {
      try {
        await deleteContaReceber(id)
        setContas(contas.filter((c) => c.id !== id))
        toast({
          title: "Conta excluída",
          description: "A conta foi excluída com sucesso.",
        })
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a conta.",
          variant: "destructive",
        })
      }
    }
  }

  const verDetalhes = (conta: ContaReceber) => {
    setContaDetalhes(conta)
  }

  const marcarComoRecebida = async (conta: ContaReceber) => {
    try {
      const dataAtual = new Date().toISOString().split("T")[0]
      const contaAtualizada = await updateContaReceber(conta.id, {
        status: "Recebido",
        data_recebimento: dataAtual,
      })

      setContas(contas.map((c) => (c.id === contaAtualizada.id ? contaAtualizada : c)))

      toast({
        title: "Conta marcada como recebida",
        description: "A conta foi marcada como recebida com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível marcar a conta como recebida.",
        variant: "destructive",
      })
    }
  }

  const formatarData = (dataString: string) => {
    try {
      return format(parseISO(dataString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dataString
    }
  }

  const formatarPreco = (preco: number) => {
    return `R$ ${preco.toFixed(2).replace(".", ",")}`
  }

  const limparFiltros = () => {
    setFiltroDataInicio("")
    setFiltroDataFim("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-100">Contas a Receber</h1>
          </div>
          <Card className="p-6 bg-neutral-800 shadow-lg">
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-400">Carregando contas...</p>
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
            <h1 className="text-2xl font-semibold text-gray-100">Contas a Receber</h1>
          </div>
          <Card className="p-6 bg-neutral-800 shadow-lg">
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-400">{error}</p>
              <Button onClick={carregarContas} className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
          <h1 className="text-2xl font-semibold text-gray-100">Contas a Receber</h1>
        </div>

        {contaDetalhes ? (
          <Card className="p-6 mb-6 bg-neutral-800 shadow-lg">
            <ContaReceberDetalhes
              conta={contaDetalhes}
              onVoltar={() => setContaDetalhes(null)}
              onStatusUpdate={atualizarConta}
            />
          </Card>
        ) : (
          <Card className="p-6 mb-6 bg-neutral-800 shadow-lg">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-grow">
                  <LucideSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    type="text"
                    placeholder="Buscar contas..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10 bg-neutral-700 border-neutral-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <Button
                  variant="outline"
                  className="ml-2 border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white"
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                >
                  <LucideFilter className="h-4 w-4 mr-2" /> Filtros
                </Button>
              </div>

              {mostrarFiltros && (
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-neutral-700/50 rounded-md">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento (Início)</label>
                    <Input
                      type="date"
                      value={filtroDataInicio}
                      onChange={(e) => setFiltroDataInicio(e.target.value)}
                      className="bg-neutral-700 border-neutral-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento (Fim)</label>
                    <Input
                      type="date"
                      value={filtroDataFim}
                      onChange={(e) => setFiltroDataFim(e.target.value)}
                      className="bg-neutral-700 border-neutral-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={limparFiltros}
                      className="border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {!contaDetalhes && (
          <Card className="bg-neutral-800 shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Parcela
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                  {contasFiltradas.map((conta) => (
                    <tr
                      key={conta.id}
                      className={
                        conta.status === "Pendente" && new Date(conta.data_vencimento) < new Date()
                          ? "bg-red-800/30 hover:bg-red-700/40"
                          : ""
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{conta.cliente}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatarPreco(conta.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatarData(conta.data_vencimento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {conta.parcela && conta.total_parcelas ? `${conta.parcela}/${conta.total_parcelas}` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <Badge
                          variant={conta.status === "Recebido" ? "success" : "warning"}
                          className={
                            conta.status === "Recebido"
                              ? "bg-green-600/20 text-green-400 border border-green-600/30"
                              : "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                          }
                        >
                          {conta.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {conta.status === "Pendente" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => marcarComoRecebida(conta)}
                            title="Marcar como recebida"
                          >
                            <LucideCheck className="h-4 w-4 text-green-500 hover:text-green-400" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => verDetalhes(conta)}>
                          <LucideEye className="h-4 w-4 text-gray-400 hover:text-indigo-400" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => excluirConta(conta.id)}>
                          <LucideTrash className="h-4 w-4 text-red-500 hover:text-red-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {contasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-400">
                        Nenhuma conta encontrada
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
