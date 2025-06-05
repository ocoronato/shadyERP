import { DollarSign, Package, Users, TrendingUp, BarChart3, ListOrdered } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getDashboardData, getProdutos, type Produto, type Venda } from "@/lib/supabase" // Adicionado getProdutos e tipos
import { VendasChart } from "@/components/vendas-chart" // Certifique-se que o caminho está correto
import { MargemLucroChart } from "@/components/margem-lucro-chart" // Certifique-se que o caminho está correto
import { format } from "date-fns" // Para formatar datas
import { ptBR } from "date-fns/locale" // Para formato de data em português

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData()
  const todosProdutos = (await getProdutos()) as Produto[] // Fetch todos os produtos para o gráfico de margem

  return (
    <div className="space-y-8 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-neutral-800 border-neutral-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Receita Total (Mês)</CardTitle>
            <DollarSign className="h-5 w-5 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(dashboardData.receitaMensal)}</div>
            <p className="text-xs text-gray-400">{dashboardData.vendasMes} venda(s) este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Novos Clientes (Mês)</CardTitle>
            <Users className="h-5 w-5 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+{dashboardData.novosClientesMes}</div>
            <p className="text-xs text-gray-400">Clientes cadastrados este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Produtos em Baixo Estoque</CardTitle>
            <Package className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.produtosBaixoEstoqueCount}</div>
            <p className="text-xs text-gray-400">Itens precisando de reposição (Estoque {"<"} 10)</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Vendas (Linha) - Ocupa 2 colunas em telas grandes */}
        <Card className="lg:col-span-2 bg-neutral-800 border-neutral-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-indigo-400" />
              Desempenho de Vendas (Últimos 30 dias)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Visualização do total de vendas ao longo do tempo.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-2 md:p-4">
            {dashboardData.dadosGrafico && dashboardData.dadosGrafico.length > 0 ? (
              <VendasChart dados={dashboardData.dadosGrafico} />
            ) : (
              <p className="text-gray-400 text-center pt-10">Sem dados de vendas para exibir no gráfico.</p>
            )}
          </CardContent>
        </Card>

        {/* Produtos Mais Vendidos */}
        <Card className="bg-neutral-800 border-neutral-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <ListOrdered className="h-5 w-5 mr-2 text-indigo-400" />
              Top 5 Produtos Mais Vendidos
            </CardTitle>
            <CardDescription className="text-gray-400">Produtos com maior quantidade vendida (geral).</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.produtosMaisVendidos && dashboardData.produtosMaisVendidos.length > 0 ? (
              <ul className="space-y-3">
                {dashboardData.produtosMaisVendidos.map((item, index) => (
                  <li key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 truncate max-w-[70%]">{item.produto}</span>
                    <span className="font-semibold text-indigo-400">{item.quantidade} und.</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Sem dados de produtos mais vendidos.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas Recentes */}
        <Card className="bg-neutral-800 border-neutral-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Vendas Recentes</CardTitle>
            <CardDescription className="text-gray-400">Últimas 5 vendas realizadas.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.vendasRecentes && dashboardData.vendasRecentes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-700">
                    <TableHead className="text-gray-300">Cliente</TableHead>
                    <TableHead className="text-gray-300">Data</TableHead>
                    <TableHead className="text-right text-gray-300">Total</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.vendasRecentes.map((venda: Venda) => (
                    <TableRow key={venda.id} className="border-neutral-700 hover:bg-neutral-700/50">
                      <TableCell className="font-medium text-gray-300">{venda.cliente}</TableCell>
                      <TableCell className="text-gray-400">
                        {/* Formatar a data DD/MM/YYYY */}
                        {venda.data
                          ? format(
                              new Date(venda.data.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3")),
                              "dd/MM/yyyy",
                              { locale: ptBR },
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">{formatCurrency(venda.total)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            venda.status === "Concluída"
                              ? "bg-green-700 text-green-200"
                              : venda.status === "Pendente"
                                ? "bg-yellow-700 text-yellow-200"
                                : venda.status === "Cancelada"
                                  ? "bg-red-700 text-red-200"
                                  : "bg-gray-700 text-gray-200"
                          }`}
                        >
                          {venda.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-400">Nenhuma venda recente encontrada.</p>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Margem de Lucro */}
        <Card className="bg-neutral-800 border-neutral-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-indigo-400" />
              Top 10 Produtos por Margem de Lucro
            </CardTitle>
            <CardDescription className="text-gray-400">Visualização da margem de lucro dos produtos.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-2 md:p-4">
            {todosProdutos && todosProdutos.length > 0 ? (
              <MargemLucroChart produtos={todosProdutos} />
            ) : (
              <p className="text-gray-400 text-center pt-10">Sem dados de produtos para exibir o gráfico de margem.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
