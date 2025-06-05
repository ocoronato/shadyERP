"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Search, Plus, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getMarcas, deleteMarca, type Marca } from "@/lib/supabase"
import MarcaForm from "./marca-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function MarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [marcaParaEditar, setMarcaParaEditar] = useState<Marca | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [termoBusca, setTermoBusca] = useState("")
  const { toast } = useToast()

  const carregarMarcas = async () => {
    try {
      setIsLoading(true)
      const data = await getMarcas()
      setMarcas(data)
      setErro(null)
    } catch (error) {
      console.error("Erro ao carregar marcas:", error)
      setErro("Não foi possível carregar as marcas. Tente novamente mais tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarMarcas()
  }, [])

  const handleNovaMarca = () => {
    setMarcaParaEditar(null)
    setMostrarForm(true)
  }

  const handleEditarMarca = (marca: Marca) => {
    setMarcaParaEditar(marca)
    setMostrarForm(true)
  }

  const handleExcluirMarca = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta marca?")) {
      try {
        await deleteMarca(id)
        toast({
          title: "Marca excluída",
          description: "A marca foi excluída com sucesso.",
        })
        carregarMarcas()
      } catch (error: any) {
        toast({
          title: "Erro ao excluir",
          description: error.message || "Não foi possível excluir a marca.",
          variant: "destructive",
        })
      }
    }
  }

  const handleSalvarMarca = () => {
    setMostrarForm(false)
    carregarMarcas()
  }

  const handleCancelar = () => {
    setMostrarForm(false)
  }

  const marcasFiltradas = marcas.filter((marca) => marca.nome.toLowerCase().includes(termoBusca.toLowerCase()))

  return (
    <div className="container mx-auto py-6 text-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-gray-100">Gerenciamento de Marcas</h1>

      {erro && (
        <Alert variant="destructive" className="mb-4 bg-red-800/30 border-red-700/40 text-red-300">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{erro}</AlertDescription>
        </Alert>
      )}

      {mostrarForm ? (
        <Card className="bg-neutral-800 shadow-lg border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-100">{marcaParaEditar ? "Editar Marca" : "Nova Marca"}</CardTitle>
          </CardHeader>
          <CardContent>
            <MarcaForm marca={marcaParaEditar} onSave={handleSalvarMarca} onCancel={handleCancelar} />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar marcas..."
                className="pl-8 bg-neutral-700 border-neutral-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            <Button onClick={handleNovaMarca} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Nova Marca
            </Button>
          </div>

          <Card className="bg-neutral-800 shadow-lg border-neutral-700">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-neutral-700">
                    <TableHead className="text-gray-300">ID</TableHead>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">Data de Criação</TableHead>
                    <TableHead className="text-gray-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-400">
                        Carregando marcas...
                      </TableCell>
                    </TableRow>
                  ) : marcasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-400">
                        {termoBusca ? "Nenhuma marca encontrada com esse termo de busca." : "Nenhuma marca cadastrada."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    marcasFiltradas.map((marca) => (
                      <TableRow key={marca.id} className="border-b border-neutral-700 hover:bg-neutral-700/50">
                        <TableCell className="text-gray-100">{marca.id}</TableCell>
                        <TableCell className="text-gray-100">{marca.nome}</TableCell>
                        <TableCell className="text-gray-300">
                          {marca.created_at ? new Date(marca.created_at).toLocaleDateString("pt-BR") : "N/A"}
                        </TableCell>
                        <TableCell className="text-right text-gray-300">
                          <Button variant="ghost" size="icon" onClick={() => handleEditarMarca(marca)} title="Editar">
                            <Pencil className="h-4 w-4 text-gray-400 hover:text-indigo-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExcluirMarca(marca.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
