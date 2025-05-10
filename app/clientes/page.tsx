"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LucidePlus, LucideSearch, LucideEdit, LucideTrash, LucideRefreshCw, LucideDatabase } from "lucide-react"
import ClienteForm from "./cliente-form"
import { getClientes, deleteCliente, type Cliente, checkTablesExist } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import InitializeDatabase from "@/components/initialize-database"

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
        setCpfSupported("cpf" in data[0])
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

  // Atualizar a função de filtro para incluir o CPF apenas se for suportado
  const clientesFiltrados = clientes.filter((cliente) => {
    const termoBusca = busca.toLowerCase()
    const matchNome = cliente.nome.toLowerCase().includes(termoBusca)
    const matchEmail = cliente.email.toLowerCase().includes(termoBusca)
    const matchCpf = cpfSupported && cliente.cpf ? cliente.cpf.toLowerCase().includes(termoBusca) : false

    return matchNome || matchEmail || matchCpf
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Gerenciamento de Clientes</h1>
          </div>
          <Card className="p-6">
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Carregando clientes...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (needsInitialization || showInitialize) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Gerenciamento de Clientes</h1>
          </div>
          <Card className="p-6">
            <div className="flex flex-col justify-center items-center gap-4">
              <LucideDatabase className="h-12 w-12 text-blue-500 mb-2" />
              <h2 className="text-xl font-medium">Inicialização do Banco de Dados</h2>
              {error && <p className="text-red-500 text-center">{error}</p>}
              <p className="text-gray-500 text-center mb-4">
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Gerenciamento de Clientes</h1>
            <Button onClick={() => setShowInitialize(true)}>
              <LucideDatabase className="h-4 w-4 mr-2" /> Inicializar Banco de Dados
            </Button>
          </div>
          <Card className="p-6">
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-500">{error}</p>
              <Button onClick={carregarClientes}>
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
          <h1 className="text-2xl font-semibold text-gray-900">Gerenciamento de Clientes</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowInitialize(true)}>
              <LucideDatabase className="h-4 w-4 mr-2" /> Inicializar BD
            </Button>
            <Button
              onClick={() => {
                setClienteEditando(null)
                setMostrarForm(true)
              }}
            >
              <LucidePlus className="h-4 w-4 mr-2" /> Novo Cliente
            </Button>
          </div>
        </div>

        {!cpfSupported && (
          <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
            <p className="text-yellow-800 text-sm">
              O campo CPF não está disponível no banco de dados. Execute o SQL para adicionar a coluna.
            </p>
          </Card>
        )}

        {mostrarForm ? (
          <Card className="p-6 mb-6">
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
          <Card className="p-6 mb-6">
            <div className="flex items-center">
              <div className="relative flex-grow">
                <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Buscar clientes..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </Card>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  {cpfSupported && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPF
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endereço
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cliente.nome}</td>
                    {cpfSupported && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.cpf}</td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.telefone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.endereco}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => editarCliente(cliente)}>
                        <LucideEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => excluirCliente(cliente.id)}>
                        <LucideTrash className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {clientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={cpfSupported ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
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
