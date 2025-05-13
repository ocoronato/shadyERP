"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { LucideChevronDown, LucideArrowDownCircle, LucideArrowUpCircle } from "lucide-react"

export default function FinanceiroMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar o menu quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center"
      >
        Financeiro <LucideChevronDown className="ml-1 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <Link
              href="/financeiro/contas-pagar"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <LucideArrowUpCircle className="mr-2 h-4 w-4" />
              Contas a Pagar
            </Link>
            <Link
              href="/financeiro/contas-receber"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <LucideArrowDownCircle className="mr-2 h-4 w-4" />
              Contas a Receber
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
