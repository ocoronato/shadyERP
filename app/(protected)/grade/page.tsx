"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LucideEdit, LucideTrash, LucidePlus, LucideSearch, LucideGrid, LucideDatabase } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import LoadingSpinner from "@/components/loading-spinner"

interface Unidade {
  id: number
  nome: string
  sigla: string
}

interface Tamanho {
  id: number
  nome: string
  ordem: number
}

export default function GradePage() {
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"unidades" | "tamanhos">("unidades")
  const [searchTerm, setSearchTerm] = useState("")
  const [tablesExist, setTablesExist] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Verificar se as tabelas existem
        const { error: unidadesCheckError } = await supabase.from("unidades").select("id").limit(1)
        const { error: tamanhosCheckError } = await supabase.from("tamanhos").select("id").limit(1)

        if (unidadesCheckError || tamanhosCheckError) {
          console.log("Tabelas não existem:", unidadesCheckError, tamanhosCheckError)
          setTablesExist(false)
          setLoading(false)
          return
        }

        // Carregar unidades
        const { data: unidadesData, error: unidadesError } = await supabase.from("unidades").select("*").order("nome")

        if (unidadesError) throw unidadesError
        setUnidades(unidadesData || [])

        // Carregar tamanhos
        const { data: tamanhosData, error: tamanhosError } = await supabase.from("tamanhos").select("*").order("ordem")

        if (tamanhosError) throw tamanhosError
        setTamanhos(tamanhosData || [])

        setTablesExist(true)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        // Verificar se o erro é devido à tabela não existir
        if (error instanceof Error && error.message.includes("does not exist")) {
          setTablesExist(false)
        } else {
          alert("Erro ao carregar dados. Verifique o console para mais detalhes.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const initializeTables = async () => {
    setLoading(true)
    try {
      // Criar tabela de unidades
      await supabase.rpc("execute_sql", {
        sql_query: `
          -- Criar tabela de unidades
          CREATE TABLE IF NOT EXISTS unidades (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(50) NOT NULL,
            sigla VARCHAR(10) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Criar tabela de tamanhos
          CREATE TABLE IF NOT EXISTS tamanhos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(20) NOT NULL,
            ordem INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Inserir algumas unidades padrão
          INSERT INTO unidades (nome, sigla)
          VALUES ('Unidade', 'UN'), ('Par', 'PR'), ('Caixa', 'CX')
          ON CONFLICT DO NOTHING;

          -- Inserir alguns tamanhos padrão
          INSERT INTO tamanhos (nome, ordem)
          VALUES 
            ('P', 1), ('M', 2), ('G', 3), ('GG', 4),
            ('36', 10), ('38', 11), ('40', 12), ('42', 13)
          ON CONFLICT DO NOTHING;
        `,
      })

      alert("Tabelas inicializadas com sucesso!")
      window.location.reload()
    } catch (error) {
      console.error("Erro ao inicializar tabelas:", error)
      alert("Erro ao inicializar tabelas. Verifique o console para mais detalhes.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, tipo: "unidade" | "tamanho") => {
    if (!confirm(`Tem certeza que deseja excluir este ${tipo}?`)) return

    try {
      const { error } = await supabase
        .from(tipo === "unidade" ? "unidades" : "tamanhos")
        .delete()
        .eq("id", id)

      if (error) throw error

      if (tipo === "unidade") {
        setUnidades(unidades.filter((u) => u.id !== id))
      } else {
        setTamanhos(tamanhos.filter((t) => t.id !== id))
      }

      alert(`${tipo === "unidade" ? "Unidade" : "Tamanho"} excluído com sucesso!`)
    } catch (error) {
      console.error(`Erro ao excluir ${tipo}:`, error)
      alert(`Erro ao excluir ${tipo}. Este ${tipo} pode estar sendo usado em produtos.`)
    }
  }

  const filteredUnidades = unidades.filter(
    (unidade) =>
      unidade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.sigla.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredTamanhos = tamanhos.filter((tamanho) => tamanho.nome.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return <LoadingSpinner />
  }

  if (!tablesExist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-neutral-800 shadow-lg rounded-lg p-6 max-w-lg mx-auto border border-neutral-700">
          <div className="text-center mb-6">
            <LucideDatabase className="mx-auto h-12 w-12 text-indigo-400" />
            <h2 className="mt-2 text-xl font-semibold text-gray-100">Tabelas não encontradas</h2>
            <p className="mt-1 text-gray-400">
              As tabelas necessárias para o gerenciamento de grade não foram encontradas no banco de dados.
            </p>
          </div>
          <div className="mt-5">
            <button
              onClick={initializeTables}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Inicializar Tabelas
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center text-gray-100">
          <LucideGrid className="mr-2" /> Gerenciamento de Grade
        </h1>
        <button
          onClick={() => router.push(`/grade/${activeTab === "unidades" ? "unidade" : "tamanho"}/novo`)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <LucidePlus className="mr-2" /> Novo {activeTab === "unidades" ? "Unidade" : "Tamanho"}
        </button>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-neutral-700">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "unidades"
                ? "text-indigo-400 border-b-2 border-indigo-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("unidades")}
          >
            Unidades
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "tamanhos"
                ? "text-indigo-400 border-b-2 border-indigo-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("tamanhos")}
          >
            Tamanhos
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={`Buscar ${activeTab === "unidades" ? "unidades" : "tamanhos"}...`}
            className="w-full p-2 pl-10 bg-neutral-700 border-neutral-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {activeTab === "unidades" ? (
        <div className="bg-neutral-800 shadow-lg rounded-md overflow-hidden border border-neutral-700">
          <table className="min-w-full divide-y divide-neutral-700">
            <thead className="bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Sigla
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-800 divide-y divide-neutral-700">
              {filteredUnidades.length > 0 ? (
                filteredUnidades.map((unidade) => (
                  <tr key={unidade.id} className="hover:bg-neutral-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{unidade.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{unidade.sigla}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/grade/unidade/${unidade.id}`)}
                        className="text-indigo-400 hover:text-indigo-300 mr-4"
                      >
                        <LucideEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(unidade.id, "unidade")}
                        className="text-red-500 hover:text-red-400"
                      >
                        <LucideTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-400">
                    Nenhuma unidade encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-neutral-800 shadow-lg rounded-md overflow-hidden border border-neutral-700">
          <table className="min-w-full divide-y divide-neutral-700">
            <thead className="bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ordem
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-800 divide-y divide-neutral-700">
              {filteredTamanhos.length > 0 ? (
                filteredTamanhos.map((tamanho) => (
                  <tr key={tamanho.id} className="hover:bg-neutral-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{tamanho.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{tamanho.ordem}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/grade/tamanho/${tamanho.id}`)}
                        className="text-indigo-400 hover:text-indigo-300 mr-4"
                      >
                        <LucideEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(tamanho.id, "tamanho")}
                        className="text-red-500 hover:text-red-400"
                      >
                        <LucideTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-400">
                    Nenhum tamanho encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
