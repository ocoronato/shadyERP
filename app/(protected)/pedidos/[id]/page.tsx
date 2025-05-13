"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LucideArrowLeft, LucideCheck, LucideX, LucidePackage, LucideCalendar } from "lucide-react"
import { getPedidoById, getFornecedores, updatePedidoStatus, type Fornecedor } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function DetalhesPedido({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [pedido, setPedido] = useState<any>(null)
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Estado para o diálogo de confirmação
  const [dialogoAberto, setDialogoAberto] = useState(false)
  const [notaFiscal, setNotaFiscal] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const carregarPedido = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Verificar se o ID é um número válido
      const id = Number.parseInt(params.id)
      if (isNaN(id)) {
        setError("ID de pedido inválido")
        setIsLoading(false)
        return
      }

      const pedidoData = await getPedidoById(id)

      if (!pedidoData) {
        setError("Pedido não encontrado")
        return
      }

      setPedido(pedidoData)

      // Carregar dados do fornecedor
      const fornecedoresData = await getFornecedores()
      const fornecedorEncontrado = fornecedoresData.find((f) => f.id === pedidoData.fornecedor_id)
      setFornecedor(fornecedorEncontrado || null)
    } catch (error) {
      console.error("Erro ao carregar pedido:", error)
      setError("Não foi possível carregar os dados do pedido.")
      toast({
        title: "Erro ao carregar pedido",
        description: "Não foi possível carregar os dados do pedido.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id === "novo") {
      router.push("/pedidos/novo")
      return
    }
    carregarPedido()
  }, [params.id, router])

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

  const confirmarRecebimento = async () => {
    if (!notaFiscal.trim()) {
      toast({
        title: "Nota Fiscal obrigatória",
        description: "Informe o número da Nota Fiscal para confirmar o recebimento.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await updatePedidoStatus(pedido.id, "Recebido", notaFiscal)

      toast({
        title: "Pedido recebido",
        description: "O pedido foi marcado como recebido e os produtos foram adicionados ao estoque.",
      })

      // Recarregar os dados do pedido
      await carregarPedido()

      // Fechar o diálogo
      setDialogoAberto(false)
    } catch (error) {
      console.error("Erro ao confirmar recebimento:", error)
      toast({
        title: "Erro ao confirmar recebimento",
        description: "Ocorreu um erro ao confirmar o recebimento do pedido.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelarPedido = async () => {
    if (confirm("Tem certeza que deseja cancelar este pedido?")) {
      try {
        await updatePedidoStatus(pedido.id, "Cancelado")

        toast({
          title: "Pedido cancelado",
          description: "O pedido foi cancelado com sucesso.",
        })

        // Recarregar os dados do pedido
        await carregarPedido()
      } catch (error) {
        console.error("Erro ao cancelar pedido:", error)
        toast({
          title: "Erro ao cancelar pedido",
          description: "Ocorreu um erro ao cancelar o pedido.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Button variant="outline" onClick={() => router.push("/pedidos")} className="mr-4">
              <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Detalhes do Pedido</h1>
          </div>
          <Card className="p-6">
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Carregando dados do pedido...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !pedido) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Button variant="outline" onClick={() => router.push("/pedidos")} className="mr-4">
              <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Detalhes do Pedido</h1>
          </div>
          <Card className="p-6">
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-500">{error || "Pedido não encontrado"}</p>
              <Button onClick={() => router.push("/pedidos")}>Voltar para a lista de pedidos</Button>
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
          <div className="flex items-center">
            <Button variant="outline" onClick={() => router.push("/pedidos")} className="mr-4">
              <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Pedido #{pedido.id}</h1>
          </div>

          {pedido.status === "Pendente" && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={cancelarPedido}>
                <LucideX className="h-4 w-4 mr-2" /> Cancelar Pedido
              </Button>
              <Button onClick={() => setDialogoAberto(true)}>
                <LucideCheck className="h-4 w-4 mr-2" /> Confirmar Recebimento
              </Button>
            </div>
          )}
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Informações do Pedido</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge
                      variant={
                        pedido.status === "Recebido"
                          ? "success"
                          : pedido.status === "Cancelado"
                            ? "destructive"
                            : "warning"
                      }
                      className="mt-1"
                    >
                      {pedido.status}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Data do Pedido</p>
                    <p className="font-medium">{formatarData(pedido.data_pedido)}</p>
                  </div>

                  {pedido.nota_fiscal && (
                    <div>
                      <p className="text-sm text-gray-500">Nota Fiscal</p>
                      <p className="font-medium">{pedido.nota_fiscal}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500">Descrição</p>
                    <p className="font-medium">{pedido.descricao || "Sem descrição"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Fornecedor</h2>
                <div className="space-y-3">
                  {fornecedor ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Razão Social</p>
                        <p className="font-medium">{fornecedor.razao_social}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">CNPJ</p>
                        <p className="font-medium">{fornecedor.cnpj}</p>
                      </div>

                      {fornecedor.nome_fantasia && (
                        <div>
                          <p className="text-sm text-gray-500">Nome Fantasia</p>
                          <p className="font-medium">{fornecedor.nome_fantasia}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">Fornecedor não encontrado</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Itens do Pedido</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço Unitário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pedido.itens.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.categoria}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {item.tipo_estoque === "unidade" ? (
                            <LucidePackage className="h-3 w-3" />
                          ) : (
                            <LucideCalendar className="h-3 w-3" />
                          )}
                          {item.tipo_estoque === "unidade" ? "Unidade" : "Par"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantidade}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarPreco(item.preco_unitario)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarPreco(item.quantidade * item.preco_unitario)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Total:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatarPreco(pedido.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Parcelas</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parcela
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Vencimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pedido.parcelas.map((parcela: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {parcela.numero_parcela}/{pedido.parcelas.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarData(parcela.data_vencimento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarPreco(parcela.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Total:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatarPreco(pedido.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para confirmar recebimento */}
      <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Recebimento do Pedido</DialogTitle>
            <DialogDescription>
              Ao confirmar o recebimento, os produtos serão adicionados ao estoque e as contas a pagar serão geradas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nota-fiscal">Número da Nota Fiscal</Label>
              <Input
                id="nota-fiscal"
                value={notaFiscal}
                onChange={(e) => setNotaFiscal(e.target.value)}
                placeholder="Informe o número da Nota Fiscal"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAberto(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={confirmarRecebimento} disabled={isSubmitting}>
              {isSubmitting ? "Processando..." : "Confirmar Recebimento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
