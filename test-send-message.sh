#!/bin/bash

# 🧪 Teste da função send-message do Supabase
echo "🚀 Testando função send-message..."

curl -X POST https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/send-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc" \
  -d '{
    "conversationId": "70ccc69c-a83e-4004-b089-a177d38de321",
    "text": "Teste de mensagem via nova Evolution",
    "userId": "fe39cc23-b68b-4526-a514-c92b877cac0c",
    "evolutionInstance": "chat saira",
    "clientPhone": "556481365341",
    "clientName": "Mateus Correa | Automação & IA",
    "clientId": "f7792059-28de-40a2-8ee5-b55f79192a71"
  }'

echo ""
echo "✅ Teste concluído!"