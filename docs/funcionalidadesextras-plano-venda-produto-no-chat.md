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