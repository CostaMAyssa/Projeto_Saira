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