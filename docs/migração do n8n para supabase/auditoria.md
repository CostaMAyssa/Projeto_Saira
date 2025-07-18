Ótimo! Vou seguir exatamente o que pediu:  
- **Auditoria completa do fluxo no arquivo `Backend_Erick.json`**
- **Investigar todas as pastas dentro de `docs` para entender requisitos, payloads e integrações**
- **Criar um plano detalhado para migrar todo o backend do n8n para funções HTTP (Edge Functions) do Supabase, incluindo envio e recebimento de mensagens (texto, arquivos, imagens, áudios)**

---

# 🔎 Auditoria Completa do Fluxo n8n (`Backend_Erick.json`)

## **1. Envio de Mensagens (Frontend → n8n → Evolution API)**
- **Webhook**: Recebe POST do frontend com dados da mensagem (`conversationId`, `text`, `userId`, `evolutionInstance`, `clientPhone`, `clientName`, `clientId`).
- **Busca settings**: Consulta a tabela `settings` no Supabase para pegar as credenciais da Evolution API (url, api_key, instance_name) do usuário/instância.
- **POST Evolution API**: Envia a mensagem (texto, arquivo, áudio) para a Evolution API usando as credenciais.
- **Insere mensagem**: Registra a mensagem enviada na tabela `messages` do Supabase.

## **2. Recebimento de Mensagens (Evolution API → n8n → Supabase)**
- **Webhook**: Evolution API faz POST para o n8n com dados da mensagem recebida (texto, arquivo base64, áudio, imagem, etc).
- **Extrai dados**: Pega `remoteJid`, `conversation`, `messageTimestamp`, `pushName`, `fromMe`, `instance`, etc.
- **Identifica cliente/conversa**: Busca ou cria cliente e conversa no Supabase.
- **Insere mensagem**: Salva a mensagem recebida (com tipo e mídia) na tabela `messages`.

## **3. Tipos de Mensagem**
- **Texto**: Campo `conversation` ou similar.
- **Arquivo/Imagem/Áudio**: Vem em base64, precisa ser salvo no Supabase Storage e o link salvo na tabela `messages`.

---

# 📂 Auditoria das Pastas em `docs`

## **Principais arquivos relevantes:**
- **`docs/chat_e_n8n/Backend_Erick.json`**: Fluxo n8n detalhado (já auditado acima)
- **`docs/chat_e_n8n/fluxo.md`**: Explica o fluxo de ponta a ponta (WhatsApp → Evolution API → n8n → Supabase → Sistema)
- **`docs/chat_e_n8n/fluxo_n8n.md`**: Detalha os nós do n8n, payloads, e lógica de fallback
- **`docs/Plano Chat`**: Explica arquitetura, payloads, tabelas, e exemplos de integração
- **`docs/Worflowsupabase`**: Explica como o n8n faz a tradução dos dados da Evolution para o Supabase

## **Resumo dos Requisitos e Payloads**
- **Envio**: POST para Evolution API com texto, arquivo (base64 ou URL), áudio (base64 ou URL)
- **Recebimento**: Webhook recebe JSON com tipo da mensagem, base64, metadados, etc.
- **Tabelas**: `settings`, `clients`, `conversations`, `messages` (com campos para mídia)
- **Storage**: Arquivos grandes (áudio, imagem) devem ir para o Supabase Storage, salvar URL no banco

---

# 🛠️ **Plano Completo de Migração: Backend n8n → Supabase Functions**

## **1. Funções HTTP (Edge Functions) no Supabase**

### **A. Envio de Mensagens**
- **Endpoint:** `POST /functions/v1/send-message`
- **Payload:**  
  ```json
  {
    "conversationId": "...",
    "text": "...", // opcional
    "file": { "name": "...", "base64": "...", "type": "image/png" }, // opcional
    "audio": { "name": "...", "base64": "...", "type": "audio/ogg" }, // opcional
    "userId": "...",
    "evolutionInstance": "...",
    "clientPhone": "...",
    "clientName": "...",
    "clientId": "..."
  }
  ```
