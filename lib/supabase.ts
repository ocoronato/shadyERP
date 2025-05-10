import { createClient } from "@supabase/supabase-js"

// Essas variáveis de ambiente já estão configuradas pelo Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para as tabelas
// Atualizar o tipo Cliente para tornar o campo CPF opcional
export type Cliente = {
  id: number
  nome: string
  email: string
  cpf?: string // Campo CPF opcional
  telefone: string
  endereco: string
  created_at?: string
}

export type Categoria = {
  id: number
  nome: string
  descricao: string
  created_at?: string
}

export type Produto = {
  id: number
  nome: string
  categoria: string
  preco: number
  estoque: number
  created_at?: string
}

export type ItemVenda = {
  id?: number
  venda_id?: number
  produto: string
  quantidade: number
  preco_unitario: number
}

export type Venda = {
  id: number
  cliente: string
  data: string
  total: number
  status: string
  itens: ItemVenda[]
  created_at?: string
}

// Função para verificar se as tabelas existem
export async function checkTablesExist() {
  try {
    // Verificar se a tabela clientes existe
    const { error: clientesError } = await supabase.from("clientes").select("id").limit(1)
    const clientesExists = !clientesError

    // Verificar se a tabela produtos existe
    const { error: produtosError } = await supabase.from("produtos").select("id").limit(1)
    const produtosExists = !produtosError

    // Verificar se a tabela vendas existe
    const { error: vendasError } = await supabase.from("vendas").select("id").limit(1)
    const vendasExists = !vendasError

    // Verificar se a tabela itens_venda existe
    const { error: itensVendaError } = await supabase.from("itens_venda").select("id").limit(1)
    const itensVendaExists = !itensVendaError

    // Verificar se a tabela categorias existe
    const { error: categoriasError } = await supabase.from("categorias").select("id").limit(1)
    const categoriasExists = !categoriasError

    return {
      clientesExists,
      produtosExists,
      vendasExists,
      itensVendaExists,
      categoriasExists,
      allExist: clientesExists && produtosExists && vendasExists && itensVendaExists && categoriasExists,
    }
  } catch (error) {
    console.error("Erro ao verificar tabelas:", error)
    return {
      clientesExists: false,
      produtosExists: false,
      vendasExists: false,
      itensVendaExists: false,
      categoriasExists: false,
      allExist: false,
    }
  }
}

