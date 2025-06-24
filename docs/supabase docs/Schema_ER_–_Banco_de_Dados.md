# Schema ER – Banco de Dados

---

![er_diagram.png](attachment:29fafcaa-892a-4420-9d80-e222452488d7:er_diagram.png)

> **Atenção: Relações com a Tabela `auth.users`**
>
> É **crucial** que todas as colunas que referenciam um usuário (`user_id`, `created_by`, `assigned_to`) tenham sua chave estrangeira (Foreign Key) apontando para a tabela `auth.users`, que é a tabela de autenticação interna do Supabase.
>
> **NUNCA** relacione estas colunas com a tabela `public.users` (se ela existir). Um erro comum é o Supabase criar a relação com `public.users` por padrão se a tabela `auth` não for especificada explicitamente no schema.

**Nota sobre Gerenciamento de Usuários:**
Este sistema utiliza o sistema de autenticação integrado do Supabase. Todas as referências a IDs de usuário (como `user_id`, `created_by`, `assigned_to`, etc.) em todas as tabelas são chaves estrangeiras que apontam para a coluna `id` da tabela `auth.users`, gerenciada pelo Supabase.

## TABELAS PRINCIPAIS

### `clients`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador único |
| `name` | string | Nome completo |
| `phone` | string | Número de WhatsApp |
| `email` | string | Email (opcional) |
| `status` | string | `ativo`, `inativo` |
| `tags` | string[] | Lista de tags |
| `created_by` | UUID | FK para `auth.users(id)`. ID do usuário que cadastrou. |
| `is_vip` | boolean | Cliente VIP? |
| `profile_type` | string | `regular`, `occasional`, `vip` |
| `birth_date` | date | Data de nascimento |
| `last_purchase` | timestamp | Última compra registrada |
| `created_at` | timestamp | Data de criação |

---

### `settings`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador único (PK). Gerado automaticamente com `uuid_generate_v4()`. |
| `user_id` | UUID | FK para `auth.users(id)`. **ÚNICO**. Associa a configuração a um usuário. |
| `evolution_api_url` | TEXT | URL da API da Evolution. |
| `evolution_api_key` | TEXT | Chave de autenticação da API. |
| `evolution_instance_name` | TEXT | Nome da instância da Evolution. |
| `global_mode` | BOOLEAN | Modo global ativado/desativado. |
| `created_at` | TIMESTAMPTZ | Data de criação. |
| `updated_at` | TIMESTAMPTZ | Data de atualização. |

**Observação:** Esta tabela possui RLS (Row Level Security) ativada, garantindo que um usuário só pode acessar e gerenciar a sua própria linha de configuração.

---

### `conversations`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador único da conversa |
| `client_id` | UUID | FK para `clients.id` |
| `assigned_to` | UUID | FK para `auth.users(id)` (usuário responsável). |
| `status` | string | `active`, `closed`, `waiting` |
| `started_at` | timestamp | Início da conversa |
| `last_message_at` | timestamp | Data da última mensagem (para ordenação) |

---

### `messages`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador único da mensagem |
| `conversation_id` | UUID | FK para `conversations.id` |
| `content` | text | Conteúdo da mensagem |
| `sender` | text | `'user'` (farmácia) ou `'client'` |
| `sent_at` | timestamp | Data/hora do envio da mensagem |

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
| `created_by` | UUID | FK para `auth.users(id)`. Usuário responsável. |
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
| `created_by` | UUID | FK para `auth.users(id)`. Usuário criador. |

---

### `form_responses`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador único |
| `form_id` | UUID | FK para `forms.id` |
| `response` | JSON | Resposta do formulário |
| `submitted_at` | timestamp | Data/hora da submissão |