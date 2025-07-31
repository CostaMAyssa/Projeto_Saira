# Integração de Campanhas com n8n

## Visão Geral

Este documento descreve como integrar os 5 tipos de campanhas do sistema com workflows do n8n para automação completa.

## 5 Tipos de Campanhas

### 1. **Lembrete de Recompra** (`recompra`)
- **Objetivo**: Notificar clientes sobre medicamentos de uso contínuo
- **Trigger**: Baseado na data da última compra + intervalo do medicamento
- **Configuração**:
  ```json
  {
    "check_interval_days": 7,
    "advance_notice_days": 3,
    "product_types": ["uso_continuo", "controlado"]
  }
  ```

### 2. **Aniversário** (`aniversario`)
- **Objetivo**: Felicitar clientes no aniversário com desconto
- **Trigger**: Data de nascimento do cliente
- **Configuração**:
  ```json
  {
    "execution_time": "09:00",
    "discount_percentage": 10,
    "valid_hours": 24
  }
  ```

### 3. **Pós-venda** (`posvenda`)
- **Objetivo**: Acompanhar satisfação após compra
- **Trigger**: X dias após uma compra
- **Configuração**:
  ```json
  {
    "trigger_after_days": 3,
    "product_categories": ["medicamentos", "suplementos"],
    "max_follow_ups": 2
  }
  ```

### 4. **Reativação** (`reativacao`)
- **Objetivo**: Reconectar com clientes inativos
- **Trigger**: Clientes sem compra há X dias
- **Configuração**:
  ```json
  {
    "inactive_days": 30,
    "execution_frequency": "weekly",
    "special_offers": true
  }
  ```

### 5. **Promoção** (`promocao`)
- **Objetivo**: Divulgar ofertas especiais
- **Trigger**: Manual ou agendado
- **Configuração**:
  ```json
  {
    "discount_percentage": 20,
    "duration_days": 3,
    "target_products": [],
    "min_purchase_amount": 0
  }
  ```

## Estrutura dos Workflows no n8n

### Workflow Principal - Campaign Manager

```
1. Webhook Trigger (recebe eventos do Supabase)
   ↓
2. Switch Node (por tipo de campanha)
   ↓
3. Supabase Query (buscar dados necessários)
   ↓
4. Filter Node (aplicar regras de audiência)
   ↓
5. Message Personalization
   ↓
6. Evolution API Send
   ↓
7. Update Campaign Metrics
```

### Workflows Específicos por Tipo

#### 1. Workflow de Recompra
```
Cron Trigger (diário 08:00)
↓
Supabase: Buscar clientes com medicamentos de uso contínuo
↓
Calculate: Data última compra + intervalo medicamento
↓
Filter: Clientes que precisam recomprar em 3 dias
↓
Supabase: Verificar se campanha está ativa
↓
Personalize: Mensagem com nome e medicamento
↓
Evolution API: Enviar mensagem
↓
Supabase: Registrar envio e métricas
```

#### 2. Workflow de Aniversário
```
Cron Trigger (diário 09:00)
↓
Supabase: Buscar clientes com aniversário hoje
↓
Filter: Campanhas de aniversário ativas
↓
Personalize: Mensagem com nome e desconto
↓
Evolution API: Enviar mensagem
↓
Supabase: Registrar envio
↓
Wait 24h: Aguardar validade do desconto
↓
Supabase: Marcar desconto como expirado
```

#### 3. Workflow de Pós-venda
```
Webhook Trigger (nova compra registrada)
↓
Wait Node (3 dias)
↓
Supabase: Verificar se campanha pós-venda está ativa
↓
Supabase: Buscar dados da compra e cliente
↓
Personalize: Mensagem com produto comprado
↓
Evolution API: Enviar mensagem
↓
Supabase: Registrar follow-up
```

#### 4. Workflow de Reativação
```
Cron Trigger (semanal - segunda 10:00)
↓
Supabase: Buscar clientes inativos (>30 dias sem compra)
↓
Filter: Excluir clientes já contatados recentemente
↓
Supabase: Verificar campanhas de reativação ativas
↓
Personalize: Mensagem com ofertas especiais
↓
Evolution API: Enviar mensagem
↓
Supabase: Marcar cliente como "em reativação"
```

#### 5. Workflow de Promoção
```
Manual Trigger ou Webhook (campanha criada)
↓
Supabase: Buscar audiência baseada em tags
↓
Filter: Aplicar critérios de segmentação
↓
Personalize: Mensagem com produtos em promoção
↓
Evolution API: Enviar mensagem
↓
Supabase: Registrar envio da promoção
```

## Configuração no Frontend

### Campos Necessários no Modal de Campanha

1. **Tipo de Campanha**: Dropdown com os 5 tipos
2. **Nome**: Campo de texto
3. **Audiência**: Seletor de tags/critérios
4. **Agendamento**: Data/hora ou frequência
5. **Template de Mensagem**: Editor de texto com variáveis
6. **Status**: Ativo/Pausado/Agendado

### Integração com n8n

Quando uma campanha é criada/editada no frontend:

