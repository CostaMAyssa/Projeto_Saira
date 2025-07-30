#!/bin/bash

echo "🔍 Verificando logs do Supabase Edge Functions..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
fi

# Navegar para o diretório do projeto
cd /Users/mayssaferreira/Documents/GitHub/green-pharmacy-chat

echo "📋 Verificando status do projeto Supabase..."
supabase status

echo ""
echo "📋 Listando funções disponíveis..."
supabase functions list

echo ""
echo "🔍 Verificando logs da função webhook-receiver..."
supabase functions logs webhook-receiver --limit 50

echo ""
echo "🔧 Tentando fazer deploy da função webhook-receiver..."
supabase functions deploy webhook-receiver

echo ""
echo "✅ Verificação concluída!"