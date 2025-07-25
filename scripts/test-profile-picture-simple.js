#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente do .env.local
config({ path: '.env.local' });

// Configuração do Supabase usando as variáveis do .env.local
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.log('Verifique se o arquivo .env.local existe e tem as variáveis:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error.message);
      return null;
    }

    console.log('✅ Conexão com Supabase OK');
    return data;
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error.message);
    return null;
  }
}

async function getEvolutionSettings() {
  console.log('\n📋 Buscando configurações da Evolution API...');
  
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    .limit(5);

  if (error) {
    console.error('❌ Erro ao buscar configurações:', error.message);
    return null;
  }

  if (!settings || settings.length === 0) {
    console.log('❌ Nenhuma configuração encontrada na tabela settings');
    return null;
  }

  console.log('✅ Configurações encontradas:');
  settings.forEach((setting, index) => {
    console.log(`\n   Configuração ${index + 1}:`);
    console.log(`   - Instância: ${setting.evolution_instance_name || 'Não definida'}`);
    console.log(`   - URL: ${setting.evolution_api_url || 'Não definida'}`);
    console.log(`   - API Key: ${setting.evolution_api_key ? '***' + setting.evolution_api_key.slice(-4) : 'Não definida'}`);
    console.log(`   - User ID: ${setting.user_id || 'Não definido'}`);
  });

  return settings[0]; // Retorna a primeira configuração
}

async function testEvolutionAPI(config) {
  if (!config || !config.evolution_api_url || !config.evolution_api_key || !config.evolution_instance_name) {
    console.log('❌ Configurações da Evolution API incompletas');
    return;
  }

  console.log('\n🚀 Testando Evolution API...');

  try {
    // 1. Testar status da instância
    console.log('\n1. Verificando status da instância...');
    const statusUrl = `${config.evolution_api_url}/instance/connectionState/${config.evolution_instance_name}`;
    console.log(`   URL: ${statusUrl}`);

    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.evolution_api_key,
      },
    });

    console.log(`   Status HTTP: ${statusResponse.status}`);
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Status da instância:');
      console.log(JSON.stringify(statusData, null, 2));
    } else {
      const errorText = await statusResponse.text();
      console.log('❌ Erro no status da instância:');
      console.log(errorText);
      return;
    }

    // 2. Testar endpoint de foto de perfil
    console.log('\n2. Testando endpoint de foto de perfil...');
    
    const testNumbers = [
      '5564992019427', // Número da Mayssa
      '556481140676',  // Outro número
    ];

    for (const testNumber of testNumbers) {
      console.log(`\n   🔍 Testando número: ${testNumber}`);
      
      const profileUrl = `${config.evolution_api_url}/chat/fetchProfilePictureUrl/${config.evolution_instance_name}`;
      console.log(`   URL: ${profileUrl}`);
      
      try {
        const profileResponse = await fetch(profileUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': config.evolution_api_key,
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
          
          // Verificar diferentes campos possíveis
          const possibleFields = ['profilePictureUrl', 'url', 'picture', 'avatar', 'profilePicture'];
          let foundUrl = null;
          
          for (const field of possibleFields) {
            if (profileData[field]) {
              foundUrl = profileData[field];
              console.log(`✅ URL da foto encontrada no campo '${field}': ${foundUrl}`);
              break;
            }
          }
          
          if (!foundUrl) {
            console.log('⚠️  Nenhuma URL de foto encontrada nos campos esperados');
            console.log('   Campos disponíveis:', Object.keys(profileData));
          }
        } else {
          const errorText = await profileResponse.text();
          console.log('❌ Erro ao buscar foto de perfil:');
          console.log(errorText);
        }
      } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
      }
    }

    // 3. Testar diferentes formatos de número
    console.log('\n3. Testando diferentes formatos de número...');
    
    const numberFormats = [
      '5564992019427',     // Formato original
      '+5564992019427',    // Com código do país
      '64992019427',       // Sem código do país
      '5564992019427@c.us', // Formato WhatsApp
    ];

    for (const format of numberFormats) {
      console.log(`\n   🔍 Testando formato: ${format}`);
      
      try {
        const response = await fetch(`${config.evolution_api_url}/chat/fetchProfilePictureUrl/${config.evolution_instance_name}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': config.evolution_api_key,
          },
          body: JSON.stringify({
            number: format,
          }),
        });

        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ Sucesso com formato: ${format}`);
          if (data.profilePictureUrl || data.url) {
            console.log(`   📸 Foto encontrada!`);
          }
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Falhou com formato: ${format}`);
          console.log(`   Erro: ${errorText}`);
        }
      } catch (error) {
        console.log(`   ❌ Erro com formato ${format}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral na Evolution API:', error);
  }
}

async function main() {
  console.log('🔍 Teste completo da foto de perfil\n');
  
  // 1. Testar conexão com Supabase
  const supabaseOk = await testSupabaseConnection();
  if (!supabaseOk) {
    console.log('\n❌ Não foi possível conectar com o Supabase. Verifique as configurações.');
    return;
  }
  
  // 2. Buscar configurações da Evolution API
  const evolutionConfig = await getEvolutionSettings();
  if (!evolutionConfig) {
    console.log('\n❌ Não foi possível obter configurações da Evolution API.');
    return;
  }
  
  // 3. Testar Evolution API
  await testEvolutionAPI(evolutionConfig);
  
  console.log('\n📋 Resumo:');
  console.log('1. Se a instância estiver conectada, o problema pode ser:');
  console.log('   - Formato do número incorreto');
  console.log('   - Campo de resposta diferente do esperado');
  console.log('   - Número não tem foto de perfil');
  console.log('2. Se a instância não estiver conectada:');
  console.log('   - Verificar se o WhatsApp está conectado');
  console.log('   - Verificar configurações da Evolution API');
  
  console.log('\n🔧 Próximos passos:');
  console.log('1. Execute: npm run dev');
  console.log('2. Teste no navegador com console aberto');
  console.log('3. Verifique os logs de erro na aba Network');
}

main().catch(console.error);