1. **Salvar no Supabase**: Dados da campanha na tabela `campaigns`
2. **Webhook para n8n**: Notificar criação/alteração
3. **Configurar Workflow**: n8n cria/atualiza workflow correspondente
4. **Retornar IDs**: n8n retorna `workflow_id` e `webhook_url`
5. **Atualizar Campanha**: Salvar IDs do n8n na campanha

## APIs de Integração

### Endpoint para Criar Workflow no n8n
```
POST /api/workflows
{
  "name": "Campanha Aniversário - {campaign_id}",
  "type": "aniversario",
  "config": {
    "execution_time": "09:00",
    "discount_percentage": 10
  },
  "supabase_campaign_id": "uuid"
}
```

### Webhook do Supabase para n8n
```
POST {n8n_webhook_url}
{
  "event": "campaign_trigger",
  "campaign_id": "uuid",
  "type": "aniversario",
  "client_data": {...},
  "config": {...}
}
```

## Métricas e Relatórios

### Dados Coletados
- Campanhas enviadas
- Taxa de resposta
- Taxa de conversão
- Tempo médio de resposta
- ROI por campanha

### Atualização de Métricas
```sql
UPDATE campaigns SET 
  execution_count = execution_count + 1,
  last_executed_at = NOW(),
  next_execution_at = (calculado baseado na frequência)
WHERE id = campaign_id;
```

## Variáveis de Template

### Variáveis Globais
- `{nome}`: Nome do cliente
- `{telefone}`: Telefone do cliente
- `{data}`: Data atual

### Variáveis por Tipo
- **Recompra**: `{medicamento}`, `{ultima_compra}`
- **Aniversário**: `{desconto}`, `{validade}`
- **Pós-venda**: `{produto}`, `{data_compra}`
- **Reativação**: `{dias_inativo}`, `{ofertas}`
- **Promoção**: `{produtos}`, `{desconto}`, `{validade}`

## Implementação por Fases

### Fase 1: Estrutura Base
- [ ] Criar tabela campaigns
- [ ] Implementar CRUD de campanhas
- [ ] Configurar webhooks básicos

### Fase 2: Workflows n8n
- [ ] Workflow de aniversário
- [ ] Workflow de pós-venda
- [ ] Integração com Evolution API

### Fase 3: Campanhas Avançadas
- [ ] Workflow de recompra
- [ ] Workflow de reativação
- [ ] Workflow de promoção

### Fase 4: Métricas e Otimização
- [ ] Dashboard de métricas
- [ ] A/B testing
- [ ] Relatórios automáticos

Builder

Manually stopped

Vou analisar como o sistema de tags funciona atualmente e como podemos implementar a funcionalidade de análise automática de mensagens para gerar tags. Baseado na minha análise anterior, vou explicar o estado atual e propor melhorias.

## Como Funciona Atualmente
### 1. Sistema de Tags Existente

src/services/dashboardService.ts 80 - 100

Agora vou examinar como as tags são gerenciadas no frontend:

src/components/clients/ClientCard.tsx 40 - 60

Agora vou examinar como as tags são criadas e gerenciadas no sistema de campanhas:

supabase/migrations/20240320000002_create_campaign_tags.sql 1 - 42

## Estado Atual do Sistema
Baseado na minha análise, aqui está como o sistema funciona atualmente:

### 1. Sistema de Tags Atual
Tags de Clientes:

- Armazenadas como array de strings ( string[] ) na tabela clients
- Gerenciadas manualmente através da interface de edição de clientes
- Exibidas nos cards de clientes e tabelas
- Função getAllClientTags() coleta todas as tags únicas dos clientes
Tags de Campanhas:

- Tabela separada tags com tipos: 'client', 'product', 'campaign'
- Relacionamento many-to-many com campanhas via campaign_tags
- Tags pré-definidas: VIP, Promoção, Fidelidade, Aniversário, etc.
### 2. Problemas Identificados
✅ O que funciona:

- Sistema básico de tags manuais para clientes
- Interface para visualizar e editar tags
- Sistema estruturado de tags para campanhas
❌ O que não funciona:

- Análise automática de mensagens - não existe
- Geração automática de tags - não implementada
- Integração entre tags de clientes e campanhas - desconectados
- Análise de conteúdo para classificação - ausente
## Proposta de Implementação
Vou criar um sistema de análise automática de mensagens que:

1. 1.
   Analisa o conteúdo das mensagens recebidas
2. 2.
   Identifica padrões e palavras-chave
3. 3.
   Gera tags automaticamente baseadas no conteúdo
4. 4.
   Conecta com o sistema de campanhas
### Implementação da Análise Automática

supabase/functions/message-analyzer/index.ts

Failed

Mayssa Ferreira

Copy

Delete

as automacoes serao feitas o backend no n8nRelatório de Campanhas

Desempenho geral das campanhas

Aniversário

0 enviadas, N/A respostas

N/A

Reativação

0 enviadas, N/A respostas

N/A

Reativação

0 enviadas, N/A respostas

N/A

Reativação

0 enviadas, N/A respostas

N/A

Aniversário

0 enviadas, N/A respostas

N/A

Aniversário

0 enviadas, N/A respostas

N/ARelatórios

Exportar