// Funções para clientes
export async function getClientes() {
  try {
    const { data, error } = await supabase.from("clientes").select("*").order("id", { ascending: true })

    if (error) {
      console.error("Erro ao buscar clientes:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return []
  }
}

export async function addCliente(cliente: Omit<Cliente, "id">) {
  try {
    // Remover o campo cpf se ele não existir na tabela
    const clienteData = { ...cliente }

    const { data, error } = await supabase.from("clientes").insert([clienteData]).select()

    if (error) {
      console.error("Erro ao adicionar cliente:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao adicionar cliente:", error)
    throw error
  }
}

export async function updateCliente(id: number, cliente: Partial<Cliente>) {
  try {
    // Remover o campo cpf se ele não existir na tabela
    const clienteData = { ...cliente }

    // Se o erro for relacionado ao campo cpf, remova-o e tente novamente
    const { data, error } = await supabase.from("clientes").update(clienteData).eq("id", id).select()

    if (error) {
      // Se o erro for relacionado ao campo cpf, remova-o e tente novamente
      if (error.message.includes("cpf")) {
        delete clienteData.cpf
        const { data: dataWithoutCpf, error: errorWithoutCpf } = await supabase
          .from("clientes")
          .update(clienteData)
          .eq("id", id)
          .select()

        if (errorWithoutCpf) {
          console.error("Erro ao atualizar cliente (sem CPF):", errorWithoutCpf)
          throw errorWithoutCpf
        }

        return dataWithoutCpf?.[0]
      }

      console.error("Erro ao atualizar cliente:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    throw error
  }
}

export async function deleteCliente(id: number) {
  try {
    const { error } = await supabase.from("clientes").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir cliente:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir cliente:", error)
    throw error
  }
}

// Funções para categorias
export async function getCategorias() {
  try {
    const { data, error } = await supabase.from("categorias").select("*").order("nome", { ascending: true })

    if (error) {
      console.error("Erro ao buscar categorias:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return []
  }
}

export async function addCategoria(categoria: Omit<Categoria, "id">) {
  try {
    const { data, error } = await supabase.from("categorias").insert([categoria]).select()

    if (error) {
      console.error("Erro ao adicionar categoria:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao adicionar categoria:", error)
    throw error
  }
}

export async function updateCategoria(id: number, categoria: Partial<Categoria>) {
  try {
    const { data, error } = await supabase.from("categorias").update(categoria).eq("id", id).select()

    if (error) {
      console.error("Erro ao atualizar categoria:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error)
    throw error
  }
}

export async function deleteCategoria(id: number) {
  try {
    // Verificar se a categoria está sendo usada em algum produto
    const { data: produtos, error: produtosError } = await supabase
      .from("produtos")
      .select("id")
      .eq("categoria", id.toString())
      .limit(1)

    if (produtosError) {
      console.error("Erro ao verificar uso da categoria:", produtosError)
      throw produtosError
    }

    if (produtos && produtos.length > 0) {
      throw new Error("Esta categoria não pode ser excluída porque está sendo usada em produtos.")
    }

    const { error } = await supabase.from("categorias").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir categoria:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir categoria:", error)
    throw error
  }
}

// Funções para produtos
export async function getProdutos() {
  try {
    const { data, error } = await supabase.from("produtos").select("*").order("id", { ascending: true })

    if (error) {
      console.error("Erro ao buscar produtos:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return []
  }
}

export async function getProdutoByNome(nome: string) {
  try {
    const { data, error } = await supabase.from("produtos").select("*").eq("nome", nome).single()

    if (error) {
      console.error("Erro ao buscar produto por nome:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao buscar produto por nome:", error)
    return null
  }
}

export async function addProduto(produto: Omit<Produto, "id">) {
  try {
    const { data, error } = await supabase.from("produtos").insert([produto]).select()

    if (error) {
      console.error("Erro ao adicionar produto:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao adicionar produto:", error)
    throw error
  }
}

export async function updateProduto(id: number, produto: Partial<Produto>) {
  try {
    const { data, error } = await supabase.from("produtos").update(produto).eq("id", id).select()

    if (error) {
      console.error("Erro ao atualizar produto:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    throw error
  }
}

export async function updateEstoqueProduto(nome: string, quantidade: number) {
  try {
    // Primeiro, buscar o produto pelo nome
    const produto = await getProdutoByNome(nome)

    if (!produto) {
      throw new Error(`Produto não encontrado: ${nome}`)
    }

    // Calcular novo estoque
    const novoEstoque = produto.estoque - quantidade

    if (novoEstoque < 0) {
      throw new Error(`Estoque insuficiente para o produto: ${nome}`)
    }

    // Atualizar o estoque
    const { data, error } = await supabase
      .from("produtos")
      .update({ estoque: novoEstoque })
      .eq("id", produto.id)
      .select()

    if (error) {
      console.error("Erro ao atualizar estoque do produto:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar estoque do produto:", error)
    throw error
  }
}

export async function deleteProduto(id: number) {
  try {
    const { error } = await supabase.from("produtos").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir produto:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    throw error
  }
}

// Funções para vendas
export async function getVendas() {
  try {
    const { data, error } = await supabase.from("vendas").select("*").order("id", { ascending: false })

    if (error) {
      console.error("Erro ao buscar vendas:", error)
      return []
    }

    // Para cada venda, buscar os itens
    const vendasCompletas = await Promise.all(
      data.map(async (venda) => {
        const { data: itens } = await supabase.from("itens_venda").select("*").eq("venda_id", venda.id)

        return {
          ...venda,
          itens: itens || [],
        }
      }),
    )

    return vendasCompletas
  } catch (error) {
    console.error("Erro ao buscar vendas:", error)
    return []
  }
}

export async function addVenda(venda: Omit<Venda, "id">) {
  try {
    // Verificar estoque de todos os produtos antes de prosseguir
    for (const item of venda.itens) {
      const produto = await getProdutoByNome(item.produto)
      if (!produto) {
        throw new Error(`Produto não encontrado: ${item.produto}`)
      }
      if (produto.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto: ${item.produto}. Disponível: ${produto.estoque}`)
      }
    }

    // Primeiro, inserir a venda
    const { data: vendaInserida, error } = await supabase
      .from("vendas")
      .insert([
        {
          cliente: venda.cliente,
          data: venda.data,
          total: venda.total,
          status: venda.status,
        },
      ])
      .select()

    if (error) {
      console.error("Erro ao adicionar venda:", error)
      throw error
    }

    const vendaId = vendaInserida[0].id

    // Depois, inserir os itens da venda
    const itensParaInserir = venda.itens.map((item) => ({
      venda_id: vendaId,
      produto: item.produto,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
    }))

    const { error: erroItens } = await supabase.from("itens_venda").insert(itensParaInserir)

    if (erroItens) {
      console.error("Erro ao adicionar itens da venda:", erroItens)
      throw erroItens
    }

    // Atualizar o estoque de cada produto
    for (const item of venda.itens) {
      await updateEstoqueProduto(item.produto, item.quantidade)
    }

    return {
      ...vendaInserida[0],
      itens: venda.itens,
    }
  } catch (error) {
    console.error("Erro ao adicionar venda:", error)
    throw error
  }
}

// Nova função para atualizar o status de uma venda
export async function updateVendaStatus(id: number, status: string) {
  try {
    const { data, error } = await supabase.from("vendas").update({ status }).eq("id", id).select()

    if (error) {
      console.error("Erro ao atualizar status da venda:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar status da venda:", error)
    throw error
  }
}

export async function deleteVenda(id: number) {
  try {
    // Primeiro, buscar os itens da venda para restaurar o estoque
    const { data: itens } = await supabase.from("itens_venda").select("*").eq("venda_id", id)

    if (itens && itens.length > 0) {
      // Para cada item, restaurar o estoque
      for (const item of itens) {
        const produto = await getProdutoByNome(item.produto)
        if (produto) {
          // Adicionar a quantidade de volta ao estoque
          await supabase
            .from("produtos")
            .update({ estoque: produto.estoque + item.quantidade })
            .eq("id", produto.id)
        }
      }
    }

    // Excluir os itens da venda
    const { error: erroItens } = await supabase.from("itens_venda").delete().eq("venda_id", id)

    if (erroItens) {
      console.error("Erro ao excluir itens da venda:", erroItens)
      throw erroItens
    }

    // Excluir a venda
    const { error } = await supabase.from("vendas").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir venda:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir venda:", error)
    throw error
  }
}

// Funções para dashboard
export async function getDashboardData() {
  try {
    // Buscar total de clientes
    const { count: totalClientes, error: errorClientes } = await supabase
      .from("clientes")
      .select("*", { count: "exact", head: true })

    if (errorClientes) {
      console.error("Erro ao buscar total de clientes:", errorClientes)
      throw errorClientes
    }

    // Buscar total de produtos
    const { count: totalProdutos, error: errorProdutos } = await supabase
      .from("produtos")
      .select("*", { count: "exact", head: true })

    if (errorProdutos) {
      console.error("Erro ao buscar total de produtos:", errorProdutos)
      throw errorProdutos
    }

    // Buscar vendas do mês atual
    const dataAtual = new Date()
    const mesAtual = dataAtual.getMonth() + 1
    const anoAtual = dataAtual.getFullYear()

    // Buscar vendas do mês
    const { data: vendasMes, error: errorVendasMes } = await supabase
      .from("vendas")
      .select("*")
      .like("data", `%/${mesAtual.toString().padStart(2, "0")}/${anoAtual}`)

    if (errorVendasMes) {
      console.error("Erro ao buscar vendas do mês:", errorVendasMes)
      throw errorVendasMes
    }

    // Calcular receita mensal
    const receitaMensal = vendasMes?.reduce((total, venda) => total + venda.total, 0) || 0

    // Buscar vendas recentes
    const { data: vendasRecentes, error: errorVendasRecentes } = await supabase
      .from("vendas")
      .select("*")
      .order("id", { ascending: false })
      .limit(5)

    if (errorVendasRecentes) {
      console.error("Erro ao buscar vendas recentes:", errorVendasRecentes)
      throw errorVendasRecentes
    }

    // Buscar produtos mais vendidos
    const { data: itensMaisVendidos, error: errorItensMaisVendidos } = await supabase
      .from("itens_venda")
      .select("produto, quantidade, preco_unitario")

    if (errorItensMaisVendidos) {
      console.error("Erro ao buscar itens mais vendidos:", errorItensMaisVendidos)
      throw errorItensMaisVendidos
    }

    // Agrupar itens por produto e somar quantidades
    const produtosMaisVendidos =
      itensMaisVendidos?.reduce(
        (acc, item) => {
          const produtoExistente = acc.find((p) => p.produto === item.produto)
          if (produtoExistente) {
            produtoExistente.quantidade += item.quantidade
          } else {
            acc.push({
              produto: item.produto,
              quantidade: item.quantidade,
              precoUnitario: item.preco_unitario,
            })
          }
          return acc
        },
        [] as { produto: string; quantidade: number; precoUnitario: number }[],
      ) || []

    // Ordenar por quantidade vendida (decrescente)
    produtosMaisVendidos.sort((a, b) => b.quantidade - a.quantidade)

    return {
      totalClientes: totalClientes || 0,
      totalProdutos: totalProdutos || 0,
      vendasMes: vendasMes?.length || 0,
      receitaMensal,
      vendasRecentes: vendasRecentes || [],
      produtosMaisVendidos: produtosMaisVendidos.slice(0, 5), // Top 5 produtos
    }
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error)
    throw error
  }
}
