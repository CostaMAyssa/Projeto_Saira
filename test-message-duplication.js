#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDAwMDAsImV4cCI6MjA2OTQ3NjAwMH0.test';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testando duplicação de mensagens...\n');

// Função para testar se há mensagens duplicadas
async function testMessageDuplication() {
  try {
    // Buscar todas as mensagens
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('sent_at', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      return;
    }

    console.log(`📊 Total de mensagens: ${messages.length}`);

    // Verificar duplicações por ID
    const messageIds = messages.map(m => m.id);
    const uniqueIds = new Set(messageIds);
    
    if (messageIds.length !== uniqueIds.size) {
      console.log('⚠️ DUPLICAÇÕES ENCONTRADAS POR ID!');
      console.log(`   Total: ${messageIds.length}`);
      console.log(`   Únicos: ${uniqueIds.size}`);
      console.log(`   Duplicados: ${messageIds.length - uniqueIds.size}`);
    } else {
      console.log('✅ Nenhuma duplicação por ID encontrada');
    }

    // Verificar duplicações por conteúdo e timestamp
    const contentGroups = {};
    messages.forEach(msg => {
      const key = `${msg.content}_${msg.sent_at}_${msg.sender}`;
      if (!contentGroups[key]) {
        contentGroups[key] = [];
      }
      contentGroups[key].push(msg);
    });

    const duplicates = Object.values(contentGroups).filter(group => group.length > 1);
    
    if (duplicates.length > 0) {
      console.log('⚠️ DUPLICAÇÕES ENCONTRADAS POR CONTEÚDO!');
      duplicates.forEach((group, index) => {
        console.log(`   Grupo ${index + 1}:`);
        group.forEach(msg => {
          console.log(`     ID: ${msg.id}, Conteúdo: "${msg.content}", Timestamp: ${msg.sent_at}`);
        });
      });
    } else {
      console.log('✅ Nenhuma duplicação por conteúdo encontrada');
    }

    // Verificar mensagens recentes
    const recentMessages = messages.filter(m => {
      const messageTime = new Date(m.sent_at);
      const now = new Date();
      const diffHours = (now - messageTime) / (1000 * 60 * 60);
      return diffHours < 1; // Última hora
    });

    console.log(`\n📱 Mensagens da última hora: ${recentMessages.length}`);
    recentMessages.forEach(msg => {
      console.log(`   ${msg.sent_at}: "${msg.content}" (${msg.sender})`);
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testMessageDuplication(); 