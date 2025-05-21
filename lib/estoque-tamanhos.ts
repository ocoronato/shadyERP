import { createClient } from "@/lib/supabase"

export async function getEstoqueTamanhos(produtoId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("estoque_tamanhos")
    .select("*")
    .eq("produto_id", produtoId)
    .order("tamanho")

  if (error) {
    console.error("Erro ao buscar tamanhos do estoque:", error)
    throw new Error("Não foi possível carregar os tamanhos do estoque")
  }

  return data || []
}

export async function atualizarEstoqueTamanho(id: number, quantidade: number) {
  const supabase = createClient()

  const { data, error } = await supabase.from("estoque_tamanhos").update({ quantidade }).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar tamanho do estoque:", error)
    throw new Error("Não foi possível atualizar o tamanho do estoque")
  }

  return data
}

export async function criarEstoqueTamanho(produtoId: string, tamanho: string, quantidade: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("estoque_tamanhos")
    .insert([{ produto_id: produtoId, tamanho, quantidade }])
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar tamanho do estoque:", error)
    throw new Error("Não foi possível criar o tamanho do estoque")
  }

  return data
}
