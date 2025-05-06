# Sairá - Sistema de Gerenciamento para Farmácias

![Logo Sairá](src/lib/assets/Logo.png)

## 📋 Visão Geral

Sairá é uma plataforma completa para gestão de farmácias, oferecendo uma interface moderna para gerenciamento de clientes, produtos, campanhas e comunicação via WhatsApp. Com foco na experiência do usuário e eficiência operacional, o Sairá auxilia no aumento das vendas e na fidelização de clientes.

### ✨ Principais Funcionalidades

- **Dashboard Intuitivo**: Visualização rápida de métricas e KPIs importantes
- **Gestão de Clientes**: Cadastro completo, histórico de compras e categorização
- **Controle de Produtos**: Estoque, categorização e informações detalhadas
- **Campanhas e Automações**: Lembretes de recompra, aniversários e pós-venda
- **Chat Integrado**: Comunicação direta com clientes via WhatsApp
- **Relatórios Avançados**: Análise de desempenho e métricas de negócio

## 🚀 Tecnologias

- **Frontend**:
  - React 18
  - TypeScript
  - Vite
  - TailwindCSS
  - shadcn/ui (componentes)
  - React Router (navegação)
  - Lucide React (ícones)
  - TanStack Query (gerenciamento de estado)

## 🛠️ Instalação e Uso

### Pré-requisitos

- Node.js 16+
- npm ou bun

### Configuração Local

```sh
# Clonar o repositório
git clone https://github.com/seu-usuario/saira.git
cd saira

# Instalar dependências
npm install
# OU
bun install

# Iniciar servidor de desenvolvimento
npm run dev
# OU
bun run dev
```

O aplicativo estará disponível em `http://localhost:8080`

### Credenciais de Teste

- **Email**: teste@saira.com
- **Senha**: teste123

## 📁 Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── layout/         # Estrutura da aplicação (Sidebar, TopBar)
│   ├── dashboard/      # Componentes do dashboard
│   ├── clients/        # Componentes de gestão de clientes
│   ├── products/       # Componentes de produtos
│   ├── chat/           # Componentes de chat/WhatsApp
│   ├── campaigns/      # Componentes de campanhas e automações
│   └── forms/          # Componentes de formulários
├── lib/                # Utilitários e configurações
│   ├── utils.ts        # Funções utilitárias
│   └── assets/         # Imagens e recursos estáticos
├── pages/              # Páginas da aplicação
│   ├── Login.tsx       # Página de login
│   └── Index.tsx       # Página principal (dashboard)
└── App.tsx             # Componente principal com rotas
```

## 🔒 Autenticação

O sistema utiliza autenticação baseada em formulário com redirecionamento para o dashboard após login bem-sucedido. Em um ambiente de produção, será integrado com sistema de autenticação seguro.

## 🎨 Identidade Visual

- **Cores Principais**:
  - Fundo escuro (pharmacy-dark1)
  - Elementos secundários (pharmacy-dark2)
  - Botões e destaques (pharmacy-accent, teal-500)
  - Textos e ícones (pharmacy-green1, pharmacy-green2)

## 📱 Responsividade

A aplicação é totalmente responsiva, adaptando-se a diferentes tamanhos de tela:
- Desktop (1024px+)
- Tablet (768px-1023px)
- Mobile (< 768px)

## 🔄 Fluxos Principais

1. **Login** → **Dashboard** → **Clientes/Produtos/Campanhas**
2. **Atendimento**: Receber mensagem → Consultar histórico → Verificar produtos → Confirmar venda
3. **Recompra**: Identificar clientes em período de recompra → Enviar lembretes → Confirmar disponibilidade

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---

Desenvolvido com �� por Equipe Sairá
