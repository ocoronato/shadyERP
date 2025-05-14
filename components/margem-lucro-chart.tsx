"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Produto } from "@/lib/supabase"
import Chart from "chart.js/auto"

interface MargemLucroChartProps {
  produtos: Produto[]
}

export function MargemLucroChart({ produtos }: MargemLucroChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || produtos.length === 0) return

    // Calcular margem de lucro para cada produto
    const dadosProdutos = produtos
      .filter((p) => p.custo > 0) // Filtrar produtos sem custo
      .map((produto) => {
        const margem = ((produto.preco - (produto.custo || 0)) / produto.preco) * 100
        return {
          nome: produto.nome,
          margem: Math.round(margem * 100) / 100,
        }
      })
      .sort((a, b) => b.margem - a.margem) // Ordenar por margem (decrescente)
      .slice(0, 10) // Pegar os 10 primeiros

    // Destruir gráfico anterior se existir
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Criar novo gráfico
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: dadosProdutos.map((p) => p.nome),
          datasets: [
            {
              label: "Margem de Lucro (%)",
              data: dadosProdutos.map((p) => p.margem),
              backgroundColor: dadosProdutos.map((p) => {
                if (p.margem < 15) return "rgba(239, 68, 68, 0.7)" // Vermelho para margem baixa
                if (p.margem < 30) return "rgba(249, 115, 22, 0.7)" // Laranja para margem média
                return "rgba(34, 197, 94, 0.7)" // Verde para margem alta
              }),
              borderColor: dadosProdutos.map((p) => {
                if (p.margem < 15) return "rgb(239, 68, 68)" // Vermelho para margem baixa
                if (p.margem < 30) return "rgb(249, 115, 22)" // Laranja para margem média
                return "rgb(34, 197, 94)" // Verde para margem alta
              }),
              borderWidth: 1,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => `Margem: ${context.parsed.x.toFixed(2)}%`,
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: "Margem de Lucro (%)",
              },
            },
          },
        },
      })
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [produtos])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Produtos por Margem de Lucro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  )
}
