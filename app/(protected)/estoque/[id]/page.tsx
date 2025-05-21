import { ImprimirEtiquetaButton } from "@/components/produto-etiqueta"
import { ProdutoEtiquetaTamanhos } from "@/components/produto-etiqueta-tamanhos"

import { getProduto } from "@/lib/produtos"
import { getEstoqueTamanhos } from "@/lib/estoque-tamanhos"

interface Params {
  id: string
}

interface Props {
  params: Params
}

export default async function ProdutoPage({ params }: Props) {
  const { id } = params
  const produto = await getProduto(id)
  const estoqueTamanhos = await getEstoqueTamanhos(id)

  if (!produto) {
    return <div>Produto não encontrado</div>
  }

  return (
    <div>
      <h1>Detalhes do Produto</h1>
      <p>Nome: {produto.nome}</p>
      <p>Preço: {produto.preco}</p>
      <p>Tipo de Estoque: {produto.tipo_estoque}</p>
      {/* Adicionar após as informações do produto */}
      <div className="mt-4">
        {produto.tipo_estoque === "unidade" ? (
          <ImprimirEtiquetaButton produto={produto} />
        ) : (
          <ProdutoEtiquetaTamanhos produto={produto} estoqueTamanhos={estoqueTamanhos} />
        )}
      </div>
    </div>
  )
}
