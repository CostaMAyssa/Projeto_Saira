sairasistema's Project

main
Production


Connect
Feedback





sairasistema

Edge Functions
Manage
Functions
Secrets
Edge Functions
webhook-receiver
Docs

Download

Test
Overview
Invocations
Logs
Code
Details
Search events


Last 24 hours

Severity

Chart

Explore via query
Jul 29, 2025, 07:00pm
Jul 30, 2025, 07:04pm
shutdown
shutdown
🔥 [req_1753909029553_2nbimk1zp] Body lido com sucesso
🔥 [req_1753909029553_2nbimk1zp] Instância recebida: undefined
🔥 [req_1753909029553_2nbimk1zp] Dados presentes: NÃO
🔥 [req_1753909029553_2nbimk1zp] --- 🚀 Iniciando Webhook Receiver ---
🔥 [req_1753909029553_2nbimk1zp] 🔚 Webhook sem dados essenciais (remoteJid). Ignorando.
🔥 [req_1753909029553_2nbimk1zp] Payload completo: undefined
🔥 [req_1753909029553_2nbimk1zp] Lendo body da requisição...
🔥 [req_1753909029553_2nbimk1zp] Headers: { accept: "*/*", "accept-encoding": "gzip", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985d1f-ea26-7fff-99b0-d0ca29dae013", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "9677c449e67a506f-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "109", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985d1f-ea26-7fff-99b0-d0ca29dae013", "user-agent": "curl/8.1.2", "x-amzn-trace-id": "Root=1-688a8725-29a4b1e17ead73d035c63e36", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.18", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753909029553_2nbimk1zp] Método: POST
🔥 [req_1753909029553_2nbimk1zp] === WEBHOOK RECEIVER INICIADO ===
🔥 [req_1753909029553_2nbimk1zp] URL: http://svkgfvfhmngcvfsjpero.supabase.co/webhook-receiver
Listening on http://localhost:9999/
booted (time: 29ms)
🔥 [req_1753909007666_3ik2npc33] 🔥 Erro fatal no processamento do webhook: SyntaxError: Unterminated string in JSON at position 120 (line 4 column 69) at parse (<anonymous>) at packageData (ext:deno_fetch/22_body.js:381:14) at consumeBody (ext:deno_fetch/22_body.js:247:12) at eventLoopTick (ext:core/01_core.js:168:7) at async Server.<anonymous> (file:///tmp/user_fn_svkgfvfhmngcvfsjpero_f1b87b87-c475-4189-bf07-75afde4b1dae_16/source/supabase/functions/webhook-receiver/index.ts:24:18) at async #respond (https://deno.land/std@0.208.0/http/server.ts:224:18)
🔥 [req_1753909007666_3ik2npc33] Stack trace: SyntaxError: Unterminated string in JSON at position 120 (line 4 column 69) at parse (<anonymous>) at packageData (ext:deno_fetch/22_body.js:381:14) at consumeBody (ext:deno_fetch/22_body.js:247:12) at eventLoopTick (ext:core/01_core.js:168:7) at async Server.<anonymous> (file:///tmp/user_fn_svkgfvfhmngcvfsjpero_f1b87b87-c475-4189-bf07-75afde4b1dae_16/source/supabase/functions/webhook-receiver/index.ts:24:18) at async #respond (https://deno.land/std@0.208.0/http/server.ts:224:18)
🔥 [req_1753909007666_3ik2npc33] Headers: { accept: "*/*", "accept-encoding": "gzip", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985d1f-943c-7222-8551-522df733793d", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "9677c3c06207506e-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "122", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985d1f-943c-7222-8551-522df733793d", "user-agent": "curl/8.1.2", "x-amzn-trace-id": "Root=1-688a870f-2aa91c884659d218738b27b6", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.140", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753909007666_3ik2npc33] Lendo body da requisição...
🔥 [req_1753909007666_3ik2npc33] === WEBHOOK RECEIVER INICIADO ===
🔥 [req_1753909007666_3ik2npc33] URL: http://svkgfvfhmngcvfsjpero.supabase.co/webhook-receiver
🔥 [req_1753909007666_3ik2npc33] Método: POST
Listening on http://localhost:9999/
booted (time: 23ms)
shutdown
🔥 [req_1753908818742_onkc7k78l] --- 🚀 Iniciando Webhook Receiver ---
🔥 [req_1753908818742_onkc7k78l] Body lido com sucesso
🔥 [req_1753908818742_onkc7k78l] 🔚 Webhook sem dados essenciais (remoteJid). Ignorando.
🔥 [req_1753908818742_onkc7k78l] Payload completo: undefined
🔥 [req_1753908818742_onkc7k78l] Instância recebida: chat saira
🔥 [req_1753908818742_onkc7k78l] Dados presentes: NÃO
🔥 [req_1753908818742_onkc7k78l] Lendo body da requisição...
🔥 [req_1753908818742_onkc7k78l] Headers: { accept: "*/*", "accept-encoding": "gzip", "accept-language": "*", apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985d1c-b224-782c-ace8-e5fb3b876584", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "9677bf2371de506c-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "258", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985d1c-b224-782c-ace8-e5fb3b876584", "sec-fetch-mode": "cors", "user-agent": "node", "x-amzn-trace-id": "Root=1-688a8652-32ec58b852bf11af32a30400", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.141", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753908818742_onkc7k78l] === WEBHOOK RECEIVER INICIADO ===
🔥 [req_1753908818742_onkc7k78l] Método: POST
🔥 [req_1753908818742_onkc7k78l] URL: http://svkgfvfhmngcvfsjpero.supabase.co/webhook-receiver
Listening on http://localhost:9999/
booted (time: 22ms)
shutdown
shutdown
🔥 [req_1753908669834_83q4986dl] Payload completo: undefined
🔥 [req_1753908669834_83q4986dl] Instância recebida: chat saira
🔥 [req_1753908669834_83q4986dl] 🔚 Webhook sem dados essenciais (remoteJid). Ignorando.
🔥 [req_1753908669834_83q4986dl] --- 🚀 Iniciando Webhook Receiver ---
🔥 [req_1753908669834_83q4986dl] Body lido com sucesso
🔥 [req_1753908669834_83q4986dl] Dados presentes: NÃO
🔥 [req_1753908669834_83q4986dl] Lendo body da requisição...
🔥 [req_1753908669834_83q4986dl] Headers: { accept: "*/*", "accept-encoding": "gzip", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985d1a-6d03-7298-b86a-0a028b05f33c", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "9677bb81a2c1506f-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "237", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985d1a-6d03-7298-b86a-0a028b05f33c", "user-agent": "curl/8.1.2", "x-amzn-trace-id": "Root=1-688a85bd-5962a9716ae2aa1c4cca1254", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.18", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753908669834_83q4986dl] Método: POST
🔥 [req_1753908669834_83q4986dl] URL: http://svkgfvfhmngcvfsjpero.supabase.co/webhook-receiver
🔥 [req_1753908669834_83q4986dl] === WEBHOOK RECEIVER INICIADO ===
Listening on http://localhost:9999/
booted (time: 21ms)
🔥 [req_1753908643653_bj8lq6ly6] Dados presentes: NÃO
🔥 [req_1753908643653_bj8lq6ly6] --- 🚀 Iniciando Webhook Receiver ---
🔥 [req_1753908643653_bj8lq6ly6] Body lido com sucesso
🔥 [req_1753908643653_bj8lq6ly6] Lendo body da requisição...
🔥 [req_1753908643653_bj8lq6ly6] Instância recebida: chat saira
🔥 [req_1753908643653_bj8lq6ly6] Headers: { accept: "*/*", "accept-encoding": "gzip", apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985d1a-02f0-708a-9a73-3a0fb71eb25e", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "9677badc25dc506f-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "342", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985d1a-02f0-708a-9a73-3a0fb71eb25e", "user-agent": "curl/8.1.2", "x-amzn-trace-id": "Root=1-688a85a3-4211cd63533f462b28212ae2", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.18", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753908643653_bj8lq6ly6] 🔚 Webhook sem dados essenciais (remoteJid). Ignorando.
🔥 [req_1753908643653_bj8lq6ly6] Payload completo: undefined
🔥 [req_1753908643653_bj8lq6ly6] URL: http://svkgfvfhmngcvfsjpero.supabase.co/webhook-receiver
🔥 [req_1753908643653_bj8lq6ly6] === WEBHOOK RECEIVER INICIADO ===
🔥 [req_1753908643653_bj8lq6ly6] Método: POST
Listening on http://localhost:9999/
booted (time: 20ms)
shutdown
🔥 [req_1753908155285_kpwsh3z34] 🔚 Webhook sem dados essenciais (remoteJid). Ignorando.
🔥 [req_1753908155285_kpwsh3z34] Payload completo: undefined
🔥 [req_1753908155285_kpwsh3z34] Instância recebida: chat saira
🔥 [req_1753908155285_kpwsh3z34] Body lido com sucesso
🔥 [req_1753908155285_kpwsh3z34] Dados presentes: NÃO
🔥 [req_1753908155285_kpwsh3z34] --- 🚀 Iniciando Webhook Receiver ---
🔥 [req_1753908155285_kpwsh3z34] Headers: { accept: "*/*", "accept-encoding": "gzip", "accept-language": "*", apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985d12-9286-746d-86ce-2b51f204ea83", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "9677aef0e731506f-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "258", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985d12-9286-746d-86ce-2b51f204ea83", "sec-fetch-mode": "cors", "user-agent": "node", "x-amzn-trace-id": "Root=1-688a83bb-0712245078e0afb53c2bff2c", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.137", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753908155285_kpwsh3z34] Lendo body da requisição...
🔥 [req_1753908155285_kpwsh3z34] === WEBHOOK RECEIVER INICIADO ===
🔥 [req_1753908155285_kpwsh3z34] Método: POST
🔥 [req_1753908155285_kpwsh3z34] URL: http://svkgfvfhmngcvfsjpero.supabase.co/webhook-receiver
Listening on http://localhost:9999/
booted (time: 29ms)
shutdown
shutdown
🔥 [req_1753906319681_f6xoy5nbk] ❌ Erro: Configurações não encontradas nem como evolution_instance_name nem como instance_name para chat saira .
🔥 [req_1753906319681_f6xoy5nbk] Resultado do fallback: { fallbackSettings: null, fallbackError: { code: "42703", details: null, hint: null, message: "column settings.instance_name does not exist" } }
🔥 [req_1753906319681_f6xoy5nbk] Tentando fallback com instance_name...
🔥 [req_1753906319681_f6xoy5nbk] ❌ Erro: Configurações ou user_id não encontrados para a instância chat saira . { code: "PGRST116", details: "The result contains 0 rows", hint: null, message: "JSON object requested, multiple (or no) rows returned" }
🔥 [req_1753906319681_f6xoy5nbk] Resultado da query settings: { settings: null, settingsError: { code: "PGRST116", details: "The result contains 0 rows", hint: null, message: "JSON object requested, multiple (or no) rows returned" } }
🔥 [req_1753906319681_f6xoy5nbk] ⚙️ Buscando usuário para a instância: chat saira
🔥 [req_1753906319681_f6xoy5nbk] Cliente Supabase criado
🔥 [req_1753906319681_f6xoy5nbk] Executando query na tabela settings...
🔥 [req_1753906319681_f6xoy5nbk] PushName: Teste Manual
🔥 [req_1753906319681_f6xoy5nbk] Instância recebida: chat saira
🔥 [req_1753906319681_f6xoy5nbk] MessageTimestamp: 1703097600
🔥 [req_1753906319681_f6xoy5nbk] Payload completo: { "key": { "remoteJid": "5564992019427@s.whatsapp.net", "fromMe": false, "id": "test_manual_123" }, "pushName": "Teste Manual", "message": { "conversation": "Teste manual do webhook - chat saira" }, "messageTimestamp": 1703097600 }
🔥 [req_1753906319681_f6xoy5nbk] RemoteJid: 5564992019427@s.whatsapp.net
🔥 [req_1753906319681_f6xoy5nbk] Criando cliente Supabase...
🔥 [req_1753906319681_f6xoy5nbk] Body lido com sucesso
🔥 [req_1753906319681_f6xoy5nbk] FromMe: false
🔥 [req_1753906319681_f6xoy5nbk] Dados presentes: SIM
🔥 [req_1753906319681_f6xoy5nbk] Key extraída: { remoteJid: "5564992019427@s.whatsapp.net", fromMe: false, id: "test_manual_123" }
🔥 [req_1753906319681_f6xoy5nbk] --- 🚀 Iniciando Webhook Receiver ---
🔥 [req_1753906319681_f6xoy5nbk] 💬 Mensagem para Teste Manual (5564992019427)
🔥 [req_1753906319681_f6xoy5nbk] Lendo body da requisição...
🔥 [req_1753906319681_f6xoy5nbk] Headers: { accept: "*/*", "accept-encoding": "gzip", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985cf6-90cb-7640-8402-c79cac82d8a4", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "967782215628506e-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "352", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985cf6-90cb-7640-8402-c79cac82d8a4", "user-agent": "curl/8.1.2", "x-amzn-trace-id": "Root=1-688a7c8f-6217b93851e9d2c51f372ac9", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.142", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753906319681_f6xoy5nbk] Método: POST
🔥 [req_1753906319681_f6xoy5nbk] URL: http://svkgfvfhmngcvfsjpero.supabase.co/webhook-receiver
🔥 [req_1753906319681_f6xoy5nbk] === WEBHOOK RECEIVER INICIADO ===
Listening on http://localhost:9999/
booted (time: 28ms)
🔥 [req_1753906303323_p4vmyph1l] Resultado do fallback: { fallbackSettings: null, fallbackError: { code: "42703", details: null, hint: null, message: "column settings.instance_name does not exist" } }
🔥 [req_1753906303323_p4vmyph1l] ❌ Erro: Configurações não encontradas nem como evolution_instance_name nem como instance_name para chat saira .
🔥 [req_1753906303323_p4vmyph1l] ❌ Erro: Configurações ou user_id não encontrados para a instância chat saira . { code: "PGRST116", details: "The result contains 0 rows", hint: null, message: "JSON object requested, multiple (or no) rows returned" }
🔥 [req_1753906303323_p4vmyph1l] Tentando fallback com instance_name...
🔥 [req_1753906303323_p4vmyph1l] Resultado da query settings: { settings: null, settingsError: { code: "PGRST116", details: "The result contains 0 rows", hint: null, message: "JSON object requested, multiple (or no) rows returned" } }
🔥 [req_1753906303323_p4vmyph1l] ⚙️ Buscando usuário para a instância: chat saira
🔥 [req_1753906303323_p4vmyph1l] Cliente Supabase criado
🔥 [req_1753906303323_p4vmyph1l] Executando query na tabela settings...
🔥 [req_1753906303323_p4vmyph1l] RemoteJid: 5564992019427@s.whatsapp.net
🔥 [req_1753906303323_p4vmyph1l] 💬 Mensagem para Teste Webhook Saira (5564992019427)
🔥 [req_1753906303323_p4vmyph1l] --- 🚀 Iniciando Webhook Receiver ---
🔥 [req_1753906303323_p4vmyph1l] FromMe: false
🔥 [req_1753906303323_p4vmyph1l] Instância recebida: chat saira
🔥 [req_1753906303323_p4vmyph1l] Key extraída: { remoteJid: "5564992019427@s.whatsapp.net", fromMe: false, id: "test_webhook_saira_123" }
🔥 [req_1753906303323_p4vmyph1l] Criando cliente Supabase...
🔥 [req_1753906303323_p4vmyph1l] Dados presentes: SIM
🔥 [req_1753906303323_p4vmyph1l] Body lido com sucesso
🔥 [req_1753906303323_p4vmyph1l] MessageTimestamp: 1703097600
🔥 [req_1753906303323_p4vmyph1l] Payload completo: { "key": { "remoteJid": "5564992019427@s.whatsapp.net", "fromMe": false, "id": "test_webhook_saira_123" }, "pushName": "Teste Webhook Saira", "message": { "conversation": "Teste webhook com instância chat saira - funcionando!" }, "messageTimestamp": 1703097600 }
🔥 [req_1753906303323_p4vmyph1l] PushName: Teste Webhook Saira
🔥 [req_1753906303323_p4vmyph1l] Lendo body da requisição...
🔥 [req_1753906303323_p4vmyph1l] Headers: { accept: "*/*", "accept-encoding": "gzip", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985cf6-4ff2-7a94-9ac5-e5695472435b", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "967781b986bf506f-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "384", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985cf6-4ff2-7a94-9ac5-e5695472435b", "user-agent": "curl/8.1.2", "x-amzn-trace-id": "Root=1-688a7c7f-5cb68e5d0b69b20347987a74", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.137", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753906303323_p4vmyph1l] Método: POST
🔥 [req_1753906303323_p4vmyph1l] URL: http://svkgfvfhmngcvfsjpero.supabase.co/webhook-receiver
🔥 [req_1753906303323_p4vmyph1l] === WEBHOOK RECEIVER INICIADO ===
Listening on http://localhost:9999/
booted (time: 22ms)
shutdown
🔥 [req_1753905527913_zy3e50g8w] ❌ Erro: Configurações não encontradas nem como evolution_instance_name nem como instance_name para green-pharmacy.
🔥 [req_1753905527913_zy3e50g8w] Resultado do fallback: { fallbackSettings: null, fallbackError: { code: "42703", details: null, hint: null, message: "column settings.instance_name does not exist" } }
🔥 [req_1753905527913_zy3e50g8w] Resultado da query settings: { settings: null, settingsError: { code: "PGRST116", details: "The result contains 0 rows", hint: null, message: "JSON object requested, multiple (or no) rows returned" } }
🔥 [req_1753905527913_zy3e50g8w] Tentando fallback com instance_name...
🔥 [req_1753905527913_zy3e50g8w] ❌ Erro: Configurações ou user_id não encontrados para a instância green-pharmacy. { code: "PGRST116", details: "The result contains 0 rows", hint: null, message: "JSON object requested, multiple (or no) rows returned" }
🔥 [req_1753905527913_zy3e50g8w] ⚙️ Buscando usuário para a instância: green-pharmacy
🔥 [req_1753905527913_zy3e50g8w] Executando query na tabela settings...
🔥 [req_1753905527913_zy3e50g8w] Cliente Supabase criado
🔥 [req_1753905527913_zy3e50g8w] Key extraída: { remoteJid: "5564992019427@s.whatsapp.net", fromMe: false, id: "test_1753905527305" }
🔥 [req_1753905527913_zy3e50g8w] Criando cliente Supabase...
🔥 [req_1753905527913_zy3e50g8w] PushName: Teste Webhook
🔥 [req_1753905527913_zy3e50g8w] FromMe: false
🔥 [req_1753905527913_zy3e50g8w] MessageTimestamp: 1753905527
🔥 [req_1753905527913_zy3e50g8w] RemoteJid: 5564992019427@s.whatsapp.net
🔥 [req_1753905527913_zy3e50g8w] 💬 Mensagem para Teste Webhook (5564992019427)
🔥 [req_1753905527913_zy3e50g8w] Lendo body da requisição...
🔥 [req_1753905527913_zy3e50g8w] Dados presentes: SIM
🔥 [req_1753905527913_zy3e50g8w] Body lido com sucesso
🔥 [req_1753905527913_zy3e50g8w] Headers: { accept: "*/*", "accept-encoding": "gzip", "accept-language": "*", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985cea-7b6b-7b3a-b278-456f238a9135", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "96776ecbe32f506c-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "245", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985cea-7b6b-7b3a-b278-456f238a9135", "sec-fetch-mode": "cors", "user-agent": "node", "x-amzn-trace-id": "Root=1-688a7977-1039630f50c25b7d0a704b01", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.140", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753905527913_zy3e50g8w] Instância recebida: green-pharmacy
🔥 [req_1753905527913_zy3e50g8w] Payload completo: { "key": { "remoteJid": "5564992019427@s.whatsapp.net", "fromMe": false, "id": "test_1753905527305" }, "pushName": "Teste Webhook", "message": { "conversation": "Teste de mensagem do webhook" }, "messageTimestamp": 1753905527 }
🔥 [req_1753905527913_zy3e50g8w] --- 🚀 Iniciando Webhook Receiver ---
🔥 [req_1753905527913_zy3e50g8w] === WEBHOOK RECEIVER INICIADO ===
🔥 [req_1753905527913_zy3e50g8w] URL: http://svkgfvfhmngcvfsjpero.supabase.co/webhook-receiver
🔥 [req_1753905527913_zy3e50g8w] Método: POST
Listening on http://localhost:9999/
booted (time: 24ms)
shutdown
🔥 [req_1753904022668_f5dzunblh] --- ✅ Webhook finalizado com sucesso ---
🔥 [req_1753904022668_f5dzunblh] ✅ Mensagem inserida com sucesso!
🔥 [req_1753904022668_f5dzunblh] Tempo total: 2269ms
🔥 [req_1753904022668_f5dzunblh] Dados da mensagem: { conversation_id: "b99a7f33-d0ac-4881-b230-69e95f21a1f0", content: "Teste para número correto às 4:33:42 PM", message_type: "text", sender: "client", media_url: null, media_type: null, file_name: null, file_size: null, sent_at: "2025-07-30T19:33:42.000Z", user_id: "fe39cc23-b68b-4526-a514-c92b877cac0c", from_me: false, message_id: "test_1753904022100", remote_jid: "556481140676@s.whatsapp.ne@s.whatsapp.net", instance_name: "chat saira", push_name: "Teste Sistema", raw_data: { key: { remoteJid: "556481140676@s.whatsapp.ne@s.whatsapp.net", fromMe: false, id: "test_1753904022100" }, message: { conversation: "Teste para número correto às 4:33:42 PM" }, messageTimestamp: 1753904022, pushName: "Teste Sistema", status: "RECEIVED" }, read_at: null }
🔥 [req_1753904022668_f5dzunblh] 💾 Inserindo mensagem no banco...
✅ Conversa existente encontrada: ID=b99a7f33-d0ac-4881-b230-69e95f21a1f0
✅ Cliente existente encontrado: Mayssa Ferreira (ID=2db4fe30-3b6e-467f-80fe-919888e77b97)
🔄 Buscando conversa para o cliente ID: 2db4fe30-3b6e-467f-80fe-919888e77b97
🔍 Buscando cliente pelo telefone: 556481140676
🔥 [req_1753904022668_f5dzunblh] Resultado da query settings: { settings: { user_id: "fe39cc23-b68b-4526-a514-c92b877cac0c" }, settingsError: null }
🔥 [req_1753904022668_f5dzunblh] ✅ Usuário da instância: fe39cc23-b68b-4526-a514-c92b877cac0c
🔥 [req_1753904022668_f5dzunblh] Executando query na tabela settings...
🔥 [req_1753904022668_f5dzunblh] ⚙️ Buscando usuário para a instância: chat saira
🔥 [req_1753904022668_f5dzunblh] Cliente Supabase criado
🔥 [req_1753904022668_f5dzunblh] RemoteJid: 556481140676@s.whatsapp.ne@s.whatsapp.net
🔥 [req_1753904022668_f5dzunblh] Payload completo: { "key": { "remoteJid": "556481140676@s.whatsapp.ne@s.whatsapp.net", "fromMe": false, "id": "test_1753904022100" }, "message": { "conversation": "Teste para número correto às 4:33:42 PM" }, "messageTimestamp": 1753904022, "pushName": "Teste Sistema", "status": "RECEIVED" }
🔥 [req_1753904022668_f5dzunblh] Dados presentes: SIM
🔥 [req_1753904022668_f5dzunblh] Instância recebida: chat saira
🔥 [req_1753904022668_f5dzunblh] PushName: Teste Sistema
🔥 [req_1753904022668_f5dzunblh] --- 🚀 Iniciando Webhook Receiver ---
🔥 [req_1753904022668_f5dzunblh] 💬 Mensagem para Teste Sistema (556481140676)
🔥 [req_1753904022668_f5dzunblh] FromMe: false
🔥 [req_1753904022668_f5dzunblh] Key extraída: { remoteJid: "556481140676@s.whatsapp.ne@s.whatsapp.net", fromMe: false, id: "test_1753904022100" }
🔥 [req_1753904022668_f5dzunblh] MessageTimestamp: 1753904022
🔥 [req_1753904022668_f5dzunblh] Criando cliente Supabase...
🔥 [req_1753904022668_f5dzunblh] Lendo body da requisição...
🔥 [req_1753904022668_f5dzunblh] Headers: { accept: "*/*", "accept-encoding": "gzip", "accept-language": "*", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985cd3-834d-782d-90b7-e9d256f5e95a", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "96774a0bb008506c-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "287", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985cd3-834d-782d-90b7-e9d256f5e95a", "sec-fetch-mode": "cors", "user-agent": "node", "x-amzn-trace-id": "Root=1-688a7396-1ae239544a65a8bd7bf3a0a2", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.142", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753904022668_f5dzunblh] Body lido com sucesso
🔥 [req_1753904022668_f5dzunblh] URL: http://svkgfvfhmngcvfsjpero.supabase.co/webhook-receiver
🔥 [req_1753904022668_f5dzunblh] === WEBHOOK RECEIVER INICIADO ===
🔥 [req_1753904022668_f5dzunblh] Método: POST
Listening on http://localhost:9999/
booted (time: 22ms)
shutdown
shutdown
🔥 [req_1753903043412_55xnw1v0x] Tempo total: 3670ms
🔥 [req_1753903043412_55xnw1v0x] ✅ Mensagem inserida com sucesso!
🔥 [req_1753903043412_55xnw1v0x] --- ✅ Webhook finalizado com sucesso ---
🔥 [req_1753903043412_55xnw1v0x] Dados da mensagem: { conversation_id: "17a363f8-3798-4ea0-af2a-e101d6fc7392", content: "Imagem de teste às 4:17:23 PM", message_type: "image", sender: "client", media_url: "https://svkgfvfhmngcvfsjpero.supabase.co/storage/v1/object/public/whatsapp-media/d9cd9de4-f232-4dde-8e19-c81936b02d2d/1753903045955_image_1753903043.jpg", media_type: "image/jpeg", file_name: "image_1753903043.jpg", file_size: 16434, sent_at: "2025-07-30T19:17:23.000Z", user_id: "fe39cc23-b68b-4526-a514-c92b877cac0c", from_me: false, message_id: "evolution_image_1753903043051", remote_jid: "5564920194270@s.whatsapp.net", instance_name: "chat saira", push_name: "Mayssa", raw_data: { key: { remoteJid: "5564920194270@s.whatsapp.net", fromMe: false, id: "evolution_image_1753903043051" }, pushName: "Mayssa", message: { imageMessage: { caption: "Imagem de teste às 4:17:23 PM", mimetype: "image/jpeg", url: "https://picsum.photos/400/300" } }, messageTimestamp: 1753903043 }, read_at: null }
✅ Mídia salva com sucesso: https://svkgfvfhmngcvfsjpero.supabase.co/storage/v1/object/public/whatsapp-media/d9cd9de4-f232-4dde-8e19-c81936b02d2d/1753903045955_image_1753903043.jpg
🔥 [req_1753903043412_55xnw1v0x] 💾 Inserindo mensagem no banco...
📤 Fazendo upload para Supabase Storage: d9cd9de4-f232-4dde-8e19-c81936b02d2d/1753903045955_image_1753903043.jpg
✅ Conversa existente encontrada: ID=17a363f8-3798-4ea0-af2a-e101d6fc7392
📥 Baixando mídia de: https://picsum.photos/400/300
✅ Cliente existente encontrado: Mayssa (ID=d9cd9de4-f232-4dde-8e19-c81936b02d2d)
🔄 Buscando conversa para o cliente ID: d9cd9de4-f232-4dde-8e19-c81936b02d2d
🔥 [req_1753903043412_55xnw1v0x] Resultado da query settings: { settings: { user_id: "fe39cc23-b68b-4526-a514-c92b877cac0c" }, settingsError: null }
🔍 Buscando cliente pelo telefone: 5564920194270
🔥 [req_1753903043412_55xnw1v0x] ✅ Usuário da instância: fe39cc23-b68b-4526-a514-c92b877cac0c
🔥 [req_1753903043412_55xnw1v0x] Executando query na tabela settings...
🔥 [req_1753903043412_55xnw1v0x] Cliente Supabase criado
🔥 [req_1753903043412_55xnw1v0x] ⚙️ Buscando usuário para a instância: chat saira
🔥 [req_1753903043412_55xnw1v0x] FromMe: false
🔥 [req_1753903043412_55xnw1v0x] Payload completo: { "key": { "remoteJid": "5564920194270@s.whatsapp.net", "fromMe": false, "id": "evolution_image_1753903043051" }, "pushName": "Mayssa", "message": { "imageMessage": { "caption": "Imagem de teste às 4:17:23 PM", "mimetype": "image/jpeg", "url": "https://picsum.photos/400/300" } }, "messageTimestamp": 1753903043 }
🔥 [req_1753903043412_55xnw1v0x] RemoteJid: 5564920194270@s.whatsapp.net
🔥 [req_1753903043412_55xnw1v0x] Instância recebida: chat saira
🔥 [req_1753903043412_55xnw1v0x] Key extraída: { remoteJid: "5564920194270@s.whatsapp.net", fromMe: false, id: "evolution_image_1753903043051" }
🔥 [req_1753903043412_55xnw1v0x] Body lido com sucesso
🔥 [req_1753903043412_55xnw1v0x] MessageTimestamp: 1753903043
🔥 [req_1753903043412_55xnw1v0x] Criando cliente Supabase...
🔥 [req_1753903043412_55xnw1v0x] --- 🚀 Iniciando Webhook Receiver ---
🔥 [req_1753903043412_55xnw1v0x] 💬 Mensagem para Mayssa (5564920194270)
🔥 [req_1753903043412_55xnw1v0x] PushName: Mayssa
🔥 [req_1753903043412_55xnw1v0x] Dados presentes: SIM
🔥 [req_1753903043412_55xnw1v0x] Headers: { accept: "*/*", "accept-encoding": "gzip", "accept-language": "*", apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985cc4-92cb-7abe-9ca6-16918f456abc", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "9677322470f9506c-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "321", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985cc4-92cb-7abe-9ca6-16918f456abc", "sec-fetch-mode": "cors", "user-agent": "node", "x-amzn-trace-id": "Root=1-688a6fc3-3bcf2838242833c4546dc470", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.141", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753903043412_55xnw1v0x] Lendo body da requisição...
🔥 [req_1753903043412_55xnw1v0x] Método: POST
🔥 [req_1753903043412_55xnw1v0x] === WEBHOOK RECEIVER INICIADO ===
🔥 [req_1753903043412_55xnw1v0x] URL: http://svkgfvfhmngcvfsjpero.supabase.co/webhook-receiver
Listening on http://localhost:9999/
booted (time: 22ms)
🔥 [req_1753903038013_x2wz96l2i] --- ✅ Webhook finalizado com sucesso ---
🔥 [req_1753903038013_x2wz96l2i] Tempo total: 3112ms
🔥 [req_1753903038013_x2wz96l2i] ✅ Mensagem inserida com sucesso!
🔥 [req_1753903038013_x2wz96l2i] Dados da mensagem: { conversation_id: "17a363f8-3798-4ea0-af2a-e101d6fc7392", content: "oii - teste às 4:17:17 PM", message_type: "text", sender: "client", media_url: null, media_type: null, file_name: null, file_size: null, sent_at: "2025-07-30T19:17:17.000Z", user_id: "fe39cc23-b68b-4526-a514-c92b877cac0c", from_me: false, message_id: "evolution_test_1753903037283", remote_jid: "5564920194270@s.whatsapp.net", instance_name: "chat saira", push_name: "Mayssa", raw_data: { key: { remoteJid: "5564920194270@s.whatsapp.net", fromMe: false, id: "evolution_test_1753903037283" }, pushName: "Mayssa", message: { conversation: "oii - teste às 4:17:17 PM" }, messageTimestamp: 1753903037 }, read_at: null }
🔥 [req_1753903038013_x2wz96l2i] 💾 Inserindo mensagem no banco...
✅ Nova conversa criada: ID=17a363f8-3798-4ea0-af2a-e101d6fc7392
🤔 Conversa não encontrada. Criando nova...
✅ Cliente criado com sucesso: ID=d9cd9de4-f232-4dde-8e19-c81936b02d2d
🔄 Buscando conversa para o cliente ID: d9cd9de4-f232-4dde-8e19-c81936b02d2d
🤔 Cliente não encontrado. Criando novo: Nome='Mayssa', Tel='5564920194270'
🔥 [req_1753903038013_x2wz96l2i] Resultado da query settings: { settings: { user_id: "fe39cc23-b68b-4526-a514-c92b877cac0c" }, settingsError: null }
🔥 [req_1753903038013_x2wz96l2i] ✅ Usuário da instância: fe39cc23-b68b-4526-a514-c92b877cac0c
🔍 Buscando cliente pelo telefone: 5564920194270
🔥 [req_1753903038013_x2wz96l2i] ⚙️ Buscando usuário para a instância: chat saira
🔥 [req_1753903038013_x2wz96l2i] Executando query na tabela settings...
🔥 [req_1753903038013_x2wz96l2i] Cliente Supabase criado
🔥 [req_1753903038013_x2wz96l2i] Dados presentes: SIM
🔥 [req_1753903038013_x2wz96l2i] Criando cliente Supabase...
🔥 [req_1753903038013_x2wz96l2i] Payload completo: { "key": { "remoteJid": "5564920194270@s.whatsapp.net", "fromMe": false, "id": "evolution_test_1753903037283" }, "pushName": "Mayssa", "message": { "conversation": "oii - teste às 4:17:17 PM" }, "messageTimestamp": 1753903037 }
🔥 [req_1753903038013_x2wz96l2i] Lendo body da requisição...
🔥 [req_1753903038013_x2wz96l2i] --- 🚀 Iniciando Webhook Receiver ---
🔥 [req_1753903038013_x2wz96l2i] MessageTimestamp: 1753903037
🔥 [req_1753903038013_x2wz96l2i] Headers: { accept: "*/*", "accept-encoding": "gzip", "accept-language": "*", apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985cc4-7d87-7bc1-a85c-2d09fb88e307", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "967732027293506c-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "242", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985cc4-7d87-7bc1-a85c-2d09fb88e307", "sec-fetch-mode": "cors", "user-agent": "node", "x-amzn-trace-id": "Root=1-688a6fbd-3cbed3e05cf2b2587a97003f", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.142", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753903038013_x2wz96l2i] Key extraída: { remoteJid: "5564920194270@s.whatsapp.net", fromMe: false, id: "evolution_test_1753903037283" }
🔥 [req_1753903038013_x2wz96l2i] 💬 Mensagem para Mayssa (5564920194270)
🔥 [req_1753903038013_x2wz96l2i] Body lido com sucesso
🔥 [req_1753903038013_x2wz96l2i] PushName: Mayssa
🔥 [req_1753903038013_x2wz96l2i] FromMe: false
🔥 [req_1753903038013_x2wz96l2i] Instância recebida: chat saira
🔥 [req_1753903038013_x2wz96l2i] RemoteJid: 5564920194270@s.whatsapp.net
🔥 [req_1753903038013_x2wz96l2i] URL: http://svkgfvfhmngcvfsjpero.supabase.co/webhook-receiver
🔥 [req_1753903038013_x2wz96l2i] === WEBHOOK RECEIVER INICIADO ===
🔥 [req_1753903038013_x2wz96l2i] Método: POST
Listening on http://localhost:9999/
booted (time: 21ms)
shutdown
🔥 [req_1753902724120_t8lk861ro] Body lido com sucesso
🔥 [req_1753902724120_t8lk861ro] Payload completo: undefined
🔥 [req_1753902724120_t8lk861ro] --- 🚀 Iniciando Webhook Receiver ---
🔥 [req_1753902724120_t8lk861ro] Lendo body da requisição...
🔥 [req_1753902724120_t8lk861ro] Dados presentes: NÃO
🔥 [req_1753902724120_t8lk861ro] Headers: { accept: "*/*", "accept-encoding": "gzip", "accept-language": "*", apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc", baggage: "sb-request-id=01985cbf-b31b-73ec-a1fb-908cc04098d3", "cdn-loop": "cloudflare; loops=1; subreqs=1", "cf-connecting-ip": "186.224.228.96", "cf-ew-via": "15", "cf-ray": "96772a5837285071-BSB", "cf-visitor": '{"scheme":"https"}', "cf-worker": "supabase.co", "content-length": "258", "content-type": "application/json", host: "edge-runtime.supabase.com", "sb-request-id": "01985cbf-b31b-73ec-a1fb-908cc04098d3", "sec-fetch-mode": "cors", "user-agent": "node", "x-amzn-trace-id": "Root=1-688a6e84-45e503121ad674ca226451a0", "x-forwarded-for": "186.224.228.96,186.224.228.96, 99.82.164.20", "x-forwarded-port": "443", "x-forwarded-proto": "https" }
🔥 [req_1753902724120_t8lk861ro] 🔚 Webhook sem dados essenciais (remoteJid). Ignorando.

Load older
Showing 300 results ### 📊 PROBLEMA IDENTIFICADO:
Analisando os logs, encontrei a causa raiz do problema:

1. 1.
   ✅ QUANDO FUNCIONAVA (19:17 - 4:17 PM):
   
   - Payloads JSON válidos chegavam ao webhook
   - Mensagens eram processadas com sucesso
   - Dados salvos corretamente no banco
2. 2.
   ❌ QUANDO PAROU (logs recentes):
   
   - JSON malformado : SyntaxError: Unterminated string in JSON at position 120
   - Payloads vazios : Payload completo: undefined
   - Dados essenciais ausentes : remoteJid não encontrado
### 🔧 SOLUÇÃO IMPLEMENTADA:
Criei o script `fix-webhook-corruption.sh` que:

1. 1.
   Desabilita o webhook corrompido
2. 2.
   Reinicia a instância para limpar cache
3. 3.
   Reconfigura o webhook com configurações limpas
4. 4.
   Testa o funcionamento