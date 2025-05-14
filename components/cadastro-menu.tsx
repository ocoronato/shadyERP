"use client"

import { useState } from "react"
import Link from "next/link"
import { LucideChevronDown, LucideUsers, LucidePackage, LucideTag, LucideBuilding } from "lucide-react"

export default function CadastroMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center"
      >
        Cadastro
        <LucideChevronDown className={`ml-1 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="py-1">
            <Link
              href="/clientes"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <LucideUsers className="mr-2 h-4 w-4" />
              Clientes
            </Link>
            <Link
              href="/fornecedores"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <LucideBuilding className="mr-2 h-4 w-4" />
              Fornecedores
            </Link>
            <Link
              href="/categorias"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <LucideTag className="mr-2 h-4 w-4" />
              Categorias
            </Link>
            <Link
              href="/produtos"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <LucidePackage className="mr-2 h-4 w-4" />
              Produtos
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
