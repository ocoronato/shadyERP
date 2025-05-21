import { createClient } from "@/lib/supabase"

export async function getProduto(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("produtos")
    .select(`
      *,
      marcas (id, nome),
      categorias (id, nome)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao buscar produto:", error)
    throw new Error("Não foi possível carregar o produto")
  }

  return data
}

export async function getProdutos() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("produtos")
    .select(`
      *,
      marcas (id, nome),
      categorias (id, nome)
    `)
    .order("nome")

  if (error) {
    console.error("Erro ao buscar produtos:", error)
    throw new Error("Não foi possível carregar os produtos")
  }

  return data || []
}
