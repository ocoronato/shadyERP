"use client"

import Link from "next/link"
import { useState } from "react"
import { LucideMenu, LucideX } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

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
                <Link
                  href="/clientes"
                  className="text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Clientes
                </Link>
                <Link
                  href="/categorias"
                  className="text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Categorias
                </Link>
                <Link
                  href="/produtos"
                  className="text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Produtos
                </Link>
                <Link href="/vendas" className="text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                  Vendas
                </Link>
              </div>
            </div>
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
            <Link
              href="/clientes"
              className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Clientes
            </Link>
            <Link
              href="/categorias"
              className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Categorias
            </Link>
            <Link
              href="/produtos"
              className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Produtos
            </Link>
            <Link
              href="/vendas"
              className="text-white hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Vendas
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
