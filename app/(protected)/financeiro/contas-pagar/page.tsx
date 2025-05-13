"use client"

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
  LucideFilter,
  LucideCheck,
} from "lucide-react"
import ContaPagarForm from "./conta-pagar-form"
import {
  getContasPagar,
  deleteContaPagar,
  updateContaPagar,
  getFornecedores,
  type ContaPagar,
  type Fornecedor,
} from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export default function ContasPagar() {
  const [contas, setContas] = useState<ContaPagar[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [busca, setBusca] = useState("")
  const [mostrarForm, setMostrarForm] = useState(false)
  const [contaEditando, setContaEditando] = useState<ContaPagar | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroDataInicio, setFiltroDataInicio] = useState("")
  const [filtroDataFim, setFiltroDataFim] = useState("")
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const { toast } = useToast()

  const carregarDados = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const filtro = {}
      if (filtroDataInicio) filtro["inicio"] = filtroDataInicio
      if (filtroDataFim) filtro["fim"] = filtroDataFim

      // Carregar contas e fornecedores em paralelo
      const [contasData, fornecedoresData] = await Promise.all([
        getContasPagar(Object.keys(filtro).length > 0 ? filtro : undefined),
        getFornecedores(),
      ])

      setContas(contasData)
      setFornecedores(fornecedoresData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      setError("Não foi possível carregar os dados. Tente novamente.")
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados necessários.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [filtroDataInicio, filtroDataFim])

  // Função para obter o nome do fornecedor
  const getNomeFornecedor = (fornecedor: string | null | undefined) => {
    if (!fornecedor) return "-"
    return fornecedor
  }

  const contasFiltradas = contas.filter((conta) => {
    const nomeFornecedor = getNomeFornecedor(conta.fornecedor_id).toLowerCase()
    return conta.descricao.toLowerCase().includes(busca.toLowerCase()) || nomeFornecedor.includes(busca.toLowerCase())
  })

  const adicionarConta = (novaConta: ContaPagar) => {
    setContas([...contas, novaConta])
    setMostrarForm(false)
    toast({
      title: "Conta adicionada",
      description: "A conta a pagar foi adicionada com sucesso.",
    })
  }

  const atualizarConta = (contaAtualizada: ContaPagar) => {
    setContas(contas.map((c) => (c.id === contaAtualizada.id ? contaAtualizada : c)))
    setContaEditando(null)
    setMostrarForm(false)
    toast({
      title: "Conta atualizada",
      description: "Os dados da conta foram atualizados com sucesso.",
    })
  }

  const excluirConta = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta conta?")) {
      try {
        await deleteContaPagar(id)
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

  const editarConta = (conta: ContaPagar) => {
    setContaEditando(conta)
    setMostrarForm(true)
  }

  const marcarComoPaga = async (conta: ContaPagar) => {
    try {
      const dataAtual = new Date().toISOString().split("T")[0]
      const contaAtualizada = await updateContaPagar(conta.id, {
        status: "Pago",
        data_pagamento: dataAtual,
      })

      setContas(contas.map((c) => (c.id === contaAtualizada.id ? contaAtualizada : c)))

      toast({
        title: "Conta marcada como paga",
        description: "A conta foi marcada como paga com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível marcar a conta como paga.",
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Contas a Pagar</h1>
          </div>
          <Card className="p-6">
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Carregando contas...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Contas a Pagar</h1>
          </div>
          <Card className="p-6">
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-500">{error}</p>
              <Button onClick={carregarDados}>
                <LucideRefreshCw className="h-4 w-4 mr-2" /> Tentar novamente
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Contas a Pagar</h1>
          <Button
            onClick={() => {
              setContaEditando(null)
              setMostrarForm(true)
            }}
          >
            <LucidePlus className="h-4 w-4 mr-2" /> Nova Conta
          </Button>
        </div>

        {mostrarForm ? (
          <Card className="p-6 mb-6">
            <ContaPagarForm
              conta={contaEditando}
              onSave={contaEditando ? atualizarConta : adicionarConta}
              onCancel={() => {
                setMostrarForm(false)
                setContaEditando(null)
              }}
            />
          </Card>
        ) : (
          <Card className="p-6 mb-6">
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
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="ml-2" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
                  <LucideFilter className="h-4 w-4 mr-2" /> Filtros
                </Button>
              </div>

              {mostrarFiltros && (
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento (Início)</label>
                    <Input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento (Fim)</label>
                    <Input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" onClick={limparFiltros}>
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contasFiltradas.map((conta) => (
                  <tr
                    key={conta.id}
                    className={
                      conta.status === "Pendente" && new Date(conta.data_vencimento) < new Date() ? "bg-red-50" : ""
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{conta.descricao}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getNomeFornecedor(conta.fornecedor_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarPreco(conta.valor)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(conta.data_vencimento)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge variant={conta.status === "Pago" ? "success" : "warning"}>{conta.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {conta.status === "Pendente" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => marcarComoPaga(conta)}
                          title="Marcar como paga"
                        >
                          <LucideCheck className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => editarConta(conta)}>
                        <LucideEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => excluirConta(conta.id)}>
                        <LucideTrash className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {contasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhuma conta encontrada
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
