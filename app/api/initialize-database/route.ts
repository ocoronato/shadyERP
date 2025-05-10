import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Variáveis de ambiente do Supabase não configuradas" }, { status: 500 })
    }

    // Usar a chave de serviço para ter permissões completas
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Criar tabela de clientes
    await supabase.rpc("exec", {
      query: `
        CREATE TABLE IF NOT EXISTS clientes (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          telefone VARCHAR(20),
          endereco TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
    })

    // Criar tabela de produtos
    await supabase.rpc("exec", {
      query: `
        CREATE TABLE IF NOT EXISTS produtos (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          categoria VARCHAR(100) NOT NULL,
          preco DECIMAL(10, 2) NOT NULL,
          estoque INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
    })

    // Criar tabela de vendas
    await supabase.rpc("exec", {
      query: `
        CREATE TABLE IF NOT EXISTS vendas (
          id SERIAL PRIMARY KEY,
          cliente VARCHAR(255) NOT NULL,
          data VARCHAR(10) NOT NULL,
          total DECIMAL(10, 2) NOT NULL,
          status VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
    })

    // Criar tabela de itens de venda
    await supabase.rpc("exec", {
      query: `
        CREATE TABLE IF NOT EXISTS itens_venda (
          id SERIAL PRIMARY KEY,
          venda_id INTEGER NOT NULL,
          produto VARCHAR(255) NOT NULL,
          quantidade INTEGER NOT NULL,
          precoUnitario DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `,
    })

    // Adicionar dados de exemplo para clientes
    await supabase.from("clientes").insert([
      { nome: "João Silva", email: "joao@email.com", telefone: "(11) 98765-4321", endereco: "Rua A, 123" },
      { nome: "Maria Oliveira", email: "maria@email.com", telefone: "(11) 91234-5678", endereco: "Av. B, 456" },
      { nome: "Carlos Santos", email: "carlos@email.com", telefone: "(11) 92345-6789", endereco: "Rua C, 789" },
    ])

    // Adicionar dados de exemplo para produtos
    await supabase.from("produtos").insert([
      { nome: "Notebook Pro", categoria: "Eletrônicos", preco: 4500, estoque: 15 },
      { nome: "Smartphone X", categoria: "Eletrônicos", preco: 2800, estoque: 23 },
      { nome: 'Monitor 27"', categoria: "Periféricos", preco: 1200, estoque: 8 },
      { nome: "Teclado Mecânico", categoria: "Periféricos", preco: 350, estoque: 30 },
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error)
    return NextResponse.json({ error: "Erro ao inicializar banco de dados" }, { status: 500 })
  }
}
