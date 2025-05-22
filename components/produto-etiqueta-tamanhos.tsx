"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LucidePrinter } from "lucide-react"
import type { Produto } from "@/lib/supabase"
import { generateBarcode } from "@/lib/barcode-utils"

interface EstoqueTamanho {
  id: number
  produto_id: number
  tamanho: number
  quantidade: number
}

interface ProdutoEtiquetaTamanhosProps {
  produto: Produto
  estoqueTamanhos: EstoqueTamanho[]
}

export function ProdutoEtiquetaTamanhos({ produto, estoqueTamanhos }: ProdutoEtiquetaTamanhosProps) {
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState<number[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [imprimindo, setImprimindo] = useState(false)

  // Calcular o total de etiquetas a serem impressas
  const calcularTotalEtiquetas = () => {
    return tamanhosSelecionados.reduce((total, tamanho) => {
      const estoqueTamanho = estoqueTamanhos.find((et) => et.tamanho === tamanho)
      return total + (estoqueTamanho?.quantidade || 0)
    }, 0)
  }

  const toggleTamanho = (tamanho: number) => {
    if (tamanhosSelecionados.includes(tamanho)) {
      setTamanhosSelecionados(tamanhosSelecionados.filter((t) => t !== tamanho))
    } else {
      setTamanhosSelecionados([...tamanhosSelecionados, tamanho])
    }
  }

  const selecionarTodos = () => {
    if (tamanhosSelecionados.length === estoqueTamanhos.length) {
      setTamanhosSelecionados([])
    } else {
      setTamanhosSelecionados(estoqueTamanhos.map((et) => et.tamanho))
    }
  }

  const handlePrint = () => {
    if (tamanhosSelecionados.length === 0) return

    setImprimindo(true)

    // Criamos um iframe oculto para a impressão
    const printFrame = document.createElement("iframe")
    printFrame.style.position = "absolute"
    printFrame.style.top = "-9999px"
    printFrame.style.left = "-9999px"
    document.body.appendChild(printFrame)

    // Escrevemos o conteúdo HTML das etiquetas no iframe
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
              ${tamanhosSelecionados
                .map((tamanho) => {
                  const estoqueTamanho = estoqueTamanhos.find((et) => et.tamanho === tamanho)
                  const quantidade = estoqueTamanho?.quantidade || 0

                  return Array.from({ length: quantidade })
                    .map(
                      (_, index) => `
                    <div class="etiqueta">
                      <div class="etiqueta-conteudo">
                        <div class="codigo">#${produto.id}</div>
                        <div class="nome">${produto.nome}</div>
                        <div class="tipo">TAM: ${tamanho}</div>
                        <div class="barcode">
                          ${generateBarcode(produto.id, tamanho)}
                        </div>
                        <div class="barcode-text">P${produto.id}T${tamanho}</div>
                      </div>
                    </div>
                  `,
                    )
                    .join("")
                })
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
        setDialogOpen(false)
      }, 500)
    }
  }

  const totalEtiquetas = calcularTotalEtiquetas()

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setDialogOpen(true)}>
            <LucidePrinter className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimir Etiquetas</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecione os tamanhos para imprimir</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="todos"
                checked={tamanhosSelecionados.length === estoqueTamanhos.length && estoqueTamanhos.length > 0}
                onCheckedChange={selecionarTodos}
              />
              <Label htmlFor="todos">Selecionar todos</Label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {estoqueTamanhos.map((et) => (
                <div key={et.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tamanho-${et.tamanho}`}
                    checked={tamanhosSelecionados.includes(et.tamanho)}
                    onCheckedChange={() => toggleTamanho(et.tamanho)}
                  />
                  <Label htmlFor={`tamanho-${et.tamanho}`}>
                    Tamanho {et.tamanho} ({et.quantidade} un)
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Total: {totalEtiquetas} etiqueta{totalEtiquetas !== 1 ? "s" : ""}
            </div>
            <Button onClick={handlePrint} disabled={totalEtiquetas === 0 || imprimindo}>
              {imprimindo ? "Imprimindo..." : `Imprimir ${totalEtiquetas} etiqueta${totalEtiquetas !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
