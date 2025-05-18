# Sistema de Gerenciamento

Um sistema completo de gerenciamento empresarial desenvolvido com Next.js e Supabase, oferecendo funcionalidades para controle de estoque, vendas, clientes, fornecedores, pedidos e finanças.


## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **UI Components**: shadcn/ui
- **Gráficos**: Recharts
- **Estilização**: TailwindCSS

## ✨ Funcionalidades Principais

### Dashboard
- Visão geral de métricas importantes
- Gráficos de vendas e margem de lucro
- Resumo financeiro

### Estoque
- Cadastro e gerenciamento de produtos
- Controle de estoque
- Categorização de produtos
- Gerenciamento de marcas

### Vendas
- Registro de vendas
- Detalhamento de vendas
- Relatórios de desempenho

### Clientes
- Cadastro e gerenciamento de clientes
- Histórico de compras
- Informações de contato

### Fornecedores
- Cadastro e gerenciamento de fornecedores
- Histórico de pedidos
- Informações de contato

### Pedidos
- Criação e gerenciamento de pedidos
- Acompanhamento de status
- Previsão de entrega

### Financeiro
- Contas a pagar
- Contas a receber
- Fluxo de caixa

### Usuários
- Gerenciamento de usuários
- Controle de acesso
- Autenticação segura

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18.x ou superior
- npm ou yarn
- Conta no Supabase

### Configuração do Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL fornecidos para criar as tabelas necessárias
3. Configure as variáveis de ambiente com as credenciais do Supabase

### Instalação
\`\`\`bash
# Clone o repositório
git clone https://github.com/seu-usuario/sistema-gerenciamento.git

# Entre no diretório do projeto
cd sistema-gerenciamento

# Instale as dependências
npm install
# ou
yarn install

# Configure as variáveis de ambiente
cp .env.example .env.local
\`\`\`

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico-do-supabase
\`\`\`

## 🚀 Executando o Projeto

\`\`\`bash
# Desenvolvimento
npm run dev
# ou
yarn dev

# Produção
npm run build
npm start
# ou
yarn build
yarn start
\`\`\`

Acesse `http://localhost:3000` no seu navegador.


## 🗄️ Banco de Dados

O sistema utiliza o PostgreSQL fornecido pelo Supabase. A estrutura do banco de dados inclui as seguintes tabelas principais:

- `produtos`: Cadastro de produtos
- `categorias`: Categorias de produtos
- `marcas`: Marcas de produtos
- `clientes`: Cadastro de clientes
- `fornecedores`: Cadastro de fornecedores
- `vendas`: Registro de vendas
- `vendas_itens`: Itens de cada venda
- `pedidos`: Pedidos a fornecedores
- `pedidos_itens`: Itens de cada pedido
- `contas_pagar`: Contas a pagar
- `contas_receber`: Contas a receber
- `usuarios`: Usuários do sistema

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, entre em contato através do email: crtbombies@gmail.com
