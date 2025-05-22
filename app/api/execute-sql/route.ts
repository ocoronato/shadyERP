import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ error: "SQL query is required" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Execute a consulta SQL
    const { data, error } = await supabase.rpc("execute_sql", { sql_query: sql })

    if (error) {
      console.error("Erro ao executar SQL:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
