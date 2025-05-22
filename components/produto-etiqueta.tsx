"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LucidePrinter } from "lucide-react"
import type { Produto } from "@/lib/supabase"
import { generateBarcode } from "@/lib/barcode-utils"

interface ProdutoEtiquetaProps {
  produto: Produto
  tamanho?: number
}

export const ProdutoEtiqueta = ({ produto, tamanho }: ProdutoEtiquetaProps) => {
  const barcodeId = `P${produto.id}${produto.tipo_estoque === "par" ? `T${tamanho}` : ""}`

  return (
    <div className="p-4 w-[300px] h-[150px] border border-gray-300 m-2">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-lg font-bold">#{produto.id}</div>
        <div className="text-xl font-bold text-center">{produto.nome}</div>
        <div className="text-lg">{produto.tipo_estoque === "unidade" ? "UN" : `TAM: ${tamanho || "N/A"}`}</div>
        <div className="mt-2">
          {/* Código de barras baseado no ID */}
          <div dangerouslySetInnerHTML={{ __html: generateBarcode(produto.id, tamanho) }} className="w-full h-[40px]" />
          <div className="text-center text-xs mt-1">{barcodeId}</div>
        </div>
      </div>
    </div>
  )
}

interface ImprimirEtiquetaButtonProps {
  produto: Produto
  tamanho?: number
}

export function ImprimirEtiquetaButton({ produto, tamanho }: ImprimirEtiquetaButtonProps) {
  const [imprimindo, setImprimindo] = useState(false)

  const handlePrint = () => {
    if (produto.estoque <= 0) {
      alert("Não há itens em estoque para imprimir etiquetas.")
      return
    }

    setImprimindo(true)

    // Criamos um iframe oculto para a impressão
    const printFrame = document.createElement("iframe")
    printFrame.style.position = "absolute"
    printFrame.style.top = "-9999px"
    printFrame.style.left = "-9999px"
    document.body.appendChild(printFrame)

    // Escrevemos o conteúdo HTML da etiqueta no iframe
    const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document
    if (frameDoc) {
      frameDoc.open()
      frameDoc.write(`
        <html>
          <head>
            <title>Etiquetas - ${produto.nome}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              .etiquetas-container { display: flex; flex-wrap: wrap; }
              .etiqueta { width: 300px; height: 150px; border: 1px solid #ccc; padding: 10px; margin: 10px; }
              .etiqueta-conteudo { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
              .codigo { font-size: 16px; font-weight: bold; }
              .nome { font-size: 18px; font-weight: bold; text-align: center; margin: 5px 0; }
              .tipo { font-size: 16px; }
              .barcode { width: 100%; height: 40px; margin-top: 10px; }
              .barcode-text { text-align: center; font-size: 12px; margin-top: 5px; }
              @media print {
                .etiqueta { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="etiquetas-container">
              ${Array.from({ length: produto.estoque })
                .map(
                  (_, index) => `
                <div class="etiqueta">
                  <div class="etiqueta-conteudo">
                    <div class="codigo">#${produto.id}</div>
                    <div class="nome">${produto.nome}</div>
                    <div class="tipo">UN</div>
                    <div class="barcode">
                      ${generateBarcode(produto.id)}
                    </div>
                    <div class="barcode-text">P${produto.id}</div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </body>
        </html>
      `)
      frameDoc.close()

      // Imprimimos o iframe e depois o removemos
      printFrame.contentWindow?.focus()
      printFrame.contentWindow?.print()

      // Removemos o iframe após a impressão
      setTimeout(() => {
        document.body.removeChild(printFrame)
        setImprimindo(false)
      }, 500)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handlePrint} disabled={imprimindo} className="flex items-center gap-1">
      <LucidePrinter className="h-4 w-4" />
      <span className="hidden sm:inline">
        {imprimindo ? "Imprimindo..." : `Imprimir ${produto.estoque} Etiqueta${produto.estoque !== 1 ? "s" : ""}`}
      </span>
    </Button>
  )
}
