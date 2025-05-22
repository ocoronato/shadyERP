"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"

export default function AddUnidadeIdColumn() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const executeSQL = async () => {
    setIsExecuting(true)
    setResult(null)

    try {
      // Verificar se a coluna já existe
      const { data: checkData, error: checkError } = await supabase.rpc("execute_sql", {
        sql_query: `
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'produtos' 
            AND column_name = 'unidade_id'
          ) as coluna_existe;
        `,
      })

      if (checkError) {
        throw checkError
      }

      let colunaExiste = false
      if (checkData && checkData[0] && checkData[0][0]) {
        const resultado = JSON.parse(checkData[0][0])
        if (resultado && resultado.length > 0) {
          colunaExiste = resultado[0].coluna_existe
        }
      }

      if (colunaExiste) {
        setResult("A coluna unidade_id já existe na tabela produtos.")
        toast({
          title: "Coluna já existe",
          description: "A coluna unidade_id já existe na tabela produtos.",
        })
        return
      }

      // Adicionar a coluna
      const { error } = await supabase.rpc("execute_sql", {
        sql_query: `ALTER TABLE produtos ADD COLUMN unidade_id INTEGER;`,
      })

      if (error) {
        throw error
      }

      setResult("Coluna unidade_id adicionada com sucesso à tabela produtos.")
      toast({
        title: "Sucesso",
        description: "Coluna unidade_id adicionada com sucesso à tabela produtos.",
      })
    } catch (error: any) {
      console.error("Erro ao executar SQL:", error)
      setResult(`Erro: ${error.message || "Erro desconhecido"}`)
      toast({
        title: "Erro",
        description: error.message || "Erro ao executar SQL",
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Adicionar Coluna unidade_id</CardTitle>
        <CardDescription>
          Adiciona a coluna unidade_id à tabela produtos para permitir a associação com unidades de medida.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <div className={`p-3 mb-4 rounded-md ${result.includes("Erro") ? "bg-red-50" : "bg-green-50"}`}>{result}</div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={executeSQL} disabled={isExecuting} className="w-full">
          {isExecuting ? "Executando..." : "Adicionar Coluna unidade_id"}
        </Button>
      </CardFooter>
    </Card>
  )
}
