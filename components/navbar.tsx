"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import {
  Home,
  Users,
  ShoppingCart,
  BarChart2,
  Settings,
  LogOut,
  DollarSign,
  Layers,
  UserCircle,
  MenuIcon,
  UsersRound,
  Tag,
  Package,
  Building,
  ClipboardList,
} from "lucide-react"
import CadastroMenu from "@/components/cadastro-menu"
import FinanceiroMenu from "@/components/financeiro-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Navbar() {
  const { user, logout } = useAuth()

  const navLinkClasses =
    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:bg-blue-700 hover:text-white transition-colors"
  const mobileNavLinkClasses =
    "block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-blue-700 hover:text-white transition-colors"

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-950 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <Layers className="h-8 w-8 text-white mr-2" />
              <span className="text-white text-2xl font-bold italic">SHADY</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/dashboard" className={navLinkClasses}>
                  <Home className="h-5 w-5 mr-1" />
                  Dashboard
                </Link>
                <CadastroMenu navLinkClasses={navLinkClasses} />
                <Link href="/pedidos" className={navLinkClasses}>
                  <ShoppingCart className="h-5 w-5 mr-1" />
                  Pedidos
                </Link>
                <Link href="/vendas" className={navLinkClasses}>
                  <BarChart2 className="h-5 w-5 mr-1" />
                  Vendas
                </Link>
                <FinanceiroMenu navLinkClasses={navLinkClasses} />
                <Link href="/usuarios" className={navLinkClasses}>
                  <UsersRound className="h-5 w-5 mr-1" />
                  Usuários
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center text-sm rounded-full text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
                >
                  <UserCircle className="h-8 w-8" />
                  <span className="ml-2">{user?.nome || "Usuário"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2 w-48 bg-neutral-900 border-neutral-700 text-gray-200" align="end">
                <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold">Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator className="border-neutral-700" />
                <DropdownMenuItem className="hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="hover:bg-neutral-800 focus:bg-neutral-800 text-red-400 hover:text-red-300 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <span className="sr-only">Abrir menu principal</span>
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-neutral-900 border-neutral-800 p-4 text-gray-200">
                <div className="pb-3 space-y-1">
                  <Link href="/dashboard" className={mobileNavLinkClasses}>
                    <Home className="h-5 w-5 mr-1 inline-block" /> Dashboard
                  </Link>
                  <Link href="/pedidos" className={mobileNavLinkClasses}>
                    <ShoppingCart className="h-5 w-5 mr-1 inline-block" /> Pedidos
                  </Link>
                  <Link href="/vendas" className={mobileNavLinkClasses}>
                    <BarChart2 className="h-5 w-5 mr-1 inline-block" /> Vendas
                  </Link>
                  <Link href="/usuarios" className={mobileNavLinkClasses}>
                    <UsersRound className="h-5 w-5 mr-1 inline-block" /> Usuários
                  </Link>

                  <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-400">Cadastros</p>
                  <Link href="/clientes" className={mobileNavLinkClasses}>
                    <Users className="h-5 w-5 mr-1 inline-block" /> Clientes
                  </Link>
                  <Link href="/estoque" className={mobileNavLinkClasses}>
                    <Package className="h-5 w-5 mr-1 inline-block" /> Estoque
                  </Link>
                  <Link href="/fornecedores" className={mobileNavLinkClasses}>
                    <Building className="h-5 w-5 mr-1 inline-block" /> Fornecedores
                  </Link>
                  <Link href="/marcas" className={mobileNavLinkClasses}>
                    <Tag className="h-5 w-5 mr-1 inline-block" /> Marcas
                  </Link>
                  <Link href="/categorias" className={mobileNavLinkClasses}>
                    <Tag className="h-5 w-5 mr-1 inline-block" /> Categorias
                  </Link>
                  <Link href="/grade" className={mobileNavLinkClasses}>
                    <ClipboardList className="h-5 w-5 mr-1 inline-block" /> Grade
                  </Link>

                  <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-400">Financeiro</p>
                  <Link href="/financeiro/contas-pagar" className={mobileNavLinkClasses}>
                    <DollarSign className="h-5 w-5 mr-1 inline-block" /> Contas a Pagar
                  </Link>
                  <Link href="/financeiro/contas-receber" className={mobileNavLinkClasses}>
                    <DollarSign className="h-5 w-5 mr-1 inline-block" /> Contas a Receber
                  </Link>
                </div>
                <div className="pt-4 pb-3 border-t border-neutral-700">
                  <div className="flex items-center px-3">
                    <UserCircle className="h-10 w-10" />
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{user?.nome || "Usuário"}</div>
                      <div className="text-sm font-medium text-gray-400">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <button className={`${mobileNavLinkClasses} w-full text-left`}>
                      <Settings className="h-5 w-5 mr-1 inline-block" /> Configurações
                    </button>
                    <button
                      onClick={logout}
                      className={`${mobileNavLinkClasses} w-full text-left text-red-400 hover:text-red-300`}
                    >
                      <LogOut className="h-5 w-5 mr-1 inline-block" /> Sair
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
