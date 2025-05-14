"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFornecedores, getMarcas } from "@/lib/supabase"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

// Tamanhos disponíveis para produtos do tipo "par"
const TAMANHOS_DISPONIVEIS = Array.from({ length: 50 }, (_, i) => i + 1)

export default function NovoPedidoPage() {
  const [etapa, setEtapa] = useState(1)
  const [fornecedores, setFornecedores] = useState<any[]>([])
  const [marcas, setMarcas] = useState<any[]>([])
  const [formData, setFormData] = useState({
    marca: "",
    fornecedor_id: "",
    previsao_entrega: "",
    tipo: "unidade",
    tamanhos: [] as number[],
  })

  useEffect(() => {
    async function loadData() {
      try {
        // Carregar fornecedores
        const fornecedoresData = await getFornecedores()
        setFornecedores(fornecedoresData)

        // Carregar marcas
        const marcasData = await getMarcas()
        setMarcas(marcasData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      }
    }

    loadData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTipoChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tipo: value,
      // Limpar tamanhos se mudar para unidade
      tamanhos: value === "unidade" ? [] : prev.tamanhos,
    }))
  }

  const handleTamanhoChange = (tamanho: number, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, tamanhos: [...prev.tamanhos, tamanho] }
      } else {
        return { ...prev, tamanhos: prev.tamanhos.filter((t) => t !== tamanho) }
      }
    })
  }

  const handleProximo = () => {
    setEtapa(2)
  }

  const handleVoltar = () => {
    setEtapa(1)
  }

  const handleFinalizar = () => {
    // Por enquanto não faz nada, apenas exibe os dados no console
    console.log("Dados do pedido:", formData)
  }

  // Verificar se o botão "Próximo" da segunda etapa deve ser habilitado
  const proximoHabilitado = formData.tipo === "unidade" || (formData.tipo === "par" && formData.tamanhos.length > 0)

  if (etapa === 1) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Novo Pedido - Etapa 1</h1>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Marca</label>
                <select
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Selecione uma marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fornecedor</label>
                <select
                  name="fornecedor_id"
                  value={formData.fornecedor_id}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Selecione um fornecedor</option>
                  {fornecedores.map((fornecedor) => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.razao_social}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Previsão de Entrega</label>
                <input
                  type="date"
                  name="previsao_entrega"
                  value={formData.previsao_entrega}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  onClick={handleProximo}
                  disabled={!formData.marca || !formData.fornecedor_id || !formData.previsao_entrega}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Novo Pedido - Etapa 2</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tipo de Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <RadioGroup value={formData.tipo} onValueChange={handleTipoChange} className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unidade" id="unidade" />
                <Label htmlFor="unidade">Unidade</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="par" id="par" />
                <Label htmlFor="par">Par</Label>
              </div>
            </RadioGroup>

            {formData.tipo === "par" && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Selecione os tamanhos:</h3>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {TAMANHOS_DISPONIVEIS.map((tamanho) => (
                    <div key={tamanho} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tamanho-${tamanho}`}
                        checked={formData.tamanhos.includes(tamanho)}
                        onCheckedChange={(checked) => handleTamanhoChange(tamanho, checked === true)}
                      />
                      <label
                        htmlFor={`tamanho-${tamanho}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {tamanho}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleVoltar}>
                Voltar
              </Button>
              <Button type="button" onClick={handleFinalizar} disabled={!proximoHabilitado}>
                Próximo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
