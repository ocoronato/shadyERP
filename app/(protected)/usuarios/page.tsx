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
  LucideLoader2,
  LucideDownload,
} from "lucide-react"
import UsuarioForm from "./usuario-form"
import {
  getUsuarios,
  deleteUsuario,
  type Usuario,
  getClientes,
  getProdutos,
  getCategorias,
  getVendas,
  getFornecedores,
  getContasPagar,
  getContasReceber,
} from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [busca, setBusca] = useState("")
  const [mostrarForm, setMostrarForm] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const carregarUsuarios = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getUsuarios()
      setUsuarios(data)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      setError("Não foi possível carregar a lista de usuários. Tente novamente.")
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busca.toLowerCase()) ||
      (usuario.user && usuario.user.toLowerCase().includes(busca.toLowerCase())) || // Adicionado filtro por user
      usuario.cargo.toLowerCase().includes(busca.toLowerCase()),
  )

  const adicionarUsuario = (novoUsuario: Usuario) => {
    setUsuarios([...usuarios, novoUsuario])
    setMostrarForm(false)
    setUsuarioEditando(null) // Limpar formulário
    toast({
      title: "Usuário adicionado",
      description: "O usuário foi adicionado com sucesso.",
    })
  }

  const atualizarUsuario = (usuarioAtualizado: Usuario) => {
    setUsuarios(usuarios.map((u) => (u.id === usuarioAtualizado.id ? usuarioAtualizado : u)))
    setUsuarioEditando(null)
    setMostrarForm(false)
    toast({
      title: "Usuário atualizado",
      description: "Os dados do usuário foram atualizados com sucesso.",
    })
  }

  const excluirUsuario = async (id: number) => {
    // Não permitir excluir o próprio usuário
    if (user?.id === id) {
      toast({
        title: "Operação não permitida",
        description: "Você não pode excluir seu próprio usuário.",
        variant: "destructive",
      })
      return
    }

    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await deleteUsuario(id)
        setUsuarios(usuarios.filter((u) => u.id !== id))
        toast({
          title: "Usuário excluído",
          description: "O usuário foi excluído com sucesso.",
        })
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive",
        })
      }
    }
  }

  const exportarBancoDados = async () => {
    try {
      setIsLoading(true)

      // Buscar dados de todas as tabelas principais
      const clientesData = await getClientes()
      const produtosData = await getProdutos()
      const categoriasData = await getCategorias()
      const vendasData = await getVendas()
      const usuariosData = await getUsuarios()
      const fornecedoresData = await getFornecedores()
      const contasPagarData = await getContasPagar()
      const contasReceberData = await getContasReceber()

      // Criar objeto com todos os dados
      const bancoDados = {
        clientes: clientesData,
        produtos: produtosData,
        categorias: categoriasData,
        vendas: vendasData,
        usuarios: usuariosData,
        fornecedores: fornecedoresData,
        contasPagar: contasPagarData,
        contasReceber: contasReceberData,
        dataExportacao: new Date().toISOString(),
      }

      // Converter para JSON e criar blob
      const jsonString = JSON.stringify(bancoDados, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })

      // Criar URL para download
      const url = URL.createObjectURL(blob)

      // Criar elemento de link e simular clique
      const link = document.createElement("a")
      link.href = url
      link.download = `backup-sistema-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()

      // Limpar
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Exportação concluída",
        description: "O banco de dados foi exportado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao exportar banco de dados:", error)
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o banco de dados.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const editarUsuario = (usuario: Usuario) => {
    setUsuarioEditando(usuario)
    setMostrarForm(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Usuários</h1>
          </div>
          <Card className="p-6 bg-neutral-800">
            <div className="flex justify-center items-center h-32">
              <LucideLoader2 className="h-8 w-8 text-indigo-500 animate-spin mr-2" />
              <p className="text-gray-400">Carregando usuários...</p>
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
            <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Usuários</h1>
          </div>
          <Card className="p-6 bg-neutral-800">
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-400">{error}</p>
              <Button onClick={carregarUsuarios} className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
          <h1 className="text-2xl font-semibold text-gray-100">Gerenciamento de Usuários</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportarBancoDados}
              disabled={isLoading}
              className="border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:text-white disabled:opacity-50"
            >
              <LucideDownload className="h-4 w-4 mr-2" /> Exportar Banco de Dados
            </Button>
            <Button
              onClick={() => {
                setUsuarioEditando(null) // Garantir que o formulário seja para novo usuário
                setMostrarForm(true)
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <LucidePlus className="h-4 w-4 mr-2" /> Novo Usuário
            </Button>
          </div>
        </div>

        {mostrarForm ? (
          <Card className="p-6 mb-6 bg-neutral-800 shadow-lg">
            <UsuarioForm
              usuario={usuarioEditando}
              onSave={usuarioEditando ? atualizarUsuario : adicionarUsuario}
              onCancel={() => {
                setMostrarForm(false)
                setUsuarioEditando(null)
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
                  placeholder="Buscar usuários por nome, email, user ou cargo..."
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
            <table className="min-w-full divide-y divide-neutral-700">
              <thead className="bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cargo
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
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-neutral-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{usuario.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{usuario.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{usuario.user || "-"}</td>{" "}
                    {/* Exibir user ou "-" se não houver */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{usuario.cargo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <Badge
                        variant={usuario.ativo ? "success" : "destructive"}
                        className={
                          usuario.ativo
                            ? "bg-green-600/20 text-green-400 border border-green-600/30"
                            : "bg-red-600/20 text-red-400 border border-red-600/30"
                        }
                      >
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => editarUsuario(usuario)}>
                        <LucideEdit className="h-4 w-4 text-gray-400 hover:text-indigo-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => excluirUsuario(usuario.id)}
                        disabled={user?.id === usuario.id}
                      >
                        <LucideTrash className="h-4 w-4 text-red-500 hover:text-red-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-400">
                      Nenhum usuário encontrado
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
