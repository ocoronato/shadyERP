import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Aqui vamos usar o SQL inline do v0
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao executar SQL:", error)
    return NextResponse.json({ error: "Erro ao executar SQL" }, { status: 500 })
  }
}
