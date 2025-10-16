# Diagnóstico de Webhooks - Evolution API

## ✅ **PROBLEMA RESOLVIDO**

**Sintoma**: Mensagens enviadas funcionam com a nova instância, mas mensagens recebidas ainda vêm da instância antiga.

**Causa**: Múltiplos webhooks ativos simultaneamente + falta de validação no backend.

**✅ SOLUÇÃO IMPLEMENTADA**: Validação de instância ativa no `webhook-receiver`.

## 📊 **Como Funciona AGORA**

### Para ENVIAR mensagens:
```
Sistema → Busca settings WHERE is_primary = true → Usa instância configurada
```

### Para RECEBER mensagens (✅ NOVO):
```
Evolution API → Webhook → webhook-receiver → 
🛡️ VALIDA se instância = instância primária → 
✅ Processa APENAS da instância ativa
❌ Ignora outras instâncias
```

## 🎯 **Configuração Atual**

- **Instância Nova**: `saira` (5517996810153) ✅ **ATIVA**
- **Instância Antiga**: `chat saira` (556481140676) ❌ **IGNORADA**
- **✅ RESOLVIDO**: Webhook-receiver filtra por instância ativa

## 🔧 **Implementação Técnica**

### Validação Adicionada no `webhook-receiver`:
```typescript
// 🛡️ NOVA VALIDAÇÃO: Verificar se a instância do webhook é a ativa no sistema
const { data: settings } = await supabase
  .from('settings')
  .select('instance_name, evolution_instance_name')
  .eq('is_primary', true)
  .single();

const activeInstance = settings.instance_name || settings.evolution_instance_name;

if (instance !== activeInstance) {
  console.log('🚫 Instância não ativa. Ignorando mensagem.');
  return; // Ignorar mensagem de instância não ativa
}
```

### Logs de Validação:
```
🛡️ Verificando se instância 'saira' está ativa no sistema...
🔍 Validação de instância: {
  webhook_instance: "saira",
  active_instance: "saira", 
  is_match: true
}
✅ Instância 'saira' está ativa. Processando mensagem...
```

## ✅ **Solução Finalizada**

### ~~Opção 1: Script Automático~~ (NÃO NECESSÁRIO)
~~O problema era de configuração de webhook~~

### ~~Opção 2: Manual via cURL~~ (NÃO NECESSÁRIO)
~~O problema era de configuração de webhook~~

### ✅ Opção 3: **IMPLEMENTADA - Validação no Backend**

1. **Sistema de recebimento** agora funciona igual ao de envio
2. **Apenas instância primária** é processada 
3. **Backward compatibility** mantida
4. **Logs detalhados** para debugging

## 🔧 **Verificação Final**

✅ **FUNCIONANDO**: 

1. **Envie uma mensagem** do sistema → usa instância `saira`
2. **Responda do WhatsApp** → webhook processa apenas se vier da instância `saira`
3. **Mensagens de outras instâncias** → automaticamente ignoradas

## 📝 **Logs para Debug**

Para verificar o funcionamento:

```bash
# Logs do webhook-receiver (vai mostrar validação de instância)
source ~/.nvm/nvm.sh && nvm use 20
supabase functions logs webhook-receiver

# Buscar por:
# 🛡️ Verificando se instância
# 🔍 Validação de instância
# ✅ Instância ativa / 🚫 Instância ignorada
```

## ⚠️ **Pontos Importantes**

1. ✅ **Problema resolvido no código** - não precisa mais desativar webhooks manualmente
2. ✅ **Sistema de envio e recebimento** agora usam a MESMA lógica de instância
3. ✅ **Múltiplas instâncias podem ter webhook** - apenas a primária será processada
4. ✅ **Configuração**: `is_primary = true` na tabela `settings` para a instância `saira`

## 🎉 **Status Final**

- ✅ Webhook-receiver com **validação de instância ativa**
- ✅ Sistema de **envio** usa instância primária configurada
- ✅ Sistema de **recebimento** usa instância primária configurada
- ✅ Mensagens de instâncias não-ativas são **automaticamente ignoradas**
- ✅ **Logs detalhados** para monitoramento

---

**Data**: 11/08/2025  
**Problema**: ✅ **RESOLVIDO COM IMPLEMENTAÇÃO DE CÓDIGO**

### 🚀 **Como Funciona Agora:**

**Para qualquer nova instância:**
1. Configure ela como primária em **Configurações → WhatsApp**
2. Salve as configurações
3. **Automaticamente**: Sistema passa a usar apenas ela para envio E recebimento
4. Outras instâncias são ignoradas automaticamente

**✅ ZERO CONFIGURAÇÃO MANUAL DE WEBHOOKS NECESSÁRIA!** 