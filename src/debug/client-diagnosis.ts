import { supabase } from '@/lib/supabase';

export const diagnoseClientsData = async () => {
  console.log('🔍 DIAGNÓSTICO: Verificando dados dos clientes...\n');
  
  try {
    // 1. Buscar todos os clientes SEM filtro de usuário
    const { data: allClients, error: allError } = await supabase
      .from('clients')
      .select('id, name, phone, created_by, email');
    
    if (allError) {
      console.error('❌ Erro ao buscar todos os clientes:', allError);
      return {
        error: allError,
        summary: 'Erro ao acessar dados'
      };
    }
    
    console.log(`📊 TOTAL DE CLIENTES NO BANCO: ${allClients.length}`);
    
    // 2. Verificar quantos têm created_by NULL
    const clientsWithoutOwner = allClients.filter(client => !client.created_by);
    console.log(`🚫 CLIENTES SEM DONO (created_by NULL): ${clientsWithoutOwner.length}`);
    
    if (clientsWithoutOwner.length > 0) {
      console.log('\n📋 CLIENTES ÓRFÃOS:');
      clientsWithoutOwner.forEach(client => {
        console.log(`  - ID: ${client.id} | Nome: ${client.name} | Tel: ${client.phone}`);
      });
    }
    
    // 3. Verificar telefones duplicados
    const phoneNumbers = allClients.map(c => c.phone);
    const duplicates = phoneNumbers.filter((phone, index) => phoneNumbers.indexOf(phone) !== index);
    
    if (duplicates.length > 0) {
      console.log(`\n📞 TELEFONES DUPLICADOS ENCONTRADOS: ${[...new Set(duplicates)].length}`);
      [...new Set(duplicates)].forEach(phone => {
        const clientsWithThisPhone = allClients.filter(c => c.phone === phone);
        console.log(`  - Telefone: ${phone}`);
        clientsWithThisPhone.forEach(client => {
          console.log(`    • ${client.name} (ID: ${client.id}) - created_by: ${client.created_by || 'NULL'}`);
        });
      });
    }
    
    // 4. Verificar usuário atual
    const { data: currentUser, error: userError } = await supabase.auth.getUser();
    if (currentUser && currentUser.user) {
      console.log(`\n👤 USUÁRIO ATUAL: ${currentUser.user.email} (ID: ${currentUser.user.id})`);
      
      // Verificar quantos clientes pertencem ao usuário atual
      const myClients = allClients.filter(client => client.created_by === currentUser.user.id);
      console.log(`📋 MEUS CLIENTES: ${myClients.length}`);
      
      // 🎯 NOVO: Verificar dados do usuário hardcoded antigo
      const LEGACY_USER_ID = '58ce41aa-d63d-4655-b1a1-9ee705e05c3a';
      const legacyClients = allClients.filter(client => client.created_by === LEGACY_USER_ID);
      if (legacyClients.length > 0) {
        console.log(`\n🔄 DADOS ANTIGOS ENCONTRADOS: ${legacyClients.length} registros do usuário hardcoded`);
        console.log('📦 Estes dados podem ser transferidos para você:');
        legacyClients.forEach(client => {
          console.log(`  - ${client.name} (${client.phone})`);
        });
      }
    } else {
      console.log('\n❌ USUÁRIO NÃO AUTENTICADO');
    }
    
    const LEGACY_USER_ID = '58ce41aa-d63d-4655-b1a1-9ee705e05c3a';
    const legacyClients = allClients.filter(client => client.created_by === LEGACY_USER_ID);
    
    return {
      totalClients: allClients.length,
      orphanClients: clientsWithoutOwner.length,
      duplicatePhones: [...new Set(duplicates)].length,
      orphanList: clientsWithoutOwner,
      duplicateList: duplicates.length > 0 ? [...new Set(duplicates)].map(phone => ({
        phone,
        clients: allClients.filter(c => c.phone === phone)
      })) : [],
      currentUserId: currentUser?.user?.id,
      legacyClients: legacyClients.length,
      needsTransfer: legacyClients.length > 0 && currentUser?.user?.id !== LEGACY_USER_ID
    };
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    return {
      error,
      summary: 'Erro durante diagnóstico'
    };
  }
};

// Função para corrigir dados órfãos atribuindo ao usuário atual
export const fixOrphanClients = async (userId: string) => {
  console.log('🔧 CORREÇÃO: Atribuindo clientes órfãos ao usuário atual...\n');
  
  try {
    const { data: orphanClients, error: fetchError } = await supabase
      .from('clients')
      .select('id, name, phone')
      .is('created_by', null);
    
    if (fetchError) {
      console.error('❌ Erro ao buscar clientes órfãos:', fetchError);
      return { error: fetchError };
    }
    
    if (orphanClients.length === 0) {
      console.log('✅ Nenhum cliente órfão encontrado!');
      return { fixed: 0 };
    }
    
    console.log(`🔧 Corrigindo ${orphanClients.length} clientes órfãos...`);
    
    const { data, error: updateError } = await supabase
      .from('clients')
      .update({ created_by: userId })
      .is('created_by', null)
      .select();
    
    if (updateError) {
      console.error('❌ Erro ao atualizar clientes órfãos:', updateError);
      return { error: updateError };
    }
    
    console.log(`✅ ${data.length} clientes órfãos corrigidos com sucesso!`);
    return { fixed: data.length };
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
    return { error };
  }
};

// 🎯 NOVA FUNÇÃO: Transferir dados do usuário hardcoded antigo
export const transferLegacyData = async (currentUserId: string) => {
  const LEGACY_USER_ID = '58ce41aa-d63d-4655-b1a1-9ee705e05c3a'; // ID hardcoded antigo
  
  console.log('🔄 TRANSFERÊNCIA: Movendo dados do usuário antigo para o atual...\n');
  
  try {
    // 1. Buscar todos os dados do usuário antigo
    const { data: legacyClients, error: fetchError } = await supabase
      .from('clients')
      .select('id, name, phone, email')
      .eq('created_by', LEGACY_USER_ID);
    
    if (fetchError) {
      console.error('❌ Erro ao buscar dados antigos:', fetchError);
      return { error: fetchError };
    }
    
    if (legacyClients.length === 0) {
      console.log('✅ Nenhum dado antigo encontrado para transferir!');
      return { transferred: 0 };
    }
    
    console.log(`📦 Encontrados ${legacyClients.length} registros para transferir:`);
    legacyClients.forEach(client => {
      console.log(`  - ${client.name} (${client.phone})`);
    });
    
    // 2. Transferir dados para o usuário atual
    const { data, error: updateError } = await supabase
      .from('clients')
      .update({ created_by: currentUserId })
      .eq('created_by', LEGACY_USER_ID)
      .select();
    
    if (updateError) {
      console.error('❌ Erro ao transferir dados:', updateError);
      return { error: updateError };
    }
    
    console.log(`✅ ${data.length} registros transferidos com sucesso!`);
    console.log('🎉 Agora todos os dados pertencem ao seu usuário!');
    
    return { transferred: data.length };
    
  } catch (error) {
    console.error('❌ Erro na transferência:', error);
    return { error };
  }
}; 