import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

// At the top of the file, after the import statement, add this line to re-export createClient:
export { createClient } from "@supabase/supabase-js"

// Importar as funções de cache no topo do arquivo
import { getCachedData, setCachedData, clearCache } from "./cache-utils"

// Essas variáveis de ambiente já estão configuradas pelo Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para as tabelas
export type Cliente = {
  id: number
  nome: string
  email: string
  cpf?: string
  telefone: string
  endereco: string
  created_at?: string
}

// Atualizar o tipo Categoria para incluir o campo categoria_pai_id
export type Categoria = {
  id: number
  nome: string
  descricao: string
  categoria_pai_id?: number | null
  created_at?: string
}

// Adicionar o tipo Marca
export type Marca = {
  id: number
  nome: string
  created_at?: string
}

// Atualizar o tipo Produto para incluir o campo unidade_id e atualizar tipo_estoque
export type Produto = {
  id: number
  nome: string
  categoria: string
  marca: string
  preco: number
  custo: number
  estoque: number
  tipo_estoque: string // Alterado para string para aceitar "unidade" ou "tamanho"
  unidade_id?: number | null
  created_at?: string
}

// Adicionar o tipo EstoqueTamanho
export type EstoqueTamanho = {
  id: number
  produto_id: number
  tamanho: number
  quantidade: number
}

export type ItemVenda = {
  id?: number
  venda_id?: number
  produto: string
  quantidade: number
  preco_unitario: number
  tamanho?: number // Adicionar campo tamanho para itens de venda
}

// Atualizar o tipo Venda para incluir informações de pagamento
export type Venda = {
  id: number
  cliente: string
  data: string
  total: number
  status: string
  forma_pagamento?: string
  parcelas?: number
  valor_parcela?: number
  itens: ItemVenda[]
  created_at?: string
}

// ATUALIZAR O TIPO Usuario PARA INCLUIR O CAMPO "user"
export type Usuario = {
  id: number
  nome: string
  email: string
  user?: string // Nome de usuário, opcional para usuários existentes, mas idealmente único
  cargo: string
  ativo: boolean
  created_at?: string
}

// Adicionar os novos tipos após os tipos existentes
// Atualizar apenas o tipo ContaPagar
export type ContaPagar = {
  id: number
  descricao: string
  valor: number
  data_vencimento: string
  data_pagamento?: string
  status: string
  fornecedor_id?: number // Alterado de fornecedor para fornecedor_id
  observacao?: string
  created_at?: string
}

export type ContaReceber = {
  id: number
  venda_id?: number
  cliente: string
  valor: number
  data_vencimento: string
  data_recebimento?: string
  status: string
  parcela?: number
  total_parcelas?: number
  observacao?: string
  created_at?: string
}

// Adicionar o tipo Fornecedor
export type Fornecedor = {
  id: number
  cnpj: string
  razao_social: string
  nome_fantasia?: string
  inscricao_estadual?: string
  inscricao_estadual_isento: boolean
  data_nascimento?: string
  created_at?: string
}

// Adicionar tipos para Pedidos
export type Pedido = {
  id: number
  cliente_id?: number
  cliente?: string
  marca?: string
  fornecedor_id?: number
  fornecedor_nome?: string
  previsao_entrega?: string
  valor_total?: number
  desconto?: number
  forma_pagamento?: string
  parcelas?: number
  status: string
  observacoes?: string
  created_at?: string
}

export type ItemPedido = {
  id?: number
  pedido_id?: number
  produto_id: number
  produto_nome: string
  quantidade: number
  preco_unitario: number
  tamanho?: string
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

    // Verificar se a tabela usuarios existe
    const { error: usuariosError } = await supabase.from("usuarios").select("id").limit(1)
    const usuariosExists = !usuariosError

    // Verificar se a tabela fornecedores existe
    const { error: fornecedoresError } = await supabase.from("fornecedores").select("id").limit(1)
    const fornecedoresExists = !fornecedoresError

    // Verificar se a tabela estoque_tamanhos existe
    const { error: estoqueTamanhosError } = await supabase.from("estoque_tamanhos").select("id").limit(1)
    const estoqueTamanhosExists = !estoqueTamanhosError

    // Verificar se a tabela pedidos existe
    const { error: pedidosError } = await supabase.from("pedidos").select("id").limit(1)
    const pedidosExists = !pedidosError

    // Verificar se a tabela marcas existe
    const { error: marcasError } = await supabase.from("marcas").select("id").limit(1)
    const marcasExists = !marcasError

    return {
      clientesExists,
      produtosExists,
      vendasExists,
      itensVendaExists,
      categoriasExists,
      usuariosExists,
      fornecedoresExists,
      estoqueTamanhosExists,
      pedidosExists,
      marcasExists,
      allExist:
        clientesExists &&
        produtosExists &&
        vendasExists &&
        itensVendaExists &&
        categoriasExists &&
        usuariosExists &&
        fornecedoresExists &&
        estoqueTamanhosExists &&
        pedidosExists &&
        marcasExists,
    }
  } catch (error) {
    console.error("Erro ao verificar tabelas:", error)
    return {
      clientesExists: false,
      produtosExists: false,
      vendasExists: false,
      itensVendaExists: false,
      categoriasExists: false,
      usuariosExists: false,
      fornecedoresExists: false,
      estoqueTamanhosExists: false,
      pedidosExists: false,
      marcasExists: false,
      allExist: false,
    }
  }
}

