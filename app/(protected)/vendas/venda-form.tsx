"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LucidePlus, LucideTrash, LucideAlertCircle } from "lucide-react"
import { addVenda, getClientes, getProdutos, type Cliente, type Produto } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function VendaForm({ onSave, onCancel }) {
  const [cliente, setCliente] = useState("")
  const [status, setStatus] = useState("Pendente")
  const [itens, setItens] = useState([{ produto: "", quantidade: 1, preco_unitario: 0, estoqueDisponivel: 0 }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function carregarDados() {
      try {
        const [clientesData, produtosData] = await Promise.all([getClientes(), getProdutos()])
        setClientes(clientesData)
        setProdutos(produtosData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar clientes e produtos.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    carregarDados()
  }, [toast])

  const adicionarItem = () => {
    setItens([...itens, { produto: "", quantidade: 1, preco_unitario: 0, estoqueDisponivel: 0 }])
  }

  const removerItem = (index) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index))
    }
  }

  const atualizarItem = (index, campo, valor) => {
    const novosItens = [...itens]
    novosItens[index][campo] = valor

    // Se o produto foi alterado, atualizar o preço unitário e estoque disponível
    if (campo === "produto") {
      const produtoSelecionado = produtos.find((p) => p.nome === valor)
      if (produtoSelecionado) {
        novosItens[index].preco_unitario = produtoSelecionado.preco
        novosItens[index].estoqueDisponivel = produtoSelecionado.estoque

        // Se a quantidade for maior que o estoque disponível, ajustar para o máximo disponível
        if (novosItens[index].quantidade > produtoSelecionado.estoque) {
          novosItens[index].quantidade = produtoSelecionado.estoque
        }
      }
    }

    setItens(novosItens)
  }

  const calcularTotal = () => {
    return itens.reduce((total, item) => {
      return total + item.quantidade * item.preco_unitario
    }, 0)
  }

  const verificarEstoque = () => {
    for (const item of itens) {
      if (item.produto && item.quantidade > item.estoqueDisponivel) {
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cliente) {
      toast({
        title: "Cliente obrigatório",
        description: "Selecione um cliente!",
        variant: "destructive",
      })
      return
    }

    if (itens.some((item) => !item.produto)) {
      toast({
        title: "Produtos obrigatórios",
        description: "Todos os itens devem ter um produto selecionado!",
        variant: "destructive",
      })
      return
    }

    // Verificar estoque
    if (!verificarEstoque()) {
      toast({
        title: "Estoque insuficiente",
        description: "Um ou mais produtos não possuem estoque suficiente!",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const dataAtual = new Date()
      const dataFormatada = `${dataAtual.getDate().toString().padStart(2, "0")}/${(dataAtual.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${dataAtual.getFullYear()}`

      const novaVenda = {
        cliente,
        data: dataFormatada,
        status,
        itens: itens.map((item) => ({
          produto: item.produto,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
        })),
        total: calcularTotal(),
      }

      const vendaSalva = await addVenda(novaVenda)
      onSave(vendaSalva)
      toast({
        title: "Venda registrada",
        description: "A venda foi registrada com sucesso e o estoque foi atualizado.",
      })
    } catch (error) {
      console.error("Erro ao registrar venda:", error)
      setError(error.message || "Não foi possível registrar a venda.")
      toast({
        title: "Erro ao registrar venda",
        description: error.message || "Não foi possível registrar a venda.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-gray-500">Carregando dados...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium mb-4">Nova Venda</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <LucideAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente</Label>
          <Select value={cliente} onValueChange={setCliente}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.nome}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Concluída">Concluída</SelectItem>
              <SelectItem value="Cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <h3 className="text-md font-medium mb-2">Itens da Venda</h3>

      {itens.map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 mb-4">
          <div className="col-span-5">
            <Label htmlFor={`produto-${index}`} className="text-xs mb-1 block">
              Produto
            </Label>
            <Select value={item.produto} onValueChange={(valor) => atualizarItem(index, "produto", valor)}>
              <SelectTrigger id={`produto-${index}`}>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {produtos.map((p) => (
                  <SelectItem key={p.id} value={p.nome} disabled={p.estoque === 0}>
                    {p.nome} {p.estoque === 0 ? "(Sem estoque)" : `(${p.estoque} disponíveis)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label htmlFor={`quantidade-${index}`} className="text-xs mb-1 block">
              Quantidade
            </Label>
            <Input
              id={`quantidade-${index}`}
              type="number"
              min="1"
              max={item.estoqueDisponivel}
              value={item.quantidade}
              onChange={(e) => atualizarItem(index, "quantidade", Number.parseInt(e.target.value) || 1)}
              placeholder="Qtd"
              className={item.quantidade > item.estoqueDisponivel ? "border-red-500" : ""}
            />
            {item.produto && <p className="text-xs text-gray-500 mt-1">Disponível: {item.estoqueDisponivel}</p>}
          </div>

          <div className="col-span-3">
            <Label htmlFor={`preco-${index}`} className="text-xs mb-1 block">
              Preço unitário
            </Label>
            <Input
              id={`preco-${index}`}
              type="text"
              value={`R$ ${item.preco_unitario.toFixed(2).replace(".", ",")}`}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="col-span-2 flex items-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removerItem(index)}
              disabled={itens.length === 1}
              className="mb-1"
            >
              <LucideTrash className="h-4 w-4 text-red-500" />
            </Button>
          </div>

          {item.produto && item.quantidade > item.estoqueDisponivel && (
            <div className="col-span-12">
              <p className="text-xs text-red-500">Estoque insuficiente! Disponível: {item.estoqueDisponivel}</p>
            </div>
          )}
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={adicionarItem} className="mb-6">
        <LucidePlus className="h-4 w-4 mr-2" /> Adicionar Item
      </Button>

      <div className="flex justify-between items-center mt-4 mb-6">
        <div className="text-lg font-medium">
          Total: <span className="text-blue-600">R$ {calcularTotal().toFixed(2).replace(".", ",")}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !verificarEstoque() || itens.some((item) => !item.produto)}>
          {isSubmitting ? "Processando..." : "Finalizar Venda"}
        </Button>
      </div>
    </form>
  )
}
