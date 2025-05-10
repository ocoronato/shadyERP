"use client"

import { Button } from "@/components/ui/button"
import { LucideArrowLeft, LucidePrinter } from "lucide-react"

export default function VendaDetalhes({ venda, onVoltar }) {
  const formatarPreco = (preco) => {
    return `R$ ${preco.toFixed(2).replace(".", ",")}`
  }

  const imprimirVenda = () => {
    window.print()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={onVoltar} className="mr-4">
            <LucideArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <h2 className="text-lg font-medium">Detalhes da Venda #{venda.id}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={imprimirVenda}>
          <LucidePrinter className="h-4 w-4 mr-2" /> Imprimir
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Cliente</p>
          <p className="font-medium">{venda.cliente}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Data</p>
          <p className="font-medium">{venda.data}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p>
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                venda.status === "Concluída" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {venda.status}
            </span>
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total</p>
          <p className="font-medium text-blue-600">{formatarPreco(venda.total)}</p>
        </div>
      </div>

      <h3 className="text-md font-medium mb-2">Itens da Venda</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
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
            {venda.itens.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.produto}</td>
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
              <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                Total:
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                {formatarPreco(venda.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
