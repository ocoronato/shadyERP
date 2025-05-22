"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import LoadingSpinner from "@/components/loading-spinner"
import { LucidePackage, LucideSave, LucideArrowLeft } from "lucide-react"

interface UnidadeFormProps {
  params: {
    id: string
  }
}

export default function UnidadeForm({ params }: UnidadeFormProps) {
  const isNew = params.id === "novo"
  const id = isNew ? null : Number.parseInt(params.id)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [nome, setNome] = useState("")
  const [sigla, setSigla] = useState("")
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadUnidade() {
      if (isNew) return

      try {
        const { data, error } = await supabase.from("unidades").select("*").eq("id", id).single()

        if (error) throw error

        if (data) {
          setNome(data.nome)
          setSigla(data.sigla)
        }
      } catch (error) {
        console.error("Erro ao carregar unidade:", error)
        alert("Erro ao carregar dados da unidade.")
      } finally {
        setLoading(false)
      }
    }

    loadUnidade()
  }, [isNew, id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!nome.trim() || !sigla.trim()) {
        alert("Por favor, preencha todos os campos.")
        return
      }

      if (isNew) {
        const { error } = await supabase.from("unidades").insert({ nome, sigla })
        if (error) throw error
      } else {
        const { error } = await supabase.from("unidades").update({ nome, sigla }).eq("id", id)
        if (error) throw error
      }

      alert(`Unidade ${isNew ? "cadastrada" : "atualizada"} com sucesso!`)
      router.push("/grade")
    } catch (error) {
      console.error("Erro ao salvar unidade:", error)
      alert(`Erro ao ${isNew ? "cadastrar" : "atualizar"} unidade.`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <LucidePackage className="mr-2" /> {isNew ? "Nova Unidade" : "Editar Unidade"}
          </h1>
          <button onClick={() => router.push("/grade")} className="flex items-center text-gray-600 hover:text-gray-900">
            <LucideArrowLeft className="mr-1" size={18} /> Voltar
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Unidade, Par, Caixa"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="sigla" className="block text-sm font-medium text-gray-700 mb-1">
                Sigla
              </label>
              <input
                type="text"
                id="sigla"
                value={sigla}
                onChange={(e) => setSigla(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: UN, PR, CX"
                required
                maxLength={10}
              />
              <p className="mt-1 text-sm text-gray-500">Máximo de 10 caracteres</p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                {saving ? (
                  <>
                    <span className="mr-2">Salvando...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  </>
                ) : (
                  <>
                    <LucideSave className="mr-2" size={18} /> Salvar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
