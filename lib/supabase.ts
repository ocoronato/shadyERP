import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

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

// Atualizar o tipo Produto para incluir o campo tipo_estoque
export type Produto = {
  id: number
  nome: string
  categoria: string
  preco: number
  estoque: number
  tipo_estoque: "unidade" | "par"
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

export type Usuario = {
  id: number
  nome: string
  email: string
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
  fornecedor?: string // Alterado de fornecedor_id para fornecedor
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

// Adicionar os novos tipos após os tipos existentes
// Adicionar após o tipo Fornecedor

// Adicionar os tipos para pedidos
export type Pedido = {
  id: number
  fornecedor_id: number
  descricao: string
  data_pedido: string
  status: "Pendente" | "Recebido" | "Cancelado"
  nota_fiscal?: string
  total: number
  parcelas: number
  created_at?: string
}

export type ItemPedido = {
  id?: number
  pedido_id?: number
  nome: string
  tipo_estoque: "unidade" | "par"
  quantidade: number
  preco_unitario: number
  categoria: string
  tamanhos?: { tamanho: number; quantidade: number }[] // Adicionado campo tamanhos
  created_at?: string
}

export type ParcelaPedido = {
  id?: number
  pedido_id?: number
  numero_parcela: number
  data_vencimento: string
  valor: number
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

    return {
      clientesExists,
      produtosExists,
      vendasExists,
      itensVendaExists,
      categoriasExists,
      usuariosExists,
      fornecedoresExists,
      estoqueTamanhosExists,
      allExist:
        clientesExists &&
        produtosExists &&
        vendasExists &&
        itensVendaExists &&
        categoriasExists &&
        usuariosExists &&
        fornecedoresExists &&
        estoqueTamanhosExists,
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
    throw error
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

// Adicionar função para buscar estoque por tamanho
export async function getEstoqueTamanhos(produtoId: number) {
  try {
    console.log(`Buscando estoque por tamanho para produto ID: ${produtoId}`)

    if (!produtoId || isNaN(produtoId)) {
      console.error("ID de produto inválido:", produtoId)
      return []
    }

    const { data, error } = await supabase
      .from("estoque_tamanhos")
      .select("*")
      .eq("produto_id", produtoId)
      .order("tamanho", { ascending: true })

    if (error) {
      console.error("Erro ao buscar estoque por tamanho:", error)
      throw error
    }

    console.log(`Encontrados ${data?.length || 0} registros de estoque por tamanho:`, data)

    return data || []
  } catch (error) {
    console.error("Erro ao buscar estoque por tamanho:", error)
    // Retornar um array vazio em vez de lançar o erro
    return []
  }
}

// Atualizar a função addProduto para lidar com estoque por tamanho
export async function addProduto(
  produto: Omit<Produto, "id">,
  estoqueTamanhos?: { tamanho: number; quantidade: number }[],
) {
  try {
    // Inserir o produto
    const { data, error } = await supabase.from("produtos").insert([produto]).select()

    if (error) {
      console.error("Erro ao adicionar produto:", error)
      throw error
    }

    const novoProduto = data?.[0]

    // Se for produto com tamanhos, inserir os registros de estoque por tamanho
    if (novoProduto && produto.tipo_estoque === "par" && estoqueTamanhos && estoqueTamanhos.length > 0) {
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

// Atualizar a função updateProduto para lidar com estoque por tamanho
export async function updateProduto(
  id: number,
  produto: Partial<Produto>,
  estoqueTamanhos?: { tamanho: number; quantidade: number }[],
) {
  try {
    // Atualizar o produto
    const { data, error } = await supabase.from("produtos").update(produto).eq("id", id).select()

    if (error) {
      console.error("Erro ao atualizar produto:", error)
      throw error
    }

    const produtoAtualizado = data?.[0]

    // Se for produto com tamanhos, atualizar os registros de estoque por tamanho
    if (produtoAtualizado && produto.tipo_estoque === "par" && estoqueTamanhos && estoqueTamanhos.length > 0) {
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

// Funções para usuários
export async function getUsuarios() {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nome, email, cargo, ativo, created_at")
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

export async function addUsuario(usuario: { nome: string; email: string; senha: string; cargo: string }) {
  try {
    // Hash da senha
    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash(usuario.senha, salt)

    const { data, error } = await supabase
      .from("usuarios")
      .insert([
        {
          nome: usuario.nome,
          email: usuario.email,
          senha: senhaHash,
          cargo: usuario.cargo,
          ativo: true,
        },
      ])
      .select("id, nome, email, cargo, ativo, created_at")

    if (error) {
      console.error("Erro ao adicionar usuário:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao adicionar usuário:", error)
    return []
  }
}

export async function updateUsuario(
  id: number,
  usuario: { nome?: string; email?: string; senha?: string; cargo?: string; ativo?: boolean },
) {
  try {
    const updateData: any = { ...usuario }

    // Se a senha foi fornecida, fazer o hash
    if (usuario.senha) {
      const salt = await bcrypt.genSalt(10)
      updateData.senha = await bcrypt.hash(usuario.senha, salt)
    }

    const { data, error } = await supabase
      .from("usuarios")
      .update(updateData)
      .eq("id", id)
      .select("id, nome, email, cargo, ativo, created_at")

    if (error) {
      console.error("Erro ao atualizar usuário:", error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    throw error
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

export async function loginUsuario(email: string, senha: string) {
  try {
    // Buscar o usuário pelo email
    const { data, error } = await supabase.from("usuarios").select("*").eq("email", email).single()

    if (error) {
      console.error("Erro ao buscar usuário:", error)
      throw new Error("Usuário não encontrado")
    }

    if (!data) {
      throw new Error("Usuário não encontrado")
    }

    // Verificar se o usuário está ativo
    if (!data.ativo) {
      throw new Error("Usuário inativo")
    }

    // Verificar a senha - para o usuário felipe@sistema.com, aceitar a senha diretamente
    let senhaCorreta = false

    if (email === "felipe@sistema.com" && senha === "1305") {
      senhaCorreta = true
    } else {
      // Para outros usuários, verificar com bcrypt
      senhaCorreta = await bcrypt.compare(senha, data.senha)
    }

    if (!senhaCorreta) {
      throw new Error("Senha incorreta")
    }

    // Retornar o usuário sem a senha
    const { senha: _, ...usuarioSemSenha } = data
    return usuarioSemSenha
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    throw error
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
export async function getFornecedores() {
  try {
    const { data, error } = await supabase.from("fornecedores").select("*").order("razao_social", { ascending: true })

    if (error) {
      console.error("Erro ao buscar fornecedores:", error)
      return []
    }

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

// Atualizar a função deleteFornecedor para verificar o uso do fornecedor pelo nome
export async function deleteFornecedor(id: number) {
  try {
    // Buscar o fornecedor para obter o nome
    const { data: fornecedor } = await supabase.from("fornecedores").select("razao_social").eq("id", id).single()

    if (!fornecedor) {
      throw new Error("Fornecedor não encontrado")
    }

    // Verificar se o fornecedor está sendo usado em contas a pagar
    const { data: contas, error: contasError } = await supabase
      .from("contas_pagar")
      .select("id")
      .eq("fornecedor", fornecedor.razao_social) // Alterado para fornecedor
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

// Não é necessário alterar as funções getContasPagar, addContaPagar, updateContaPagar e deleteContaPagar
// pois elas já lidam com os dados de forma genérica

// Adicionar as funções para pedidos após as funções existentes
// Adicionar no final do arquivo

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
    const { data: pedido, error: pedidoError } = await supabase.from("pedidos").select("*").eq("id", id).single()

    if (pedidoError) {
      console.error("Erro ao buscar pedido:", pedidoError)
      return null
    }

    // Buscar itens do pedido
    const { data: itens, error: itensError } = await supabase.from("itens_pedido").select("*").eq("pedido_id", id)

    if (itensError) {
      console.error("Erro ao buscar itens do pedido:", itensError)
      return null
    }

    // Buscar parcelas do pedido
    const { data: parcelas, error: parcelasError } = await supabase
      .from("parcelas_pedido")
      .select("*")
      .eq("pedido_id", id)
      .order("numero_parcela", { ascending: true })

    if (parcelasError) {
      console.error("Erro ao buscar parcelas do pedido:", parcelasError)
      return null
    }

    // Buscar tamanhos dos itens do pedido
    const { data: tamanhos, error: tamanhosError } = await supabase
      .from("tamanhos_item_pedido")
      .select("*")
      .eq("pedido_id", id)

    if (tamanhosError) {
      console.error("Erro ao buscar tamanhos dos itens do pedido:", tamanhosError)
      // Não falhar completamente se não conseguir carregar os tamanhos
    }

    // Associar tamanhos aos itens
    const itensComTamanhos = itens?.map((item) => {
      if (item.tipo_estoque === "par" && tamanhos) {
        const tamanhosFiltrados = tamanhos.filter((t) => t.item_pedido_id === item.id)
        return {
          ...item,
          tamanhos: tamanhosFiltrados.map((t) => ({
            tamanho: t.tamanho,
            quantidade: t.quantidade,
          })),
        }
      }
      return item
    })

    return {
      ...pedido,
      itens: itensComTamanhos || [],
      parcelas: parcelas || [],
    }
  } catch (error) {
    console.error("Erro ao buscar pedido completo:", error)
    return null
  }
}

export async function addPedido(
  pedido: Omit<Pedido, "id">,
  itens: Omit<ItemPedido, "id" | "pedido_id">[],
  parcelas: Omit<ParcelaPedido, "id" | "pedido_id">[],
) {
  try {
    // Inserir o pedido
    const { data: pedidoInserido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert([
        {
          fornecedor_id: pedido.fornecedor_id,
          descricao: pedido.descricao,
          data_pedido: pedido.data_pedido,
          status: pedido.status,
          total: pedido.total,
          parcelas: pedido.parcelas,
        },
      ])
      .select()

    if (pedidoError) {
      console.error("Erro ao adicionar pedido:", pedidoError)
      throw pedidoError
    }

    const pedidoId = pedidoInserido[0].id

    // Inserir os itens do pedido
    if (itens.length > 0) {
      for (const item of itens) {
        // Inserir o item
        const { data: itemInserido, error: itemError } = await supabase
          .from("itens_pedido")
          .insert([
            {
              pedido_id: pedidoId,
              nome: item.nome,
              tipo_estoque: item.tipo_estoque,
              quantidade: item.quantidade,
              preco_unitario: item.preco_unitario,
              categoria: item.categoria,
            },
          ])
          .select()

        if (itemError) {
          console.error("Erro ao adicionar item do pedido:", itemError)
          throw itemError
        }

        // Se o item for do tipo "par" e tiver tamanhos, inserir os tamanhos
        if (item.tipo_estoque === "par" && item.tamanhos && item.tamanhos.length > 0 && itemInserido) {
          const tamanhosPedido = item.tamanhos.map((t) => ({
            pedido_id: pedidoId,
            item_pedido_id: itemInserido[0].id,
            tamanho: t.tamanho,
            quantidade: t.quantidade,
          }))

          const { error: tamanhoError } = await supabase.from("tamanhos_item_pedido").insert(tamanhosPedido)

          if (tamanhoError) {
            console.error("Erro ao adicionar tamanhos do item:", tamanhoError)
            throw tamanhoError
          }
        }
      }
    }

    // Inserir as parcelas do pedido
    if (parcelas.length > 0) {
      const parcelasParaInserir = parcelas.map((parcela) => ({
        pedido_id: pedidoId,
        numero_parcela: parcela.numero_parcela,
        data_vencimento: parcela.data_vencimento,
        valor: parcela.valor,
      }))

      const { error: parcelasError } = await supabase.from("parcelas_pedido").insert(parcelasParaInserir)

      if (parcelasError) {
        console.error("Erro ao adicionar parcelas do pedido:", parcelasError)
        throw parcelasError
      }
    }

    // Retornar o pedido completo
    return await getPedidoById(pedidoId)
  } catch (error) {
    console.error("Erro ao adicionar pedido:", error)
    throw error
  }
}

// Modificar a função updatePedidoStatus para usar fornecedor em vez de fornecedor_id
export async function updatePedidoStatus(id: number, status: string, notaFiscal?: string) {
  try {
    const updateData: any = { status }

    if (notaFiscal) {
      updateData.nota_fiscal = notaFiscal
    }

    const { data, error } = await supabase.from("pedidos").update(updateData).eq("id", id).select()

    if (error) {
      console.error("Erro ao atualizar status do pedido:", error)
      throw error
    }

    // Se o status for "Recebido", adicionar os produtos ao estoque e gerar contas a pagar
    if (status === "Recebido") {
      const pedidoCompleto = await getPedidoById(id)

      if (!pedidoCompleto) {
        throw new Error("Pedido não encontrado")
      }

      // Buscar o fornecedor
      const { data: fornecedor } = await supabase
        .from("fornecedores")
        .select("*")
        .eq("id", pedidoCompleto.fornecedor_id)
        .single()

      if (!fornecedor) {
        throw new Error("Fornecedor não encontrado")
      }

      // Adicionar os produtos ao estoque
      for (const item of pedidoCompleto.itens) {
        // Verificar se o produto já existe
        const { data: produtosExistentes } = await supabase.from("produtos").select("*").eq("nome", item.nome).limit(1)

        // Buscar o nome da categoria a partir do ID
        const { data: categoriaData } = await supabase
          .from("categorias")
          .select("nome")
          .eq("id", Number.parseInt(item.categoria))
          .single()

        const categoriaNome = categoriaData ? categoriaData.nome : item.categoria

        if (produtosExistentes && produtosExistentes.length > 0) {
          // Atualizar o produto existente
          const produto = produtosExistentes[0]

          if (item.tipo_estoque === "par") {
            // Para produtos do tipo "par", atualizar o produto
            await supabase
              .from("produtos")
              .update({
                preco: item.preco_unitario,
                categoria: categoriaNome,
                tipo_estoque: "par",
              })
              .eq("id", produto.id)

            // Verificar se o item tem tamanhos específicos
            if (item.tamanhos && item.tamanhos.length > 0) {
              console.log(`Produto ${item.nome} tem ${item.tamanhos.length} tamanhos específicos:`, item.tamanhos)

              // Atualizar os tamanhos específicos
              for (const tamanhoItem of item.tamanhos) {
                // Verificar se já existe registro para este tamanho
                const { data: estoqueTamanho } = await supabase
                  .from("estoque_tamanhos")
                  .select("*")
                  .eq("produto_id", produto.id)
                  .eq("tamanho", tamanhoItem.tamanho)
                  .single()

                if (estoqueTamanho) {
                  // Atualizar o estoque do tamanho existente
                  const novaQuantidade = estoqueTamanho.quantidade + tamanhoItem.quantidade
                  console.log(
                    `Atualizando tamanho ${tamanhoItem.tamanho}: ${estoqueTamanho.quantidade} + ${tamanhoItem.quantidade} = ${novaQuantidade}`,
                  )

                  await supabase
                    .from("estoque_tamanhos")
                    .update({ quantidade: novaQuantidade })
                    .eq("id", estoqueTamanho.id)
                } else {
                  // Criar novo registro para este tamanho
                  console.log(
                    `Criando novo registro para tamanho ${tamanhoItem.tamanho} com quantidade ${tamanhoItem.quantidade}`,
                  )

                  await supabase.from("estoque_tamanhos").insert({
                    produto_id: produto.id,
                    tamanho: tamanhoItem.tamanho,
                    quantidade: tamanhoItem.quantidade,
                  })
                }
              }
            } else {
              // Se não tiver tamanhos específicos, distribuir uniformemente (comportamento antigo)
              console.log(`Produto ${item.nome} não tem tamanhos específicos, distribuindo uniformemente`)

              // Definir os tamanhos padrão para calçados
              const tamanhosPadrao = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43]
              const quantidadePorTamanho = Math.floor(item.quantidade / tamanhosPadrao.length)
              const resto = item.quantidade % tamanhosPadrao.length

              // Verificar se já existem registros de estoque por tamanho
              const { data: estoqueTamanhos } = await supabase
                .from("estoque_tamanhos")
                .select("*")
                .eq("produto_id", produto.id)

              if (estoqueTamanhos && estoqueTamanhos.length > 0) {
                // Atualizar os registros existentes
                for (const tamanho of tamanhosPadrao) {
                  const estoqueTamanho = estoqueTamanhos.find((et) => et.tamanho === tamanho)
                  const quantidadeAdicional = tamanho === 38 ? quantidadePorTamanho + resto : quantidadePorTamanho

                  if (estoqueTamanho) {
                    // Adicionar quantidade ao tamanho existente
                    const novaQuantidade = estoqueTamanho.quantidade + quantidadeAdicional
                    console.log(
                      `Atualizando tamanho ${tamanho}: ${estoqueTamanho.quantidade} + ${quantidadeAdicional} = ${novaQuantidade}`,
                    )

                    await supabase
                      .from("estoque_tamanhos")
                      .update({ quantidade: novaQuantidade })
                      .eq("id", estoqueTamanho.id)
                  } else {
                    // Criar novo registro para este tamanho
                    console.log(`Criando novo registro para tamanho ${tamanho} com quantidade ${quantidadeAdicional}`)

                    await supabase.from("estoque_tamanhos").insert({
                      produto_id: produto.id,
                      tamanho,
                      quantidade: quantidadeAdicional,
                    })
                  }
                }
              } else {
                // Criar novos registros de estoque por tamanho
                const estoquesParaInserir = tamanhosPadrao.map((tamanho) => ({
                  produto_id: produto.id,
                  tamanho,
                  quantidade: tamanho === 38 ? quantidadePorTamanho + resto : quantidadePorTamanho, // Adicionar o resto ao tamanho 38
                }))

                console.log(
                  `Inserindo registros de estoque para ${estoquesParaInserir.length} tamanhos:`,
                  estoquesParaInserir,
                )

                const { data, error } = await supabase.from("estoque_tamanhos").insert(estoquesParaInserir)

                if (error) {
                  console.error("Erro ao inserir estoque por tamanho:", error)
                  throw error
                }

                console.log("Registros de estoque inseridos com sucesso:", data)
              }
            }

            // Atualizar o estoque total do produto
            const { data: estoquesTamanho } = await supabase
              .from("estoque_tamanhos")
              .select("quantidade")
              .eq("produto_id", produto.id)

            const estoqueTotal = estoquesTamanho?.reduce((total, et) => total + et.quantidade, 0) || 0

            console.log(`Atualizando estoque total do produto para ${estoqueTotal}`)

            await supabase.from("produtos").update({ estoque: estoqueTotal }).eq("id", produto.id)
          } else {
            // Para produtos do tipo "unidade"
            await supabase
              .from("produtos")
              .update({
                estoque: produto.estoque + item.quantidade,
                preco: item.preco_unitario,
                categoria: categoriaNome,
              })
              .eq("id", produto.id)
          }
        } else {
          // Adicionar novo produto
          const { data: novoProduto } = await supabase
            .from("produtos")
            .insert([
              {
                nome: item.nome,
                categoria: categoriaNome,
                preco: item.preco_unitario,
                estoque: item.quantidade,
                tipo_estoque: item.tipo_estoque,
              },
            ])
            .select()

          // Se for produto do tipo "par", criar registros de estoque por tamanho
          if (item.tipo_estoque === "par" && novoProduto && novoProduto.length > 0) {
            if (item.tamanhos && item.tamanhos.length > 0) {
              // Se tiver tamanhos específicos, usar esses tamanhos
              console.log(`Novo produto ${item.nome} com ${item.tamanhos.length} tamanhos específicos:`, item.tamanhos)

              const estoquesParaInserir = item.tamanhos.map((t) => ({
                produto_id: novoProduto[0].id,
                tamanho: t.tamanho,
                quantidade: t.quantidade,
              }))

              console.log(`Inserindo registros de estoque para novo produto:`, estoquesParaInserir)

              const { data, error } = await supabase.from("estoque_tamanhos").insert(estoquesParaInserir)

              if (error) {
                console.error("Erro ao inserir estoque por tamanho para novo produto:", error)
                throw error
              }

              console.log("Registros de estoque para novo produto inseridos com sucesso:", data)
            } else {
              // Se não tiver tamanhos específicos, distribuir uniformemente
              console.log(`Novo produto ${item.nome} sem tamanhos específicos, distribuindo uniformemente`)

              // Distribuir a quantidade uniformemente entre os tamanhos 34 a 43
              const tamanhosPadrao = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43]
              const quantidadePorTamanho = Math.floor(item.quantidade / tamanhosPadrao.length)
              const resto = item.quantidade % tamanhosPadrao.length

              console.log(
                `Novo produto: Distribuindo ${item.quantidade} unidades entre ${tamanhosPadrao.length} tamanhos. Cada tamanho receberá ${quantidadePorTamanho} unidades, com ${resto} de resto para o tamanho 38.`,
              )

              const estoquesParaInserir = tamanhosPadrao.map((tamanho) => ({
                produto_id: novoProduto[0].id,
                tamanho,
                quantidade: tamanho === 38 ? quantidadePorTamanho + resto : quantidadePorTamanho, // Adicionar o resto ao tamanho 38
              }))

              console.log(`Inserindo registros de estoque para novo produto:`, estoquesParaInserir)

              const { data, error } = await supabase.from("estoque_tamanhos").insert(estoquesParaInserir)

              if (error) {
                console.error("Erro ao inserir estoque por tamanho para novo produto:", error)
                throw error
              }

              console.log("Registros de estoque para novo produto inseridos com sucesso:", data)
            }
          }
        }
      }

      // Gerar contas a pagar para cada parcela
      if (pedidoCompleto.parcelas && pedidoCompleto.parcelas.length > 0) {
        console.log("Gerando contas a pagar para", pedidoCompleto.parcelas.length, "parcelas")

        for (const parcela of pedidoCompleto.parcelas) {
          // Criar a conta a pagar
          const contaPagar = {
            descricao: `NF ${notaFiscal || "Sem NF"} - Pedido #${id}`,
            valor: parcela.valor,
            data_vencimento: parcela.data_vencimento,
            status: "Pendente",
            fornecedor: fornecedor.razao_social, // Usar razao_social em vez de id
            observacao: `Parcela ${parcela.numero_parcela}/${pedidoCompleto.parcelas.length} do Pedido #${id}`,
          }

          console.log("Criando conta a pagar:", contaPagar)

          const { data, error } = await supabase.from("contas_pagar").insert([contaPagar]).select()

          if (error) {
            console.error("Erro ao criar conta a pagar:", error)
            throw error
          }

          console.log("Conta a pagar criada:", data)
        }
      }
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error)
    throw error
  }
}

export async function deletePedido(id: number) {
  try {
    // Verificar se o pedido já foi recebido
    const { data: pedido } = await supabase.from("pedidos").select("status").eq("id", id).single()

    if (pedido && pedido.status === "Recebido") {
      throw new Error("Não é possível excluir um pedido já recebido")
    }

    // Excluir o pedido (as parcelas e itens serão excluídos automaticamente devido à constraint ON DELETE CASCADE)
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
