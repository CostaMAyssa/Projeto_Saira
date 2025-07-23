# Plano: Venda de Produtos Automatizada no Chat

## Objetivo
Permitir que o usuário registre vendas de produtos diretamente pelo chat, buscando produtos cadastrados, selecionando quantidade e associando a venda ao cliente da conversa.

---

## 1. Interface no Chat
- Adicionar botão “Vender Produto” no painel do chat (ex: ao lado do campo de mensagem ou no painel de detalhes do cliente).
- Ao clicar, abrir modal/popover com:
  - Campo de busca/autocomplete para pesquisar produtos cadastrados.
  - Lista de produtos filtrados conforme digitação.
  - Seleção de quantidade.
  - Botão “Adicionar à venda”.
- Permitir adicionar múltiplos produtos (mini-carrinho).
- Mostrar resumo dos produtos selecionados.
- Botão “Finalizar Venda”.

## 2. Registro da Venda
- Ao finalizar:
  - Criar registro de venda em nova tabela `sales` (ou `client_sales`):
    - `id`, `client_id`, `created_by`, `created_at`, `total` (opcional)
  - Para cada produto:
    - Inserir linha em tabela `sale_items`:
      - `sale_id`, `product_id`, `quantity`, `unit_price` (opcional)
  - Atualizar associação cliente-produto (`client_product_associations`) com nova data de compra.
  - Opcional: atualizar estoque do produto.

## 3. Feedback e Histórico
- Exibir mensagem de confirmação no chat (“Venda registrada com sucesso!”).
- Atualizar painel de produtos adquiridos do cliente.
- Permitir consultar histórico de vendas no painel do cliente.

## 4. Backend/Database
- Criar tabela `sales`:
  - `id` UUID PK
  - `client_id` UUID FK
  - `created_by` UUID FK (usuário)
  - `created_at` timestamp
  - `total` decimal (opcional)
- Criar tabela `sale_items`:
  - `id` UUID PK
  - `sale_id` UUID FK
  - `product_id` UUID FK
  - `quantity` int
  - `unit_price` decimal (opcional)
- Atualizar lógica de frontend/backend para registrar vendas e itens.

## 5. Integração com Chat
- Após venda, enviar mensagem automática no chat com resumo da venda.
- Permitir iniciar venda a partir de comando ou botão no chat.

## 6. Futuras Extensões
- Integração com pagamentos.
- Geração de recibo/nota.
- Lembretes automáticos de recompra.

---

**Próximos passos sugeridos:**
1. Criar as tabelas no banco (sales, sale_items).
2. Implementar modal de venda no chat.
3. Integrar backend para registrar vendas.
4. Atualizar UI/histórico do cliente. 



- Registro da venda (quem vendeu, para quem, quando, valor total)
- Itens da venda (quais produtos, quantidade, preço unitário)
- Atualização de estoque
- Associação cliente-produto (última compra)
- Pronto para integração com histórico, automação e futuras extensões

---

## **Schema SQL Sugerido**

### 1. Tabela de Vendas (`sales`)
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total NUMERIC(12,2) DEFAULT 0 -- opcional, pode ser calculado
);
```

### 2. Itens da Venda (`sale_items`)
```sql
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2), -- opcional, pode ser nulo se não usar preço
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Associação Cliente-Produto (opcional, para última compra)
```sql
CREATE TABLE client_product_associations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  product_id UUID NOT NULL REFERENCES products(id),
  last_purchase TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (client_id, product_id)
);
```

### 4. Atualização de Estoque (na tabela `products`)
- O campo `stock` já existe. Ao registrar a venda, subtrair a quantidade vendida.

---

## **Fluxo de Registro de Venda**
1. Criar registro em `sales` (cliente, usuário, data).
2. Para cada produto vendido, criar linha em `sale_items` (produto, quantidade, preço).
3. Atualizar o estoque do produto.
4. Atualizar/registrar associação cliente-produto com a data da venda.
5. (Opcional) Calcular e salvar o total da venda.

---

##  Vantagens desse modelo
Permite histórico detalhado de vendas por cliente e produto.
Suporta múltiplos produtos por venda.
Pronto para integrações futuras (pagamento, recibo, automação).
Fácil de consultar vendas, produtos mais vendidos, clientes recorrentes, etc.