Taxa de Resposta

N/A

(Placeholder)

Tempo Médio de Resposta

N/A

(Placeholder)

Taxa de Conversão

N/A

(Placeholder)Campanhas e Automações

Nova Campanha

Buscar campanhas por nome, tipo ou status...

Nome

Tipo

Audiência

Agendamento

Status

Ações

Aniversário

Última execução: Nunca executado

Aniversário

client_id: "", count: 1, tags: ["NovaTagTeste","Ocasional","VIP","nova"]

Não agendado ou Manual

Ativa

Reativação

Última execução: Nunca executado

Reativação

client_id: "", count: 1, tags: ["may","VIP","Ocasional"]

Não agendado ou Manual

Ativa

Reativação

Última execução: Nunca executado

reativacao

count: "15 clientes"

Não agendado ou Manual

Ativa

Reativação

Última execução: Nunca executado

reativacao

count: "15 clientes"

Não agendado ou Manual

Ativa

Aniversário

Última execução: Nunca executado

Aniversário

count: "15 clientes"

Aniversário (automático)

Pausada

Aniversário

Última execução: Nunca executado

Aniversário

client_id: "7dc81cb1-df15-4588-b959-92e7493ccbfe", count: 1, tags: []

Não agendado ou Manual

Ativa

Pós-venda

Última execução: Nunca executado

Pós-venda

client_id: "7dc81cb1-df15-4588-b959-92e7493ccbfe", count: 1, tags: []

Não agendado ou Manual

Ativa

Exibindo 7 campanha(s) dai preciso saber se a forma , em texto somente , me responde aqui no chat oque precisamos fazer em texto no n8n pra essas autoamcoces funcionar Gatilhos por compra, agendamento por tipo de produto

○ Campanhas de pós-venda, aniversário e reativação

○ Performance com templates, pausas e métricasCadastro e organização por categorias

○ Sistema de tags (uso contínuo, antibótico, controlado)

○ Integração com lembretes automáticosCadastro, edição, visualização e segmentação

○ Tags de cliente, histórico de interações, status ativo/inativo

○ Mensagens programadas por cliente com opção de cancelamento

Builder

Analisando o sistema de campanhas e automações que você mostrou, vou explicar o que precisa ser implementado no n8n para fazer essas automações funcionarem:

## 1. Estrutura de Workflows no n8n
### Workflow Principal - Gerenciador de Campanhas
- Trigger : Webhook que recebe eventos do Supabase
- Nós de decisão : Verificar tipo de evento (nova compra, aniversário, cliente inativo)
- Conexão com Supabase : Para buscar dados de clientes, produtos e campanhas
### Workflow de Pós-Venda
```
Trigger: Nova compra registrada
↓
Buscar dados do cliente e produto
↓
Verificar se produto tem campanha pós-venda ativa
↓
Agendar mensagem (1 dia, 7 dias, 30 dias após compra)
↓
Enviar via Evolution API
↓
Registrar resultado no Supabase
```
### Workflow de Aniversário
```
Trigger: Cron job diário (00:00)
↓
Buscar clientes com aniversário hoje
↓
Filtrar por tags ativas e campanhas habilitadas
↓
Personalizar mensagem com nome do cliente
↓
Enviar via Evolution API
↓
Atualizar métricas da campanha
```
### Workflow de Reativação
## 2. Configurações Necessárias no n8n
### Credenciais
- Supabase : URL + Service Key
- Evolution API : URL + API Key da instância
- Webhook : URLs para receber eventos
### Variáveis Globais
- Templates de mensagens por tipo de campanha
- Intervalos de tempo para cada automação
- Configurações de horário de envio
## 3. Integrações Específicas
### Com o Sistema de Tags
- Buscar tags do cliente no Supabase
- Filtrar campanhas baseadas nas tags
- Atualizar tags automaticamente (ex: "reativacao_enviada")
### Com Métricas
- Registrar envios realizados
- Capturar respostas via webhook
- Calcular taxa de resposta e conversão
- Atualizar dashboard em tempo real
### Com Agendamentos
- Usar node "Schedule Trigger" para campanhas recorrentes
- "Wait" nodes para delays entre mensagens
- "DateTime" nodes para verificar horários comerciais
## 4. Fluxos de Dados
### Entrada de Dados
- Webhooks do Supabase (novas compras, clientes)
- Cron jobs para verificações periódicas
- Eventos manuais do dashboard
### Processamento
- Validação de regras de negócio
- Personalização de mensagens
- Verificação de limites e horários
### Saída
- Envio via Evolution API
- Atualização de métricas no Supabase
- Logs de execução
## 5. Implementação por Etapas
### Fase 1: Campanhas Básicas
- Pós-venda simples (1 mensagem após compra)
- Aniversário diário
- Reativação semanal
### Fase 2: Segmentação Avançada
- Filtros por tags
- Mensagens personalizadas por categoria
- Horários otimizados
### Fase 3: Métricas e Otimização**
- Tracking completo de respostas
- A/B testing de mensagens
- Relatórios automáticos
Quer que eu detalhe algum workflow específico ou precisa de mais informações sobre a implementação técnica de alguma parte?