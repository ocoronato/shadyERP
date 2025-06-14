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
  LucideDatabase,
  AlertCircle,
} from "lucide-react"
import ClienteForm from "./cliente-form"
import { getClientes, deleteCliente, type Cliente, checkTablesExist } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import InitializeDatabase from "@/components/initialize-database"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState("")
  const [mostrarForm, setMostrarForm] = useState(false)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsInitialization, setNeedsInitialization] = useState(false)
  const [showInitialize, setShowInitialize] = useState(false)
  const [cpfSupported, setCpfSupported] = useState(false) // Estado para controlar se o campo CPF é suportado
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

  const carregarClientes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Verificar se as tabelas existem
      const tabelasOk = await verificarTabelas()
      if (!tabelasOk) {
        setIsLoading(false)
        return
      }

      const data = await getClientes()
      setClientes(data)

      // Verificar se o primeiro cliente tem o campo CPF
      if (data.length > 0) {
        setCpfSupported("cpf" in data[0] && data[0].cpf !== undefined)
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
      setError("Não foi possível carregar a lista de clientes. Tente novamente.")
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  // Atualizar a função de filtro para incluir o CPF
  const clientesFiltrados = clientes.filter((cliente) => {
    const termoBusca = busca.toLowerCase()
    const matchNome = cliente.nome.toLowerCase().includes(termoBusca)
    const matchEmail = cliente.email.toLowerCase().includes(termoBusca)
    const matchCpf = cliente.cpf ? cliente.cpf.toLowerCase().includes(termoBusca) : false
    const matchId = cliente.id.toString().includes(termoBusca)

    return matchNome || matchEmail || matchCpf || matchId
  })

  const adicionarCliente = (novoCliente: Cliente) => {
    setClientes([...clientes, novoCliente])
    setMostrarForm(false)
    toast({
      title: "Cliente adicionado",
      description: "O cliente foi adicionado com sucesso.",
    })
  }

  const atualizarCliente = (clienteAtualizado: Cliente) => {
    setClientes(clientes.map((c) => (c.id === clienteAtualizado.id ? clienteAtualizado : c)))
    setClienteEditando(null)
    setMostrarForm(false)
    toast({
      title: "Cliente atualizado",
      description: "Os dados do cliente foram atualizados com sucesso.",
    })
  }

  const excluirCliente = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await deleteCliente(id)
        setClientes(clientes.filter((c) => c.id !== id))
        toast({
          title: "Cliente excluído",
          description: "O cliente foi excluído com sucesso.",
        })
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o cliente.",
          variant: "destructive",
        })
      }
    }
  }

  const editarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente)
    setMostrarForm(true)
  }

  const handleInitializeSuccess = () => {
    setNeedsInitialization(false)
    setError(null)
    carregarClientes()
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
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Clientes</h1>
          </div>
          <Card className="p-6 bg-neutral-800">
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-400">Carregando clientes...</p>
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
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Clientes</h1>
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
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Clientes</h1>
            <Button
              onClick={() => setShowInitialize(true)}
              className="border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white"
              variant="outline"
            >
              <LucideDatabase className="h-4 w-4 mr-2" /> Inicializar Banco de Dados
            </Button>
          </div>
          <Card className="p-6 bg-neutral-800">
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-400">{error}</p>
              <Button onClick={carregarClientes} className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
          <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Clientes</h1>
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
                setClienteEditando(null)
                setMostrarForm(true)
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <LucidePlus className="h-4 w-4 mr-2" /> Novo Cliente
            </Button>
          </div>
        </div>

        {!cpfSupported && (
          <Alert variant="warning" className="mb-4 bg-yellow-700/20 border-yellow-600/30 text-yellow-300">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertTitle className="text-yellow-200">Atenção</AlertTitle>
            <AlertDescription className="text-yellow-300">
              O campo CPF não está disponível no banco de dados. Execute o SQL para adicionar a coluna.
            </AlertDescription>
          </Alert>
        )}

        {mostrarForm ? (
          <Card className="p-6 mb-6 bg-neutral-800 shadow-lg">
            <ClienteForm
              cliente={clienteEditando}
              onSave={clienteEditando ? atualizarCliente : adicionarCliente}
              onCancel={() => {
                setMostrarForm(false)
                setClienteEditando(null)
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
                  placeholder="Buscar clientes..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 bg-neutral-700 border-neutral-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-neutral-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Endereço
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{cliente.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{cliente.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{cliente.cpf}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{cliente.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{cliente.telefone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{cliente.endereco}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => editarCliente(cliente)}>
                        <LucideEdit className="h-4 w-4 text-gray-400 hover:text-indigo-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => excluirCliente(cliente.id)}>
                        <LucideTrash className="h-4 w-4 text-red-500 hover:text-red-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {clientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-400">
                      Nenhum cliente encontrado
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
