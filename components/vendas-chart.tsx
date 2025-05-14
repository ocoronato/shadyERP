"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

// Registrar os componentes necessários do Chart.js
Chart.register(...registerables)

type VendasChartProps = {
  dados: {
    data: string
    total: number
  }[]
}

export function VendasChart({ dados }: VendasChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || !dados || dados.length === 0) return

    // Destruir o gráfico anterior se existir
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Preparar os dados para o gráfico
    const labels = dados.map((item) => item.data)
    const values = dados.map((item) => item.total)

    // Criar o gráfico
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Valor de Vendas",
            data: values,
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: "rgb(99, 102, 241)",
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => `R$ ${context.raw}`,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `R$ ${value}`,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [dados])

  return (
    <div className="h-64 w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
