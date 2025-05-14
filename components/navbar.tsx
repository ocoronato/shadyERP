"use client"

import Link from "next/link"
import { useState } from "react"
import {
  LucideMenu,
  LucideX,
  LucideLogOut,
  LucideUser,
  LucideUsers,
  LucidePackage,
  LucideTag,
  LucideDollarSign,
  LucideArrowDownCircle,
  LucideArrowUpCircle,
  LucideBuilding,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import CadastroMenu from "./cadastro-menu"
import FinanceiroMenu from "./financeiro-menu"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <nav className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl italic">
                SHADY
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                  Início
                </Link>
                <Link
                  href="/dashboard"
                  className="text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>

                {/* Menu dropdown para Cadastro */}
                <CadastroMenu />

                <Link href="/vendas" className="text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                  Vendas
                </Link>

                {/* Menu dropdown para Financeiro */}
                <FinanceiroMenu />

                <Link
                  href="/usuarios"
                  className="text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Usuários
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-white text-sm">
              <span className="mr-2">{user?.nome}</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs">{user?.cargo}</span>
            </div>
            <button
              onClick={logout}
              className="text-white hover:bg-gray-800 p-2 rounded-full focus:outline-none"
              title="Sair"
            >
              <LucideLogOut className="h-5 w-5" />
            </button>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <LucideX className="block h-6 w-6" /> : <LucideMenu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Início
            </Link>
            <Link
              href="/dashboard"
              className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>

            {/* Menu móvel para Cadastro */}
            <div className="text-white px-3 py-2 text-base font-medium">Cadastro</div>
            <div className="pl-4">
              <Link
                href="/clientes"
                className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <LucideUsers className="inline-block h-4 w-4 mr-2" />
                Clientes
              </Link>
              <Link
                href="/fornecedores"
                className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <LucideBuilding className="inline-block h-4 w-4 mr-2" />
                Fornecedores
              </Link>
              <Link
                href="/categorias"
                className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <LucideTag className="inline-block h-4 w-4 mr-2" />
                Categorias
              </Link>
              <Link
                href="/estoque"
                className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <LucidePackage className="inline-block h-4 w-4 mr-2" />
                Estoque
              </Link>
            </div>

            <Link
              href="/vendas"
              className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Vendas
            </Link>

            {/* Menu móvel para Financeiro */}
            <div className="text-white px-3 py-2 text-base font-medium">
              <LucideDollarSign className="inline-block h-4 w-4 mr-2" />
              Financeiro
            </div>
            <div className="pl-4">
              <Link
                href="/financeiro/contas-pagar"
                className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <LucideArrowUpCircle className="inline-block h-4 w-4 mr-2" />
                Contas a Pagar
              </Link>
              <Link
                href="/financeiro/contas-receber"
                className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <LucideArrowDownCircle className="inline-block h-4 w-4 mr-2" />
                Contas a Receber
              </Link>
            </div>

            <Link
              href="/usuarios"
              className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Usuários
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <LucideUser className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">{user?.nome}</div>
                <div className="text-sm font-medium leading-none text-gray-400 mt-1">{user?.cargo}</div>
              </div>
              <button
                onClick={logout}
                className="ml-auto text-white hover:bg-gray-800 p-2 rounded-full focus:outline-none"
                title="Sair"
              >
                <LucideLogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
