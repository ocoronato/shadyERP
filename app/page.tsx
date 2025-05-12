import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default function Home() {
  // Verificar se há um cookie de usuário
  const cookieStore = cookies()
  const userCookie = cookieStore.get("user")

  // Se o usuário já estiver logado, redirecionar para o dashboard
  // Caso contrário, redirecionar para a página de login
  if (userCookie) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
