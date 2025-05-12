"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { LucideUsers, LucidePackage, LucideShoppingCart, LucideDollarSign, LucideLoader2 } from "lucide-react"
import { getDashboardData } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true)
        const data = await getDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
        setError("Não foi possível carregar os dados do dashboard.")
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [toast])

  const formatarPreco = (preco: number) => {
    return `R$ ${preco.toFixed(2).replace(".", ",")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <LucideLoader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
              <p className="text-gray-500">Carregando dados do dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
          <Card className="p-6">
            <div className="flex justify-center items-center h-32">
              <p className="text-red-500">{error}</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <LucideUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Clientes</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.totalClientes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <LucidePackage className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Produtos</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.totalProdutos}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <LucideShoppingCart className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vendas do Mês</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.vendasMes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <LucideDollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Receita Mensal</p>
                <p className="text-2xl font-semibold text-gray-900">{formatarPreco(dashboardData.receitaMensal)}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Vendas Recentes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.vendasRecentes.map((venda: any) => (
                    <tr key={venda.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{venda.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{venda.cliente}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarPreco(venda.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venda.data}</td>
                    </tr>
                  ))}
                  {dashboardData.vendasRecentes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        Nenhuma venda recente encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Produtos Mais Vendidos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendas
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.produtosMaisVendidos.map((item: any) => (
                    <tr key={item.produto}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.produto}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarPreco(item.precoUnitario)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantidade}</td>
                    </tr>
                  ))}
                  {dashboardData.produtosMaisVendidos.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        Nenhum produto vendido encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
