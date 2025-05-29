# Schema ER – Banco de Dados

---

![er_diagram.png](attachment:29fafcaa-892a-4420-9d80-e222452488d7:er_diagram.png)

## TABELAS PRINCIPAIS

### `users`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador único |
| `name` | string | Nome do usuário |
| `email` | string | E-mail de login |
| `password_hash` | string | Hash da senha |
| `role` | string | `admin`, `agent` |
| `status` | string | `ativo`, `inativo` |
| `created_at` | timestamp | Data de criação |

---

### `clients`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador único |
| `name` | string | Nome completo |
| `phone` | string | Número de WhatsApp |
| `email` | string | Email (opcional) |
| `status` | string | `ativo`, `inativo` |
| `tags` | string[] | Lista de tags |
| `created_by` | UUID | ID do user que cadastrou |
| `is_vip` | boolean | Cliente VIP? |
| `profile_type` | string | `regular`, `occasional`, `vip` |
| `birth_date` | date | Data de nascimento |
| `last_purchase` | timestamp | Última compra registrada |
| `created_at` | timestamp | Data de criação |

---

### `messages`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador |
| `client_id` | UUID | Cliente relacionado |
| `conversation_id` | UUID | Conversa associada |
| `sender` | string | `user`, `client` |
| `type` | string | `text`, `image`, `file`, `audio` |
| `content` | text | Conteúdo da mensagem |
| `status` | string | `enviada`, `lida`, `erro` |
| `sent_at` | timestamp | Data/hora de envio |

---

### `campaigns`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador |
| `name` | string | Nome da campanha |
| `trigger` | string | `manual`, `aniversario`, `recorrente`, etc |
| `template` | text | Texto da campanha |
| `target_audience` | JSON | Regras de segmentação |
| `status` | string | `ativa`, `pausada`, `agendada` |
| `created_by` | UUID | Usuário responsável |
| `scheduled_for` | timestamp | Data de execução |

---

### `campaign_executions`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador único |
| `campaign_id` | UUID | Referência à campanha |
| `executed_at` | timestamp | Data da execução |
| `status` | string | `success`, `partial`, `failed` |
| `messages_sent` | int | Total de mensagens enviadas |

---

### `products`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador |
| `name` | string | Nome |
| `category` | string | `uso contínuo`, `antibiótico`, etc |
| `tags` | string[] | Tags associadas |
| `needs_prescription` | boolean | Requer receita médica |
| `controlled` | boolean | Controlado pela ANVISA? |
| `stock` | int | Quantidade em estoque |
| `interval` | int | Intervalo recomendado (dias) |
| `created_at` | timestamp | Cadastro |

---

### `client_product_associations`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador |
| `client_id` | UUID | Cliente |
| `product_id` | UUID | Produto |
| `frequency` | int | Dias entre compras |
| `last_purchase` | timestamp | Última compra |
| `next_reminder_due` | timestamp | Próximo lembrete |

---

### `forms`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador |
| `title` | string | Título |
| `fields` | JSON | Campos/pedidos |
| `redirect_url` | string | Página de "obrigado" |
| `status` | string | `ativo`, `inativo` |
| `question_count` | int | Total de questões |
| `created_by` | UUID | Usuário criador |

---

### `form_responses`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador |
| `form_id` | UUID | Formulário respondido |
| `client_id` | UUID | Cliente que respondeu |
| `answers` | JSON | Respostas |
| `submitted_at` | timestamp | Data de envio |
| `is_valid` | boolean | Resposta válida? |

---

### `conversations`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador |
| `client_id` | UUID | Cliente envolvido |
| `assigned_to` | UUID | Usuário responsável |
| `status` | string | `active`, `closed`, `waiting` |
| `started_at` | timestamp | Início da conversa |
| `closed_at` | timestamp | Encerramento |

---

### `tags`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador |
| `name` | string | Nome da tag |
| `type` | string | `client`, `product`, `campaign` |
| `color` | string | Cor para exibição |

---

## RELACIONAMENTOS ENTRE TABELAS

| Tabela Fonte | → Tabela Alvo | Tipo de Relação | Descrição |
| --- | --- | --- | --- |
| `users` | `campaigns` | 1:N | Um usuário pode criar várias campanhas |
| `users` | `forms` | 1:N | Um usuário pode criar vários formulários |
| `users` | `clients` | 1:N | Um usuário pode cadastrar vários clientes |
| `users` | `conversations` | 1:N | Um usuário pode ser responsável por várias conversas |

---

| Tabela Fonte | → Tabela Alvo | Tipo de Relação | Descrição |
| --- | --- | --- | --- |
| `clients` | `messages` | 1:N | Um cliente pode ter várias mensagens |
| `clients` | `form_responses` | 1:N | Um cliente pode responder vários formulários |
| `clients` | `conversations` | 1:N | Um cliente pode ter várias conversas |
| `clients` | `client_product_associations` | 1:N | Um cliente pode estar associado a vários produtos |

---

| Tabela Fonte | → Tabela Alvo | Tipo de Relação | Descrição |
| --- | --- | --- | --- |
| `campaigns` | `campaign_executions` | 1:N | Uma campanha pode ser executada várias vezes |
| `campaigns` | `messages` | 1:N | Uma campanha pode gerar várias mensagens (direto ou via execução) |

---

| Tabela Fonte | → Tabela Alvo | Tipo de Relação | Descrição |
| --- | --- | --- | --- |
| `forms` | `form_responses` | 1:N | Um formulário pode ter várias respostas |

---

| Tabela Fonte | → Tabela Alvo | Tipo de Relação | Descrição |
| --- | --- | --- | --- |
| `products` | `client_product_associations` | 1:N | Um produto pode estar vinculado a vários clientes (para lembretes de uso) |

---

| Tabela Fonte | Campo de Chave Estrangeira |
| --- | --- |
| `messages.client_id` | → `clients.id` |
| `messages.conversation_id` | → `conversations.id` |
| `messages.sender` | referenciado via lógica (não FK) |
| `campaigns.created_by` | → `users.id` |
| `forms.created_by` | → `users.id` |
| `clients.created_by` | → `users.id` |
| `form_responses.client_id` | → `clients.id` |
| `form_responses.form_id` | → `forms.id` |
| `conversations.client_id` | → `clients.id` |
| `conversations.assigned_to` | → `users.id` |
| `campaign_executions.campaign_id` | → `campaigns.id` |
| `client_product_associations.client_id` | → `clients.id` |
| `client_product_associations.product_id` | → `products.id` |

---

## VIEWS SQL

### `daily_conversations_view`

View para gráficos de conversas diárias (últimos 7 dias).

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `date` | date | Data do dia |
| `day_name` | string | Nome do dia da semana (`Dom`, `Seg`, etc) |
| `day_order` | int | Ordem do dia da semana (0=Dom, 1=Seg, etc) |
| `conversation_count` | int | Número de conversas iniciadas neste dia |

**Funcionalidade:** Agrega conversas por dia da semana dos últimos 7 dias, incluindo dias sem conversas (contagem = 0).

---

### `monthly_conversations_view`

View para gráficos de conversas mensais (últimos 6 meses).

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `month_start` | date | Primeiro dia do mês |
| `month_name` | string | Nome do mês (`Jan`, `Fev`, etc) |
| `month_order` | int | Número do mês (1-12) |
| `conversation_count` | int | Número de conversas iniciadas neste mês |

**Funcionalidade:** Agrega conversas por mês dos últimos 6 meses, incluindo meses sem conversas (contagem = 0).

---