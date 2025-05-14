"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addMarca, updateMarca, type Marca } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface MarcaFormProps {
  marca: Marca | null
  onSave: () => void
  onCancel: () => void
}

export default function MarcaForm({ marca, onSave, onCancel }: MarcaFormProps) {
  const [nome, setNome] = useState(marca?.nome || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim()) {
      setErro("O nome da marca é obrigatório.")
      return
    }

    setIsSubmitting(true)
    setErro(null)

    try {
      if (marca) {
        // Atualizar marca existente
        await updateMarca(marca.id, { nome })
        toast({
          title: "Marca atualizada",
          description: "A marca foi atualizada com sucesso.",
        })
      } else {
        // Adicionar nova marca
        await addMarca({ nome })
        toast({
          title: "Marca adicionada",
          description: "A marca foi adicionada com sucesso.",
        })
      }
      onSave()
    } catch (error: any) {
      setErro(error.message || "Ocorreu um erro ao salvar a marca.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {erro && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da Marca</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome da marca"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : marca ? "Atualizar" : "Salvar"}
          </Button>
        </div>
      </div>
    </form>
  )
}
