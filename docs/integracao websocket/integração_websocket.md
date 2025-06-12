
Análise profunda da integração atual × documentação oficial Evolution API v2
==========================================================================

1. Configuração inicial (chaves, instância, modo global)  
• De acordo com a doc, basta **URL base + apikey**; instância só é exigida fora do modo global.  
• Seu `WhatsAppTab.tsx` grava corretamente `api_url`, `api_key`, `instance_name`, `global_mode`.  
✅-OK (seguindo o padrão da doc)

2. WebSocket
-----------
Requisitos segundo a doc:
a) Servidor com `WEBSOCKET_ENABLED=true` e, opcionalmente, `WEBSOCKET_GLOBAL_EVENTS=true`.  
b) Conexão via **Socket-IO** em `<API_URL>` (global) ou `<API_URL>/<instance>` (tradicional).  
c) Autenticação por **query param** `?apikey=…` (ou header).  
d) Eventos base: `MESSAGES_UPSERT`, `MESSAGES_UPDATE`, `MESSAGES_DELETE`, `CONNECTION_UPDATE`, `QRCODE_UPDATED`, etc.

Estado do seu código (`src/lib/websocket.ts`):
• 👍 Segue exatamente a regra b) (monta URL global/tradicional).  
• 👍 Passa `apikey` em `query` **e** em `extraHeaders` (redundante, mas aceitável).  
• 🔴 No **banner de UI** você indica que o servidor está com `WEBSOCKET_ENABLED=false`.  Enquanto não habilitar no back-end, _nenhum evento em tempo real chegará_, mesmo que o código esteja correto.  
• 🔴 Reconexão limitada a 5 tentativas com atraso de até 5 s – ok, mas depois disso o socket morre. A doc sugere reconectar indefinidamente.

3. Webhook
----------
A Evolution API exige que você **registre um webhook** se quiser receber eventos via HTTP em vez de WebSocket ou para instâncias sem modo global.  
• Você implementou `EvolutionApiService.setWebhook()` mas **nunca é chamado** após salvar as configurações.  
🟡 Resultado: caso o servidor esteja com WebSocket desabilitado, nenhum fallback HTTP é configurado.

4. Envio de mensagens
---------------------
• Você usa `/message/sendText/<instance>` (ou global) com método **POST** + JSON `{number, text}` e header `apikey`: idêntico ao exemplo oficial.  
✅-OK

5. Recebimento de mensagens
---------------------------
Fluxo esperado pela doc: `MESSAGES_UPSERT` → objeto `messages[].messages[].conversation`.  
Seu parser (`handleMessagesUpsert`) cobre `conversation` e `extendedTextMessage.text`.  
✅ Estrutura compatível.  
🔴 Mas, como o WebSocket não conecta, nada chega.

6. Sincronização & histórico
----------------------------
`fetchMessages(remoteJid)` chama `/chat/fetchMessages/<instance>` – exatamente o endpoint da doc.  
✅ Compatível.

O que **não** está em conformidade
----------------------------------
1. Servidor Evolution API com **WebSocket desabilitado** ➞ tempo real nunca funcionará.  
2. Webhook não é configurado automaticamente ➞ sem fallback.  
3. Reconexão limitada (opcional melhorar).  
4. Falta de verificação se o socket realmente abriu; você já adicionou um `setTimeout` de 5 s, mas deveria tentar configuração de webhook se falhar.

Recomendações objetivas
-----------------------
1. Back-end  
   • Definir `WEBSOCKET_ENABLED=true` e, se quiser modo global, `WEBSOCKET_GLOBAL_EVENTS=true`.  
   • Reiniciar a Evolution API.

2. Front-end  
   a) Após salvar/atualizar configurações no `WhatsAppTab`, chamar  
   ```ts
   await evolutionApi.setWebhook(`${window.location.origin}/api/evolution`, enabledEvents);
   ```  
   b) No `EvolutionSocket.connect`, remova `extraHeaders` (não são necessários) e aumente `reconnectionAttempts` para `Infinity`.

3. Fallback inteligente  
   • Se WebSocket não conectar em 5 s ➞ realizar `setWebhook()` para garantir eventos HTTP.  
   • Criar endpoint Next/Express `/api/evolution` que grave/repasse eventos para o frontend via Supabase Realtime ou SSE.

4. Logs & métricas  
   • Persistir falhas de conexão num cadastro interno para facilitar suporte.  
   • Exibir toast quando WebSocket cair definitivamente.

Próximos passos sugeridos
-------------------------
1. Habilitar WebSocket no servidor Evolution API e validar que `CONNECTION_UPDATE` chega.  
2. Implementar chamada automática de `setWebhook()` ao salvar configurações (caso use instância tradicional).  
3. Adicionar testes de integração (Jest + nock) simulando eventos `MESSAGES_UPSERT`.  
4. Considerar separar responsabilidades:  
   - `EvolutionSocket` apenas recebe eventos.  
   - `EvolutionApiService` apenas envia/gera side-effects REST.

Isso garantirá aderência completa à documentação e mensagens em tempo real funcionando.
