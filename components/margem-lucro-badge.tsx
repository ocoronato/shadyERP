import { Badge } from "@/components/ui/badge"

interface MargemLucroBadgeProps {
  preco: number
  custo: number
}

export function MargemLucroBadge({ preco, custo }: MargemLucroBadgeProps) {
  const calcularMargem = () => {
    if (custo === 0) return 0
    const margem = ((preco - custo) / preco) * 100
    return Math.round(margem * 100) / 100 // Arredondar para 2 casas decimais
  }

  const margem = calcularMargem()

  // Determinar a variante da badge com base na margem
  let variant: "default" | "destructive" | "outline" | "secondary" | "success" = "outline"
  let label = "Margem"

  if (margem < 15) {
    variant = "destructive"
    label = "Margem Baixa"
  } else if (margem >= 15 && margem < 30) {
    variant = "secondary"
    label = "Margem Média"
  } else if (margem >= 30) {
    variant = "success"
    label = "Margem Alta"
  }

  return (
    <Badge variant={variant} className="whitespace-nowrap">
      {label}: {margem}%
    </Badge>
  )
}
