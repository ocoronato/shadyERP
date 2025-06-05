"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LucidePlus, LucideSearch, LucideEdit, LucideTrash, LucideRefreshCw } from "lucide-react"
import FornecedorForm from "./fornecedor-form"
import { getFornecedores, deleteFornecedor, type Fornecedor } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [busca, setBusca] = useState("")
  const [mostrarForm, setMostrarForm] = useState(false)
  const [fornecedorEditando, setFornecedorEditando] = useState<Fornecedor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const carregarFornecedores = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getFornecedores()
      setFornecedores(data)
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error)
      setError("Não foi possível carregar a lista de fornecedores. Tente novamente.")
      toast({
        title: "Erro ao carregar fornecedores",
        description: "Não foi possível carregar a lista de fornecedores.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarFornecedores()
  }, [])

  const fornecedoresFiltrados = fornecedores.filter(
    (fornecedor) =>
      fornecedor.razao_social.toLowerCase().includes(busca.toLowerCase()) ||
      (fornecedor.nome_fantasia && fornecedor.nome_fantasia.toLowerCase().includes(busca.toLowerCase())) ||
      fornecedor.cnpj.toLowerCase().includes(busca.toLowerCase()) ||
      fornecedor.id.toString().includes(busca),
  )

  const adicionarFornecedor = (novoFornecedor: Fornecedor) => {
    setFornecedores([...fornecedores, novoFornecedor])
    setMostrarForm(false)
    toast({
      title: "Fornecedor adicionado",
      description: "O fornecedor foi adicionado com sucesso.",
    })
  }

  const atualizarFornecedor = (fornecedorAtualizado: Fornecedor) => {
    setFornecedores(fornecedores.map((f) => (f.id === fornecedorAtualizado.id ? fornecedorAtualizado : f)))
    setFornecedorEditando(null)
    setMostrarForm(false)
    toast({
      title: "Fornecedor atualizado",
      description: "Os dados do fornecedor foram atualizados com sucesso.",
    })
  }

  const excluirFornecedor = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
      try {
        await deleteFornecedor(id)
        setFornecedores(fornecedores.filter((f) => f.id !== id))
        toast({
          title: "Fornecedor excluído",
          description: "O fornecedor foi excluído com sucesso.",
        })
      } catch (error) {
        let mensagem = "Não foi possível excluir o fornecedor."
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

  const editarFornecedor = (fornecedor: Fornecedor) => {
    setFornecedorEditando(fornecedor)
    setMostrarForm(true)
  }

  const formatarData = (dataString?: string) => {
    if (!dataString) return "-"
    try {
      return format(parseISO(dataString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dataString
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Fornecedores</h1>
          </div>
          <Card className="p-6 bg-neutral-800">
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-400">Carregando fornecedores...</p>
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
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Fornecedores</h1>
          </div>
          <Card className="p-6 bg-neutral-800">
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-400">{error}</p>
              <Button onClick={carregarFornecedores} className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
          <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Fornecedores</h1>
          <Button
            onClick={() => {
              setFornecedorEditando(null)
              setMostrarForm(true)
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <LucidePlus className="h-4 w-4 mr-2" /> Novo Fornecedor
          </Button>
        </div>

        {mostrarForm ? (
          <Card className="p-6 mb-6 bg-neutral-800 shadow-lg">
            <FornecedorForm
              fornecedor={fornecedorEditando}
              onSave={fornecedorEditando ? atualizarFornecedor : adicionarFornecedor}
              onCancel={() => {
                setMostrarForm(false)
                setFornecedorEditando(null)
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
                  placeholder="Buscar fornecedores..."
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
                    CNPJ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Razão Social
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nome Fantasia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Inscrição Estadual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Data de Nascimento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                {fornecedoresFiltrados.map((fornecedor) => (
                  <tr key={fornecedor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{fornecedor.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{fornecedor.cnpj}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {fornecedor.razao_social}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {fornecedor.nome_fantasia || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {fornecedor.inscricao_estadual_isento ? "ISENTO" : fornecedor.inscricao_estadual || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatarData(fornecedor.data_nascimento)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => editarFornecedor(fornecedor)}>
                        <LucideEdit className="h-4 w-4 text-gray-400 hover:text-indigo-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => excluirFornecedor(fornecedor.id)}>
                        <LucideTrash className="h-4 w-4 text-red-500 hover:text-red-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {fornecedoresFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-400">
                      Nenhum fornecedor encontrado
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