// Funções para marcas
// Modificar a função getMarcas para usar cache
export async function getMarcas() {
  try {
    // Verificar se há dados em cache
    const cachedMarcas = getCachedData<Marca[]>("marcas")
    if (cachedMarcas) {
      return cachedMarcas
    }

    const { data, error } = await supabase.from("marcas").select("*").order("nome", { ascending: true })

    if (error) {
      console.error("Erro ao buscar marcas:", error)
      return []
    }

    // Armazenar em cache
    setCachedData("marcas", data || [])
    return data || []
  } catch (error) {
    console.error("Erro ao buscar marcas:", error)
    return []
  }
}

export async function addMarca(marca: Omit<Marca, "id">) {
  try {
    // Verificar se a marca já existe
    const { data: existingMarca, error: checkError } = await supabase
      .from("marcas")
      .select("id")
      .eq("nome", marca.nome)
      .single()

    if (!checkError && existingMarca) {
      throw new Error("Uma marca com este nome já existe.")
    }

    const { data, error } = await supabase.from("marcas").insert([marca]).select()

    if (error) {
      console.error("Erro ao adicionar marca:", error)
      throw error
    }

    const result = data?.[0]

    // Invalidar cache após adicionar
    invalidateCache("marcas")

    return result
  } catch (error) {
    console.error("Erro ao adicionar marca:", error)
    throw error
  }
}

