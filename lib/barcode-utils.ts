// Função para gerar um código de barras Code 128 a partir de um ID
export function generateBarcode(id: number, tamanho?: number): string {
  // Criar o código que será convertido em barcode
  const code = tamanho ? `P${id}T${tamanho}` : `P${id}`

  // Gerar o SVG para o código de barras Code 128
  // Esta é uma implementação simplificada do Code 128
  const bars = generateCode128Bars(code)

  let svg = `<svg width="100%" height="100%" viewBox="0 0 ${bars.length * 2} 100" preserveAspectRatio="none">
    <rect x="0" y="0" width="100%" height="100%" fill="white" />`

  let x = 0
  for (let i = 0; i < bars.length; i++) {
    if (i % 2 === 0) {
      // Barras pretas
      svg += `<rect x="${x}" y="0" width="${bars[i]}" height="100%" fill="black" />`
    }
    x += bars[i]
  }

  svg += `</svg>`

  return svg
}

// Função para gerar as barras do Code 128
function generateCode128Bars(code: string): number[] {
  // Esta é uma versão simplificada - em produção, você usaria uma biblioteca completa
  // Code 128 tem um algoritmo complexo para gerar as barras corretas

  // Para esta demonstração, vamos criar um padrão consistente baseado no código
  const bars: number[] = []

  // Início do código de barras Code 128
  bars.push(2, 1, 2, 2, 2, 2) // Padrão de início

  // Converter cada caractere em barras
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i)
    // Usar o código ASCII para gerar um padrão de barras único para cada caractere
    bars.push(1 + (charCode % 2), 1 + (charCode % 3), 2, 1 + (charCode % 2))
  }

  // Fim do código de barras
  bars.push(2, 2, 1, 1, 2, 2)

  return bars
}

// Função para gerar um checksum para o código
function calculateChecksum(code: string): number {
  let sum = 104 // Valor inicial para Code 128B

  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i) - 32
    sum += charCode * (i + 1)
  }

  return sum % 103
}
