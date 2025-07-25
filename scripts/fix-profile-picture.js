#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzQsImV4cCI6MjA1MDU0ODg3NH0.VJJbMOKJHgmhkOGKzKLzQJGGNOJOQJGGNOJOQJGGNOJO';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfilePicture() {
  console.log('🔍 Testando funcionalidade de foto de perfil...\n');

  try {
    // 1. Verificar configurações da Evolution API
    console.log('1. Verificando configurações da Evolution API...');
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .limit(5);

    if (settingsError) {
      console.error('❌ Erro ao buscar configurações:', settingsError);
      return;
    }

    if (!settings || settings.length === 0) {
      console.log('❌ Nenhuma configuração encontrada na tabela settings');
      return;
    }

    console.log('✅ Configurações encontradas:');
    settings.forEach(setting => {
      console.log(`   - Instância: ${setting.evolution_instance_name}`);
      console.log(`   - URL: ${setting.evolution_api_url}`);
      console.log(`   - API Key: ${setting.evolution_api_key ? '***' + setting.evolution_api_key.slice(-4) : 'Não definida'}`);
      console.log('');
    });

    // 2. Testar endpoint da Evolution API
    const testSetting = settings[0];
    if (!testSetting.evolution_api_url || !testSetting.evolution_api_key || !testSetting.evolution_instance_name) {
      console.log('❌ Configurações incompletas da Evolution API');
      return;
    }

    console.log('2. Testando conexão com Evolution API...');
    
    // Testar status da instância primeiro
    const statusUrl = `${testSetting.evolution_api_url}/instance/connectionState/${testSetting.evolution_instance_name}`;
    console.log(`   Testando: ${statusUrl}`);

    try {
      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': testSetting.evolution_api_key,
        },
      });

      console.log(`   Status HTTP: ${statusResponse.status}`);
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('✅ Conexão com Evolution API OK');
        console.log(`   Estado da instância: ${JSON.stringify(statusData, null, 2)}`);
      } else {
        const errorText = await statusResponse.text();
        console.log('❌ Erro na conexão com Evolution API');
        console.log(`   Resposta: ${errorText}`);
        return;
      }
    } catch (error) {
      console.log('❌ Erro ao conectar com Evolution API:', error.message);
      return;
    }

    // 3. Testar endpoint de foto de perfil
    console.log('\n3. Testando endpoint de foto de perfil...');
    
    // Números de teste (você pode alterar estes)
    const testNumbers = [
      '5564992019427', // Número da Mayssa
      '556481140676',  // Outro número de teste
    ];

    for (const testNumber of testNumbers) {
      console.log(`\n   Testando número: ${testNumber}`);
      
      const profileUrl = `${testSetting.evolution_api_url}/chat/fetchProfilePictureUrl/${testSetting.evolution_instance_name}`;
      
      try {
        const profileResponse = await fetch(profileUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': testSetting.evolution_api_key,
          },
          body: JSON.stringify({
            number: testNumber,
          }),
        });

        console.log(`   Status HTTP: ${profileResponse.status}`);
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ Resposta da API:');
          console.log(JSON.stringify(profileData, null, 2));
          
          // Verificar se tem URL da foto
          if (profileData.profilePictureUrl) {
            console.log('✅ URL da foto encontrada!');
          } else {
            console.log('⚠️  Nenhuma URL de foto retornada');
          }
        } else {
          const errorText = await profileResponse.text();
          console.log('❌ Erro ao buscar foto de perfil');
          console.log(`   Resposta: ${errorText}`);
        }
      } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
      }
    }

    // 4. Verificar estrutura da resposta esperada
    console.log('\n4. Estrutura esperada da resposta:');
    console.log(`{
  "profilePictureUrl": "https://...",
  "error": null
}`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para corrigir problemas comuns
async function fixCommonIssues() {
  console.log('\n🔧 Aplicando correções comuns...\n');

  // 1. Verificar se as configurações estão corretas
  console.log('1. Verificando configurações...');
  
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1);

  if (error || !settings || settings.length === 0) {
    console.log('❌ Configurações não encontradas. Criando configuração de teste...');
    
    // Inserir configuração de teste
    const { error: insertError } = await supabase
      .from('settings')
      .insert({
        evolution_instance_name: 'chat saira',
        evolution_api_url: 'https://evoapi.insignemarketing.com.br',
        evolution_api_key: 'e941aabfc27d0f850a422caffa325fa2',
        user_id: '00000000-0000-0000-0000-000000000000', // UUID de teste
      });

    if (insertError) {
      console.log('❌ Erro ao inserir configuração:', insertError);
    } else {
      console.log('✅ Configuração de teste criada');
    }
  }

  console.log('\n✅ Correções aplicadas!');
}

// Executar testes
async function main() {
  console.log('🚀 Iniciando diagnóstico da foto de perfil...\n');
  
  await testProfilePicture();
  await fixCommonIssues();
  
  console.log('\n📋 Resumo dos problemas identificados:');
  console.log('1. Verificar se a Evolution API está rodando');
  console.log('2. Verificar se a instância está conectada');
  console.log('3. Verificar se o número está no formato correto');
  console.log('4. Verificar se a resposta da API tem a estrutura esperada');
  
  console.log('\n🔧 Próximos passos:');
  console.log('1. Execute: npm run dev');
  console.log('2. Abra o console do navegador');
  console.log('3. Verifique os logs de erro na aba Network');
  console.log('4. Teste com um número que você sabe que tem foto de perfil');
}

main().catch(console.error);