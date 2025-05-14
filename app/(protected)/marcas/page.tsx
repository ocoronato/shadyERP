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
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Marcas</h1>

      {erro && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {mostrarForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{marcaParaEditar ? "Editar Marca" : "Nova Marca"}</CardTitle>
          </CardHeader>
          <CardContent>
            <MarcaForm marca={marcaParaEditar} onSave={handleSalvarMarca} onCancel={handleCancelar} />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar marcas..."
                className="pl-8"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            <Button onClick={handleNovaMarca} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Nova Marca
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Carregando marcas...
                      </TableCell>
                    </TableRow>
                  ) : marcasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        {termoBusca ? "Nenhuma marca encontrada com esse termo de busca." : "Nenhuma marca cadastrada."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    marcasFiltradas.map((marca) => (
                      <TableRow key={marca.id}>
                        <TableCell>{marca.id}</TableCell>
                        <TableCell>{marca.nome}</TableCell>
                        <TableCell>
                          {marca.created_at ? new Date(marca.created_at).toLocaleDateString("pt-BR") : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditarMarca(marca)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExcluirMarca(marca.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
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