- **Lógica:**
  1. Buscar settings do usuário/instância no Supabase
  2. Se houver arquivo/áudio, salvar no Supabase Storage e obter URL
  3. Montar payload conforme documentação Evolution API (texto, arquivo, áudio)
  4. Fazer POST para Evolution API (endpoint correto para cada tipo)
  5. Salvar mensagem enviada na tabela `messages` (com URL do arquivo/áudio se aplicável)
  6. Retornar status/sucesso/erro

### **B. Recebimento de Mensagens (Webhook Evolution API)**
- **Endpoint:** `POST /functions/v1/receive-message`
- **Payload:**  
  Conforme Evolution API:  
  ```json
  {
    "event": "messages.upsert",
    "instance": "...",
    "data": {
      "key": { "remoteJid": "...", "fromMe": false, ... },
      "pushName": "...",
      "message": {
        "conversation": "...", // texto
        "imageMessage": { "mimetype": "...", "jpegThumbnail": "...", "url": "...", "fileSha256": "...", "fileLength": ... }, // imagem
        "audioMessage": { "mimetype": "...", "url": "...", "fileSha256": "...", "fileLength": ... }, // áudio
        "documentMessage": { "mimetype": "...", "url": "...", "fileSha256": "...", "fileLength": ... }, // arquivo
        // outros tipos...
      },
      "messageTimestamp": 1234567890,
      ...
    }
  }
  ```
- **Lógica:**
  1. Extrair dados principais (tipo, base64/url, remetente, timestamp, etc)
  2. Se for mídia (imagem, áudio, arquivo), baixar ou decodificar base64 e salvar no Supabase Storage
  3. Buscar ou criar cliente/conversa no Supabase
  4. Salvar mensagem na tabela `messages` (com URL da mídia se aplicável)
  5. Retornar 200 OK

---

## **2. Estrutura das Tabelas**

- **`settings`**: credenciais Evolution API por usuário/instância
- **`clients`**: clientes do WhatsApp
- **`conversations`**: conversas ativas
- **`messages`**: mensagens (campos: id, conversation_id, content, sender, sent_at, media_url, media_type, file_name, file_size, transcription, caption, etc)

---

## **3. Supabase Storage**

- **Bucket:** `whatsapp-media`
- **Organização:** `/user_id/instance_name/{type}/{filename}`
- **Salvar:** arquivos, imagens, áudios recebidos/enviados

---

## **4. Segurança**

- **Autenticação:**  
  - Envio: validar userId/token
  - Recebimento: validar secret/token do Evolution API (opcional)
- **Validação de payloads**: tipos, tamanho, formato

---

## **5. Observações Importantes**

- **Retry/Fila:** Para arquivos grandes, considerar lógica de retry ou fila
- **Logs:** Salvar logs de erro/sucesso para auditoria
- **Notificações:** Opcional, notificar usuário em caso de erro de envio

---

# 🚀 **Resumo do Plano de Migração**

1. **Criar função HTTP `/send-message`**  
   - Recebe texto, arquivo, áudio  
   - Salva mídia no Storage  
   - Faz POST Evolution API  
   - Salva mensagem no banco

2. **Criar função HTTP `/receive-message`**  
   - Recebe webhook Evolution API  
   - Salva mídia no Storage  
   - Cria cliente/conversa se necessário  
   - Salva mensagem no banco

3. **Ajustar frontend para chamar as novas funções do Supabase**

4. **Testar todos os fluxos (texto, arquivo, áudio, imagem)**

5. **Desativar webhooks do n8n após migração**

---

Se quiser, posso já começar a gerar o esqueleto das funções do Supabase (em TypeScript) e exemplos de payloads para cada caso!  
Se quiser detalhamento de algum ponto (exemplo de payload Evolution, estrutura de Storage, etc), só avisar!
