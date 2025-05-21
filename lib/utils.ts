import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function calcularMargemLucro(precoCompra: number, precoVenda: number): number {
  if (!precoCompra || !precoVenda || precoCompra === 0) return 0
  return ((precoVenda - precoCompra) / precoCompra) * 100
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pendente: "bg-yellow-500",
    pago: "bg-green-500",
    cancelado: "bg-red-500",
    atrasado: "bg-red-500",
    "em processamento": "bg-blue-500",
    enviado: "bg-purple-500",
    entregue: "bg-green-500",
  }

  return statusColors[status.toLowerCase()] || "bg-gray-500"
}