export async function updateMarca(id: number, marca: Partial<Marca>) {
  try {
    // Verificar se já existe outra marca com o mesmo nome
    if (marca.nome) {
      const { data: existingMarca, error: checkError } = await supabase
        .from("marcas")
        .select("id")
        .eq("nome", marca.nome)
        .neq("id", id)
        .single()

      if (!checkError && existingMarca) {
        throw new Error("Uma marca com este nome já existe.")
      }
    }

    const { data, error } = await supabase.from("marcas").update(marca).eq("id", id).select()

    if (error) {
      console.error("Erro ao atualizar marca:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar marca:", error)
    throw error
  }
}

export async function deleteMarca(id: number) {
  try {
    // Verificar se a marca está sendo usada em algum produto
    const { data: produtos, error: produtosError } = await supabase
      .from("produtos")
      .select("id")
      .eq("marca", id.toString())
      .limit(1)

    if (produtosError) {
      console.error("Erro ao verificar uso da marca:", produtosError)
      throw produtosError
    }

    if (produtos && produtos.length > 0) {
      throw new Error("Esta marca não pode ser excluída porque está sendo usada em produtos.")
    }

    const { error } = await supabase.from("marcas").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir marca:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir marca:", error)
    throw error
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

// Modificar as funções para clientes para incluir o campo CPF corretamente

// Modificar a função addCliente para incluir o campo CPF
export async function addCliente(cliente: Omit<Cliente, "id">) {
  try {
    // Remover a linha que remove explicitamente o campo cpf
    // const { cpf, ...clienteData } = cliente as any

    const { data, error } = await supabase.from("clientes").insert([cliente]).select()

    if (error) {
      console.error("Erro ao adicionar cliente:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao adicionar cliente:", error)
    return []
  }
}

// Modificar a função updateCliente para incluir o campo CPF
export async function updateCliente(id: number, cliente: Partial<Cliente>) {
  try {
    // Remover a linha que remove explicitamente o campo cpf
    // const { cpf, ...clienteData } = cliente as any

    const { data, error } = await supabase.from("clientes").update(cliente).eq("id", id).select()

    if (error) {
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
// Modificar a função getCategorias para usar cache
export async function getCategorias() {
  try {
    // Verificar se há dados em cache
    const cachedCategorias = getCachedData<Categoria[]>("categorias")
    if (cachedCategorias) {
      return cachedCategorias
    }

    const { data, error } = await supabase.from("categorias").select("*").order("nome", { ascending: true })

    if (error) {
      console.error("Erro ao buscar categorias:", error)
      return []
    }

    // Armazenar em cache
    setCachedData("categorias", data || [])
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
    return []
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
// Modificar a função getProdutos para incluir paginação e cache
export async function getProdutos(options?: { page?: number; limit?: number; search?: string }) {
  try {
    const cacheKey = `produtos_${JSON.stringify(options || {})}`
    const cachedProdutos = getCachedData<Produto[]>(cacheKey)

    if (cachedProdutos) {
      return cachedProdutos
    }

    let query = supabase.from("produtos").select("*")

    // Adicionar busca se fornecida
    if (options?.search) {
      query = query.or(`nome.ilike.%${options.search}%,categoria.ilike.%${options.search}%`)
    }

    // Adicionar ordenação
    query = query.order("id", { ascending: true })

    // Adicionar paginação se fornecida
    if (options?.page && options?.limit) {
      const from = (options.page - 1) * options.limit
      const to = from + options.limit - 1
      query = query.range(from, to)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erro ao buscar produtos:", error)
      return []
    }

    // Armazenar em cache
    setCachedData(cacheKey, data || [])
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

export async function getProdutoById(id: number) {
  try {
    const { data, error } = await supabase.from("produtos").select("*").eq("id", id).single()

    if (error) {
      console.error("Erro ao buscar produto por ID:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error)
    return null
  }
}

// Adicionar função para buscar estoque por tamanho
export async function getEstoqueTamanhos(produtoId: number) {
  try {
    const { data, error } = await supabase
      .from("estoque_tamanhos")
      .select("*")
      .eq("produto_id", produtoId)
      .order("tamanho", { ascending: true })

    if (error) {
      console.error("Erro ao buscar estoque por tamanho:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar estoque por tamanho:", error)
    return []
  }
}

// Atualizar a função addProduto para lidar com o campo unidade_id
export async function addProduto(
  produto: Omit<Produto, "id">,
  estoqueTamanhos?: { tamanho: number; quantidade: number }[],
) {
  try {
    // Remover campos que possam causar problemas
    const { unidade_id, ...produtoSemUnidadeId } = produto as any

    // Inserir o produto
    const { data, error } = await supabase.from("produtos").insert([produtoSemUnidadeId]).select()

    if (error) {
      console.error("Erro ao adicionar produto:", error)
      throw error
    }

    const novoProduto = data?.[0]

    // Se for produto com tamanhos, inserir os registros de estoque por tamanho
    if (novoProduto && produto.tipo_estoque === "tamanho" && estoqueTamanhos && estoqueTamanhos.length > 0) {
      const estoquesParaInserir = estoqueTamanhos.map((et) => ({
        produto_id: novoProduto.id,
        tamanho: et.tamanho,
        quantidade: et.quantidade,
      }))

      const { error: erroEstoque } = await supabase.from("estoque_tamanhos").insert(estoquesParaInserir)

      if (erroEstoque) {
        console.error("Erro ao adicionar estoque por tamanho:", erroEstoque)
        throw erroEstoque
      }
    }

    return novoProduto
  } catch (error) {
    console.error("Erro ao adicionar produto:", error)
    throw error
  }
}

// Atualizar a função updateProduto para lidar com o campo unidade_id
export async function updateProduto(
  id: number,
  produto: Partial<Produto>,
  estoqueTamanhos?: { tamanho: number; quantidade: number }[],
) {
  try {
    // Remover campos que possam causar problemas
    const { unidade_id, ...produtoSemUnidadeId } = produto as any

    // Atualizar o produto
    const { data, error } = await supabase.from("produtos").update(produtoSemUnidadeId).eq("id", id).select()

    if (error) {
      console.error("Erro ao atualizar produto:", error)
      throw error
    }

    const produtoAtualizado = data?.[0]

    // Se for produto com tamanhos, atualizar os registros de estoque por tamanho
    if (produtoAtualizado && produto.tipo_estoque === "tamanho" && estoqueTamanhos && estoqueTamanhos.length > 0) {
      // Primeiro, excluir os registros existentes
      const { error: erroExclusao } = await supabase.from("estoque_tamanhos").delete().eq("produto_id", id)

      if (erroExclusao) {
        console.error("Erro ao excluir estoque por tamanho existente:", erroExclusao)
        throw erroExclusao
      }

      // Depois, inserir os novos registros
      const estoquesParaInserir = estoqueTamanhos.map((et) => ({
        produto_id: id,
        tamanho: et.tamanho,
        quantidade: et.quantidade,
      }))

      const { error: erroInsercao } = await supabase.from("estoque_tamanhos").insert(estoquesParaInserir)

      if (erroInsercao) {
        console.error("Erro ao adicionar estoque por tamanho:", erroInsercao)
        throw erroInsercao
      }
    } else if (produtoAtualizado && produto.tipo_estoque === "unidade") {
      // Se o produto foi alterado para unidade, excluir os registros de estoque por tamanho
      const { error: erroExclusao } = await supabase.from("estoque_tamanhos").delete().eq("produto_id", id)

      if (erroExclusao) {
        console.error("Erro ao excluir estoque por tamanho existente:", erroExclusao)
        throw erroExclusao
      }
    }

    return produtoAtualizado
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    throw error
  }
}

// Atualizar a função updateEstoqueProduto para lidar com estoque por tamanho
export async function updateEstoqueProduto(nome: string, quantidade: number, tamanho?: number) {
  try {
    // Primeiro, buscar o produto pelo nome
    const produto = await getProdutoByNome(nome)

    if (!produto) {
      throw new Error(`Produto não encontrado: ${nome}`)
    }

    // Se o produto for do tipo "par" e um tamanho foi especificado
    if (produto.tipo_estoque === "par" && tamanho !== undefined) {
      // Buscar o estoque do tamanho específico
      const { data: estoqueTamanho } = await supabase
        .from("estoque_tamanhos")
        .select("*")
        .eq("produto_id", produto.id)
        .eq("tamanho", tamanho)
        .single()

      if (!estoqueTamanho) {
        throw new Error(`Tamanho ${tamanho} não encontrado para o produto: ${nome}`)
      }

      // Calcular novo estoque
      const novoEstoque = estoqueTamanho.quantidade - quantidade

      if (novoEstoque < 0) {
        throw new Error(`Estoque insuficiente para o produto: ${nome}, tamanho: ${tamanho}`)
      }

      // Atualizar o estoque do tamanho
      const { error: erroAtualizacao } = await supabase
        .from("estoque_tamanhos")
        .update({ quantidade: novoEstoque })
        .eq("id", estoqueTamanho.id)

      if (erroAtualizacao) {
        console.error("Erro ao atualizar estoque do tamanho:", erroAtualizacao)
        throw erroAtualizacao
      }

      // Atualizar o estoque total do produto
      const { data: estoquesTamanho } = await supabase
        .from("estoque_tamanhos")
        .select("quantidade")
        .eq("produto_id", produto.id)

      const estoqueTotal = estoquesTamanho?.reduce((total, et) => total + et.quantidade, 0) || 0

      const { data, error } = await supabase
        .from("produtos")
        .update({ estoque: estoqueTotal })
        .eq("id", produto.id)
        .select()

      if (error) {
        console.error("Erro ao atualizar estoque total do produto:", error)
        throw error
      }

      return data?.[0]
    } else {
      // Para produtos do tipo "unidade", usar a lógica original
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
    }
  } catch (error) {
    console.error("Erro ao atualizar estoque do produto:", error)
    throw error
  }
}

export async function deleteProduto(id: number) {
  try {
    // Primeiro, excluir os registros de estoque por tamanho (se existirem)
    const { error: erroEstoque } = await supabase.from("estoque_tamanhos").delete().eq("produto_id", id)

    if (erroEstoque) {
      console.error("Erro ao excluir estoque por tamanho:", erroEstoque)
      throw erroEstoque
    }

    // Depois, excluir o produto
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

// Atualizar a função addVenda para incluir as informações de pagamento
export async function addVenda(venda: Omit<Venda, "id">) {
  try {
    // Verificar estoque de todos os produtos antes de prosseguir
    for (const item of venda.itens) {
      const produto = await getProdutoByNome(item.produto)
      if (!produto) {
        throw new Error(`Produto não encontrado: ${item.produto}`)
      }

      // Verificar estoque com base no tipo do produto
      if (produto.tipo_estoque === "par" && item.tamanho !== undefined) {
        // Buscar o estoque do tamanho específico
        const { data: estoqueTamanho } = await supabase
          .from("estoque_tamanhos")
          .select("*")
          .eq("produto_id", produto.id)
          .eq("tamanho", item.tamanho)
          .single()

        if (!estoqueTamanho) {
          throw new Error(`Tamanho ${item.tamanho} não encontrado para o produto: ${item.produto}`)
        }

        if (estoqueTamanho.quantidade < item.quantidade) {
          throw new Error(
            `Estoque insuficiente para o produto: ${item.produto}, tamanho: ${item.tamanho}. Disponível: ${estoqueTamanho.quantidade}`,
          )
        }
      } else {
        // Verificação padrão para produtos do tipo "unidade"
        if (produto.estoque < item.quantidade) {
          throw new Error(`Estoque insuficiente para o produto: ${item.produto}. Disponível: ${produto.estoque}`)
        }
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
          forma_pagamento: venda.forma_pagamento,
          parcelas: venda.parcelas,
          valor_parcela: venda.valor_parcela,
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
      tamanho: item.tamanho, // Incluir o tamanho, se houver
    }))

    const { error: erroItens } = await supabase.from("itens_venda").insert(itensParaInserir)

    if (erroItens) {
      console.error("Erro ao adicionar itens da venda:", erroItens)
      throw erroItens
    }

    // Atualizar o estoque de cada produto
    for (const item of venda.itens) {
      await updateEstoqueProduto(item.produto, item.quantidade, item.tamanho)
    }

    // Se a venda for a prazo, criar as contas a receber
    if (venda.forma_pagamento === "A Prazo" && venda.parcelas && venda.parcelas > 0) {
      const valorParcela = venda.valor_parcela || venda.total / venda.parcelas
      const dataAtual = new Date()

      // Criar uma conta a receber para cada parcela
      for (let i = 1; i <= venda.parcelas; i++) {
        // Calcular a data de vencimento (30 dias * número da parcela)
        const dataVencimento = new Date(dataAtual)
        dataVencimento.setDate(dataVencimento.getDate() + 30 * i)

        // Formatar a data para o formato YYYY-MM-DD
        const dataFormatada = dataVencimento.toISOString().split("T")[0]

        // Criar a conta a receber
        await addContaReceber({
          venda_id: vendaId,
          cliente: venda.cliente,
          valor: valorParcela,
          data_vencimento: dataFormatada,
          status: "Pendente",
          parcela: i,
          total_parcelas: venda.parcelas,
          observacao: `Parcela ${i}/${venda.parcelas} da venda #${vendaId}`,
        })
      }
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

// Localizar a função updateVendaStatus e modificá-la para tratar as contas a receber quando uma venda for cancelada

// Substituir a função updateVendaStatus atual por esta versão atualizada:
export async function updateVendaStatus(id: number, status: string) {
  try {
    // Verificar se o status está sendo alterado para "Cancelada"
    if (status === "Cancelada") {
      // Buscar o status atual da venda
      const { data: vendaAtual } = await supabase.from("vendas").select("status").eq("id", id).single()

      // Só restaurar o estoque se o status atual não for "Cancelada"
      if (vendaAtual && vendaAtual.status !== "Cancelada") {
        // Buscar os itens da venda
        const { data: itens } = await supabase.from("itens_venda").select("*").eq("venda_id", id)

        if (itens && itens.length > 0) {
          // Para cada item, restaurar o estoque
          for (const item of itens) {
            const produto = await getProdutoByNome(item.produto)
            if (produto) {
              if (produto.tipo_estoque === "par" && item.tamanho !== undefined) {
                // Restaurar estoque do tamanho específico
                const { data: estoqueTamanho } = await supabase
                  .from("estoque_tamanhos")
                  .select("*")
                  .eq("produto_id", produto.id)
                  .eq("tamanho", item.tamanho)
                  .single()

                if (estoqueTamanho) {
                  // Atualizar o estoque do tamanho
                  await supabase
                    .from("estoque_tamanhos")
                    .update({ quantidade: estoqueTamanho.quantidade + item.quantidade })
                    .eq("id", estoqueTamanho.id)

                  // Atualizar o estoque total do produto
                  const { data: estoquesTamanho } = await supabase
                    .from("estoque_tamanhos")
                    .select("quantidade")
                    .eq("produto_id", produto.id)

                  const estoqueTotal = estoquesTamanho?.reduce((total, et) => total + et.quantidade, 0) || 0

                  await supabase.from("produtos").update({ estoque: estoqueTotal }).eq("id", produto.id)
                }
              } else {
                // Restaurar estoque para produtos do tipo "unidade"
                await supabase
                  .from("produtos")
                  .update({ estoque: produto.estoque + item.quantidade })
                  .eq("id", produto.id)
              }
            }
          }
        }

        // Buscar todas as contas a receber associadas a esta venda
        const { data: contasReceber } = await supabase.from("contas_receber").select("*").eq("venda_id", id)

        if (contasReceber && contasReceber.length > 0) {
          // Para cada conta a receber, cancelá-la (excluir ou marcar como cancelada)
          for (const conta of contasReceber) {
            // Opção 1: Excluir a conta a receber
            // await supabase.from("contas_receber").delete().eq("id", conta.id)

            // Opção 2: Marcar a conta como cancelada (preferível para manter histórico)
            await supabase
              .from("contas_receber")
              .update({
                status: "Cancelado",
                observacao: conta.observacao ? `${conta.observacao} - Venda cancelada` : "Venda cancelada",
              })
              .eq("id", conta.id)
          }
        }
      }
    }

    // Atualizar o status da venda
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
          if (produto.tipo_estoque === "par" && item.tamanho !== undefined) {
            // Restaurar estoque do tamanho específico
            const { data: estoqueTamanho } = await supabase
              .from("estoque_tamanhos")
              .select("*")
              .eq("produto_id", produto.id)
              .eq("tamanho", item.tamanho)
              .single()

            if (estoqueTamanho) {
              // Atualizar o estoque do tamanho
              await supabase
                .from("estoque_tamanhos")
                .update({ quantidade: estoqueTamanho.quantidade + item.quantidade })
                .eq("id", estoqueTamanho.id)

              // Atualizar o estoque total do produto
              const { data: estoquesTamanho } = await supabase
                .from("estoque_tamanhos")
                .select("quantidade")
                .eq("produto_id", produto.id)

              const estoqueTotal = estoquesTamanho?.reduce((total, et) => total + et.quantidade, 0) || 0

              await supabase.from("produtos").update({ estoque: estoqueTotal }).eq("id", produto.id)
            }
          } else {
            // Restaurar estoque para produtos do tipo "unidade"
            await supabase
              .from("produtos")
              .update({ estoque: produto.estoque + item.quantidade })
              .eq("id", produto.id)
          }
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
// Localizar a função getDashboardData() e substituí-la pela versão atualizada abaixo:

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

    // Buscar vendas do mês (excluindo canceladas)
    const { data: vendasMes, error: errorVendasMes } = await supabase
      .from("vendas")
      .select("*")
      .like("data", `%/${mesAtual.toString().padStart(2, "0")}/${anoAtual}`)
      .neq("status", "Cancelada") // Excluir vendas canceladas

    if (errorVendasMes) {
      console.error("Erro ao buscar vendas do mês:", errorVendasMes)
      throw errorVendasMes
    }

    // Calcular receita mensal (apenas de vendas não canceladas)
    const receitaMensal = vendasMes?.reduce((total, venda) => total + venda.total, 0) || 0

    // Buscar vendas recentes (excluindo canceladas)
    const { data: vendasRecentes, error: errorVendasRecentes } = await supabase
      .from("vendas")
      .select("*")
      .neq("status", "Cancelada") // Excluir vendas canceladas
      .order("id", { ascending: false })
      .limit(5)

    if (errorVendasRecentes) {
      console.error("Erro ao buscar vendas recentes:", errorVendasRecentes)
      throw errorVendasRecentes
    }

    // Buscar vendas dos últimos 7 dias para o gráfico
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - 30) // Últimos 30 dias

    const { data: vendasGrafico, error: errorVendasGrafico } = await supabase
      .from("vendas")
      .select("data, total")
      .neq("status", "Cancelada")
      .order("data", { ascending: true })
      .limit(30)

    if (errorVendasGrafico) {
      console.error("Erro ao buscar vendas para o gráfico:", errorVendasGrafico)
      throw errorVendasGrafico
    }

    // Agrupar vendas por data para o gráfico
    const vendasPorData = vendasGrafico?.reduce(
      (acc, venda) => {
        const data = venda.data
        if (!acc[data]) {
          acc[data] = 0
        }
        acc[data] += venda.total
        return acc
      },
      {} as Record<string, number>,
    )

    // Converter para o formato esperado pelo gráfico
    const dadosGrafico = Object.entries(vendasPorData || {}).map(([data, total]) => ({
      data,
      total,
    }))

    // Buscar itens de vendas não canceladas para calcular produtos mais vendidos
    // Primeiro, buscar todas as vendas não canceladas
    const { data: vendasNaoCanceladas, error: errorVendasNaoCanceladas } = await supabase
      .from("vendas")
      .select("id")
      .neq("status", "Cancelada")

    if (errorVendasNaoCanceladas) {
      console.error("Erro ao buscar vendas não canceladas:", errorVendasNaoCanceladas)
      throw errorVendasNaoCanceladas
    }

    // Extrair os IDs das vendas não canceladas
    const idsVendasNaoCanceladas = vendasNaoCanceladas?.map((venda) => venda.id) || []

    // Buscar itens apenas das vendas não canceladas
    const { data: itensMaisVendidos, error: errorItensMaisVendidos } = await supabase
      .from("itens_venda")
      .select("produto, quantidade, preco_unitario, venda_id")
      .in("venda_id", idsVendasNaoCanceladas.length > 0 ? idsVendasNaoCanceladas : [0]) // Se não houver vendas, usar [0] para não dar erro

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

    // Novos Clientes (no mês atual)
    const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).toISOString().split("T")[0]
    const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).toISOString().split("T")[0]

    const { count: novosClientesMes, error: errorNovosClientes } = await supabase
      .from("clientes")
      .select("*", { count: "exact", head: true })
      .gte("created_at", primeiroDiaMes)
      .lte("created_at", ultimoDiaMes)

    if (errorNovosClientes) {
      console.error("Erro ao buscar novos clientes do mês:", errorNovosClientes)
      // Considere um tratamento de erro mais robusto ou um valor padrão
    }

    // Produtos em Baixo Estoque (ex: < 10 unidades)
    const LIMITE_BAIXO_ESTOQUE = 10
    const { count: produtosBaixoEstoqueCount, error: errorBaixoEstoque } = await supabase
      .from("produtos")
      .select("id", { count: "exact", head: true }) // Apenas o ID é necessário para contagem
      .lt("estoque", LIMITE_BAIXO_ESTOQUE)

    if (errorBaixoEstoque) {
      console.error("Erro ao buscar produtos em baixo estoque:", errorBaixoEstoque)
      // Considere um tratamento de erro mais robusto ou um valor padrão
    }

    return {
      totalClientes: totalClientes || 0,
      totalProdutos: totalProdutos || 0,
      vendasMes: vendasMes?.length || 0,
      receitaMensal,
      vendasRecentes: vendasRecentes || [],
      produtosMaisVendidos: produtosMaisVendidos.slice(0, 5), // Top 5 produtos
      dadosGrafico,
      novosClientesMes: novosClientesMes || 0, // Adicionado
      produtosBaixoEstoqueCount: produtosBaixoEstoqueCount || 0, // Adicionado
    }
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error)
    throw error
  }
}

// Funções para usuários
// ATUALIZAR getUsuarios PARA INCLUIR O CAMPO "user"
export async function getUsuarios() {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nome, email, user, cargo, ativo, created_at") // Adicionado "user"
      .order("id", { ascending: true })

    if (error) {
      console.error("Erro ao buscar usuários:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return []
  }
}

// ATUALIZAR addUsuario PARA INCLUIR O CAMPO "user" E VERIFICAR UNICIDADE
export async function addUsuario(usuario: {
  nome: string
  email: string
  user?: string
  senha: string
  cargo: string
}) {
  try {
    // Verificar se o email já existe
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", usuario.email)
      .single()

    if (emailCheckError && emailCheckError.code !== "PGRST116") {
      // PGRST116: "Query returned no rows" - o que é bom neste caso
      console.error("Erro ao verificar email existente:", emailCheckError)
      throw emailCheckError
    }
    if (existingEmail) {
      throw new Error("Este email já está em uso.")
    }

    // Verificar se o nome de usuário (user) já existe, se fornecido
    if (usuario.user) {
      const { data: existingUser, error: userCheckError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("user", usuario.user)
        .single()

      if (userCheckError && userCheckError.code !== "PGRST116") {
        console.error("Erro ao verificar nome de usuário existente:", userCheckError)
        throw userCheckError
      }
      if (existingUser) {
        throw new Error("Este nome de usuário já está em uso.")
      }
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash(usuario.senha, salt)

    const { data, error } = await supabase
      .from("usuarios")
      .insert([
        {
          nome: usuario.nome,
          email: usuario.email,
          user: usuario.user || null, // Salvar null se não fornecido
          senha: senhaHash,
          cargo: usuario.cargo,
          ativo: true,
        },
      ])
      .select("id, nome, email, user, cargo, ativo, created_at") // Adicionado "user"

    if (error) {
      console.error("Erro ao adicionar usuário:", error)
      // Verificar se o erro é de unicidade do campo 'user' (se você adicionou a constraint no DB)
      if (error.message.includes('duplicate key value violates unique constraint "usuarios_user_key"')) {
        throw new Error("Este nome de usuário já está em uso.")
      }
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao adicionar usuário:", error)
    throw error // Re-throw para ser pego pelo formulário
  }
}

// ATUALIZAR updateUsuario PARA INCLUIR O CAMPO "user" E VERIFICAR UNICIDADE
export async function updateUsuario(
  id: number,
  usuario: { nome?: string; email?: string; user?: string; senha?: string; cargo?: string; ativo?: boolean },
) {
  try {
    const updateData: any = { ...usuario }

    // Se a senha foi fornecida, fazer o hash
    if (usuario.senha) {
      const salt = await bcrypt.genSalt(10)
      updateData.senha = await bcrypt.hash(usuario.senha, salt)
    } else {
      delete updateData.senha // Não atualizar a senha se não for fornecida
    }

    // Verificar se o email já existe para outro usuário
    if (usuario.email) {
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", usuario.email)
        .neq("id", id) // Excluir o usuário atual da verificação
        .single()

      if (emailCheckError && emailCheckError.code !== "PGRST116") {
        console.error("Erro ao verificar email existente:", emailCheckError)
        throw emailCheckError
      }
      if (existingEmail) {
        throw new Error("Este email já está em uso por outro usuário.")
      }
    }

    // Verificar se o nome de usuário (user) já existe para outro usuário, se fornecido
    if (usuario.user) {
      const { data: existingUser, error: userCheckError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("user", usuario.user)
        .neq("id", id) // Excluir o usuário atual da verificação
        .single()

      if (userCheckError && userCheckError.code !== "PGRST116") {
        console.error("Erro ao verificar nome de usuário existente:", userCheckError)
        throw userCheckError
      }
      if (existingUser) {
        throw new Error("Este nome de usuário já está em uso por outro usuário.")
      }
    }

    const { data, error } = await supabase
      .from("usuarios")
      .update(updateData)
      .eq("id", id)
      .select("id, nome, email, user, cargo, ativo, created_at") // Adicionado "user"

    if (error) {
      console.error("Erro ao atualizar usuário:", error)
      if (error.message.includes('duplicate key value violates unique constraint "usuarios_user_key"')) {
        throw new Error("Este nome de usuário já está em uso.")
      }
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    throw error // Re-throw para ser pego pelo formulário
  }
}

export async function deleteUsuario(id: number) {
  try {
    const { error } = await supabase.from("usuarios").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir usuário:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir usuário:", error)
    throw error
  }
}

// ATUALIZAR loginUsuario PARA PERMITIR LOGIN COM "email" OU "user"
export async function loginUsuario(identifier: string, senha: string) {
  try {
    // Buscar o usuário pelo email OU pelo nome de usuário (user)
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .or(`email.eq.${identifier},user.eq.${identifier}`) // Modificado para buscar por email OU user
      .single() // Espera-se um único resultado

    if (error) {
      // Se o erro for PGRST116, significa que nenhum usuário foi encontrado com o identificador
      if (error.code === "PGRST116") {
        throw new Error("Usuário não encontrado.")
      }
      console.error("Erro ao buscar usuário:", error)
      throw new Error("Erro ao buscar usuário.") // Erro genérico para outros problemas
    }

    if (!data) {
      throw new Error("Usuário não encontrado.")
    }

    // Verificar se o usuário está ativo
    if (!data.ativo) {
      throw new Error("Usuário inativo.")
    }

    // Verificar a senha
    // Para o usuário felipe@sistema.com ou user "felipe", aceitar a senha diretamente
    let senhaCorreta = false
    if ((data.email === "felipe@sistema.com" || data.user === "felipe") && senha === "1305") {
      senhaCorreta = true
    } else {
      // Para outros usuários, verificar com bcrypt
      // Certifique-se de que data.senha não é null ou undefined antes de passar para bcrypt.compare
      if (!data.senha) {
        throw new Error("Configuração de senha inválida para este usuário.")
      }
      senhaCorreta = await bcrypt.compare(senha, data.senha)
    }

    if (!senhaCorreta) {
      throw new Error("Senha incorreta.")
    }

    // Retornar o usuário sem a senha
    const { senha: _, ...usuarioSemSenha } = data
    return usuarioSemSenha
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    throw error // Re-throw para ser pego pelo auth-context
  }
}

// Adicionar as funções para contas a pagar após as funções existentes
export async function getContasPagar(filtroData?: { inicio?: string; fim?: string }) {
  try {
    let query = supabase.from("contas_pagar").select("*").order("data_vencimento", { ascending: true })

    if (filtroData?.inicio) {
      query = query.gte("data_vencimento", filtroData.inicio)
    }
    if (filtroData?.fim) {
      query = query.lte("data_vencimento", filtroData.fim)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erro ao buscar contas a pagar:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar contas a pagar:", error)
    return []
  }
}

export async function addContaPagar(conta: Omit<ContaPagar, "id">) {
  try {
    const { data, error } = await supabase.from("contas_pagar").insert([conta]).select()

    if (error) {
      console.error("Erro ao adicionar conta a pagar:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao adicionar conta a pagar:", error)
    throw error
  }
}

export async function updateContaPagar(id: number, conta: Partial<ContaPagar>) {
  try {
    const { data, error } = await supabase.from("contas_pagar").update(conta).eq("id", id).select()

    if (error) {
      console.error("Erro ao atualizar conta a pagar:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar conta a pagar:", error)
    throw error
  }
}

export async function deleteContaPagar(id: number) {
  try {
    const { error } = await supabase.from("contas_pagar").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir conta a pagar:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir conta a pagar:", error)
    throw error
  }
}

// Adicionar as funções para contas a receber
export async function getContasReceber(filtroData?: { inicio?: string; fim?: string }) {
  try {
    let query = supabase.from("contas_receber").select("*").order("data_vencimento", { ascending: true })

    if (filtroData?.inicio) {
      query = query.gte("data_vencimento", filtroData.inicio)
    }
    if (filtroData?.fim) {
      query = query.lte("data_vencimento", filtroData.fim)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erro ao buscar contas a receber:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar contas a receber:", error)
    return []
  }
}

export async function addContaReceber(conta: Omit<ContaReceber, "id">) {
  try {
    const { data, error } = await supabase.from("contas_receber").insert([conta]).select()

    if (error) {
      console.error("Erro ao adicionar conta a receber:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao adicionar conta a receber:", error)
    throw error
  }
}

export async function updateContaReceber(id: number, conta: Partial<ContaReceber>) {
  try {
    const { data, error } = await supabase.from("contas_receber").update(conta).eq("id", id).select()

    if (error) {
      console.error("Erro ao atualizar conta a receber:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar conta a receber:", error)
    throw error
  }
}

export async function deleteContaReceber(id: number) {
  try {
    const { error } = await supabase.from("contas_receber").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir conta a receber:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir conta a receber:", error)
    throw error
  }
}

// Funções para fornecedores
// Modificar a função getFornecedores para usar cache
export async function getFornecedores() {
  try {
    // Verificar se há dados em cache
    const cachedFornecedores = getCachedData<Fornecedor[]>("fornecedores")
    if (cachedFornecedores) {
      return cachedFornecedores
    }

    const { data, error } = await supabase.from("fornecedores").select("*").order("razao_social", { ascending: true })

    if (error) {
      console.error("Erro ao buscar fornecedores:", error)
      return []
    }

    // Armazenar em cache
    setCachedData("fornecedores", data || [])
    return data || []
  } catch (error) {
    console.error("Erro ao buscar fornecedores:", error)
    return []
  }
}

export async function addFornecedor(fornecedor: Omit<Fornecedor, "id">) {
  try {
    const { data, error } = await supabase.from("fornecedores").insert([fornecedor]).select()

    if (error) {
      console.error("Erro ao adicionar fornecedor:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao adicionar fornecedor:", error)
    throw error
  }
}

export async function updateFornecedor(id: number, fornecedor: Partial<Fornecedor>) {
  try {
    const { data, error } = await supabase.from("fornecedores").update(fornecedor).eq("id", id).select()

    if (error) {
      console.error("Erro ao atualizar fornecedor:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar fornecedor:", error)
    throw error
  }
}

export async function deleteFornecedor(id: number) {
  try {
    // Verificar se o fornecedor está sendo usado em contas a pagar
    const { data: contas, error: contasError } = await supabase
      .from("contas_pagar")
      .select("id")
      .eq("fornecedor_id", id) // Alterado para fornecedor_id
      .limit(1)

    if (contasError) {
      console.error("Erro ao verificar uso do fornecedor:", contasError)
      throw contasError
    }

    if (contas && contas.length > 0) {
      throw new Error("Este fornecedor não pode ser excluído porque está sendo usado em contas a pagar.")
    }

    const { error } = await supabase.from("fornecedores").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir fornecedor:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir fornecedor:", error)
    throw error
  }
}

// Funções para pedidos
export async function getPedidos() {
  try {
    const { data, error } = await supabase.from("pedidos").select("*").order("id", { ascending: false })

    if (error) {
      console.error("Erro ao buscar pedidos:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error)
    return []
  }
}

export async function getPedidoById(id: number) {
  try {
    const { data, error } = await supabase.from("pedidos").select("*").eq("id", id).single()

    if (error) {
      console.error("Erro ao buscar pedido por ID:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao buscar pedido por ID:", error)
    return null
  }
}

export async function getProdutosPedido(pedidoId: number) {
  try {
    const { data, error } = await supabase.from("itens_pedido").select("*").eq("pedido_id", pedidoId)

    if (error) {
      console.error("Erro ao buscar produtos do pedido:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar produtos do pedido:", error)
    return []
  }
}

export async function createPedido(pedidoData: {
  cliente_id?: string
  cliente?: string
  marca?: string
  fornecedor_id?: string
  fornecedor_nome?: string
  previsao_entrega?: string
  valor_total?: number
  desconto?: number
  forma_pagamento?: string
  parcelas?: number
  observacoes?: string
  status: string
  itens?: { produto_id: string; quantidade: number; tamanho?: string; preco_unitario: number }[]
}) {
  try {
    // Inserir o pedido
    const { data: pedidoInserido, error } = await supabase
      .from("pedidos")
      .insert([
        {
          cliente_id: pedidoData.cliente_id ? Number.parseInt(pedidoData.cliente_id) : null,
          cliente: pedidoData.cliente || null,
          marca: pedidoData.marca || null,
          fornecedor_id: pedidoData.fornecedor_id ? Number.parseInt(pedidoData.fornecedor_id) : null,
          previsao_entrega: pedidoData.previsao_entrega || null,
          valor_total: pedidoData.valor_total || 0,
          desconto: pedidoData.desconto || 0,
          forma_pagamento: pedidoData.forma_pagamento || null,
          parcelas: pedidoData.parcelas || 1,
          status: pedidoData.status,
          observacoes: pedidoData.observacoes || null,
        },
      ])
      .select()

    if (error) {
      console.error("Erro ao criar pedido:", error)
      throw error
    }

    const pedidoId = pedidoInserido[0].id

    // Processar os itens do pedido (se houver)
    if (pedidoData.itens && pedidoData.itens.length > 0) {
      const itensProcessados = await Promise.all(
        pedidoData.itens.map(async (item) => {
          const produtoId = Number.parseInt(item.produto_id)
          const produto = await getProdutoById(produtoId)
          return {
            pedido_id: pedidoId,
            produto_id: produtoId,
            produto_nome: produto?.nome || "Produto não encontrado",
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            tamanho: item.tamanho,
          }
        }),
      )

      // Inserir os itens do pedido
      const { error: erroItens } = await supabase.from("itens_pedido").insert(itensProcessados)

      if (erroItens) {
        console.error("Erro ao adicionar itens do pedido:", erroItens)
        // Remover o pedido se houver erro ao adicionar os itens
        await supabase.from("pedidos").delete().eq("id", pedidoId)
        throw erroItens
      }
    }

    return pedidoId
  } catch (error) {
    console.error("Erro ao criar pedido:", error)
    throw error
  }
}

export async function updatePedidoStatus(id: number, status: string) {
  try {
    const { data, error } = await supabase.from("pedidos").update({ status }).eq("id", id).select()

    if (error) {
      console.error("Erro ao atualizar status do pedido:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error)
    throw error
  }
}

export async function deletePedido(id: number) {
  try {
    // Primeiro, excluir os itens do pedido
    const { error: erroItens } = await supabase.from("itens_pedido").delete().eq("pedido_id", id)

    if (erroItens) {
      console.error("Erro ao excluir itens do pedido:", erroItens)
      throw erroItens
    }

    // Depois, excluir o pedido
    const { error } = await supabase.from("pedidos").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir pedido:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir pedido:", error)
    throw error
  }
}

// Adicionar função para limpar o cache quando houver modificações
export function invalidateCache(entity: string) {
  clearCache(entity)
}

// Modificar as funções de adição/atualização/exclusão para invalidar o cache
// Fazer o mesmo para updateMarca, deleteMarca, etc.
