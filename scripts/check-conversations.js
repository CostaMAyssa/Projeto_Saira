// Script para verificar as conversas ativas no banco de dados e mensagens de venda

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para verificar as mensagens de venda em uma conversa
 */
async function verificarMensagensVenda(conversationId) {
  try {
    console.log(`\n=== MENSAGENS DE VENDA NA CONVERSA ${conversationId} ===`);
    
    // Buscar mensagens que contêm "Venda registrada com sucesso"
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .ilike('content', '%Venda registrada com sucesso%')
      .order('sent_at', { ascending: false });
    
    if (messagesError) {
      console.error('Erro ao buscar mensagens de venda:', messagesError);
      return;
    }
    
    if (messages && messages.length > 0) {
      console.log(`Encontradas ${messages.length} mensagens de venda`);
      
      for (const msg of messages) {
        console.log('\n-----------------------------------');
        console.log(`Data: ${new Date(msg.sent_at).toLocaleString()}`);
        console.log(`Conteúdo:\n${msg.content}`);
        console.log('-----------------------------------');
      }
    } else {
      console.log('Nenhuma mensagem de venda encontrada nesta conversa.');
    }
    
    console.log('=========================');
  } catch (error) {
    console.error('Erro ao verificar mensagens de venda:', error);
  }
}

/**
 * Função para verificar as conversas ativas
 */
async function verificarConversas() {
  try {
    // Primeiro, verificar a estrutura da tabela de conversas
    console.log('=== ESTRUTURA DA TABELA DE CONVERSAS ===');
    const { data: columns, error: columnsError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (columnsError) {
      console.error('Erro ao buscar estrutura da tabela:', columnsError);
      return;
    }
    
    if (columns && columns.length > 0) {
      console.log('Colunas disponíveis:', Object.keys(columns[0]));
    } else {
      console.log('Nenhuma conversa encontrada para verificar a estrutura.');
    }
    
    // Buscar todas as conversas
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, client_id')
      .limit(10);
    
    if (convError) {
      console.error('Erro ao buscar conversas:', convError);
      return;
    }
    
    console.log('\n=== CONVERSAS ATIVAS ===');
    console.log(`Total de conversas encontradas: ${conversations.length}`);
    
    for (const conv of conversations) {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('name')
        .eq('id', conv.client_id)
        .single();
      
      if (clientError) {
        console.log(`Conversa ${conv.id}: Cliente não encontrado (ID: ${conv.client_id})`);
      } else {
        console.log(`Conversa ${conv.id}: ${client.name} (ID: ${conv.client_id})`);
      }
      
      // Verificar mensagens de venda para esta conversa
      await verificarMensagensVenda(conv.id);
    }
    console.log('=========================');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

/**
 * Função para extrair produtos de uma mensagem de venda
 */
function extrairProdutosDaMensagem(mensagem) {
  const produtos = [];
  const linhas = mensagem.split('\n');
  let capturandoProdutos = false;
  
  for (const linha of linhas) {
    if (linha.includes('*Itens:*')) {
      capturandoProdutos = true;
      continue;
    }
    
    if (capturandoProdutos && linha.trim().startsWith('-')) {
      // Formato esperado: "- Nome do Produto (X unid.)"
      const produtoMatch = linha.match(/- (.+) \((\d+) unid\.\)/);
      if (produtoMatch) {
        produtos.push({
          nome: produtoMatch[1],
          quantidade: parseInt(produtoMatch[2], 10)
        });
      }
    }
  }
  
  return produtos;
}

/**
 * Função para verificar todas as mensagens de venda no sistema
 */
async function verificarTodasMensagensVenda() {
  try {
    console.log('\n=== TODAS AS MENSAGENS DE VENDA NO SISTEMA ===');
    
    // Buscar mensagens que contêm "Venda registrada com sucesso"
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('conversation_id, content, sent_at')
      .ilike('content', '%Venda registrada com sucesso%')
      .order('sent_at', { ascending: false })
      .limit(20);
    
    if (messagesError) {
      console.error('Erro ao buscar mensagens de venda:', messagesError);
      return;
    }
    
    if (messages && messages.length > 0) {
      console.log(`Encontradas ${messages.length} mensagens de venda no sistema`);
      
      // Estatísticas de produtos vendidos
      const produtosVendidos = {};
      
      for (const msg of messages) {
        // Buscar informações da conversa
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('client_id')
          .eq('id', msg.conversation_id)
          .single();
        
        if (convError) {
          console.log(`\n--- Mensagem de venda na conversa ${msg.conversation_id} (conversa não encontrada) ---`);
        } else {
          // Buscar informações do cliente
          const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('name')
            .eq('id', conversation.client_id)
            .single();
          
          if (clientError) {
            console.log(`\n--- Mensagem de venda na conversa ${msg.conversation_id} (cliente não encontrado) ---`);
          } else {
            console.log(`\n--- Mensagem de venda na conversa ${msg.conversation_id} (Cliente: ${client.name}) ---`);
          }
        }
        
        console.log(`Data: ${new Date(msg.sent_at).toLocaleString()}`);
        console.log(`Conteúdo:\n${msg.content}`);
        
        // Extrair produtos vendidos
        const produtos = extrairProdutosDaMensagem(msg.content);
        if (produtos.length > 0) {
          console.log('Produtos identificados:');
          for (const produto of produtos) {
            console.log(`  - ${produto.nome}: ${produto.quantidade} unidades`);
            
            // Atualizar estatísticas
            if (!produtosVendidos[produto.nome]) {
              produtosVendidos[produto.nome] = {
                quantidade: 0,
                vendas: 0
              };
            }
            produtosVendidos[produto.nome].quantidade += produto.quantidade;
            produtosVendidos[produto.nome].vendas += 1;
          }
        }
        
        console.log('-----------------------------------');
      }
      
      // Exibir estatísticas de produtos vendidos
      console.log('\n=== ESTATÍSTICAS DE PRODUTOS VENDIDOS ===');
      const produtosOrdenados = Object.entries(produtosVendidos)
        .sort((a, b) => b[1].quantidade - a[1].quantidade);
      
      for (const [nome, stats] of produtosOrdenados) {
        console.log(`${nome}: ${stats.quantidade} unidades em ${stats.vendas} vendas`);
      }
    } else {
      console.log('Nenhuma mensagem de venda encontrada no sistema.');
    }
    
    console.log('=========================');
  } catch (error) {
    console.error('Erro ao verificar todas as mensagens de venda:', error);
  }
}

/**
 * Função para verificar as vendas registradas no banco de dados
 */
async function verificarVendasRegistradas() {
  try {
    console.log('\n=== VENDAS REGISTRADAS NO BANCO DE DADOS ===');
    
    // Buscar vendas registradas
    const { data: vendas, error: vendasError } = await supabase
      .from('sales')
      .select('id, client_id, created_at, created_by')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (vendasError) {
      console.error('Erro ao buscar vendas:', vendasError);
      return;
    }
    
    if (vendas && vendas.length > 0) {
      console.log(`Encontradas ${vendas.length} vendas registradas`);
      
      for (const venda of vendas) {
        console.log('\n-----------------------------------');
        console.log(`Venda ID: ${venda.id}`);
        console.log(`Data: ${new Date(venda.created_at).toLocaleString()}`);
        
        // Buscar informações do cliente
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('name')
          .eq('id', venda.client_id)
          .single();
        
        if (clientError) {
          console.log(`Cliente: Não encontrado (ID: ${venda.client_id})`);
        } else {
          console.log(`Cliente: ${client.name} (ID: ${venda.client_id})`);
        }
        
        // Buscar itens da venda
        const { data: itens, error: itensError } = await supabase
          .from('sale_items')
          .select('product_id, quantity')
          .eq('sale_id', venda.id);
        
        if (itensError) {
          console.error('Erro ao buscar itens da venda:', itensError);
          continue;
        }
        
        console.log(`Itens: ${itens.length}`);
        
        // Buscar informações dos produtos
        for (const item of itens) {
          const { data: produto, error: produtoError } = await supabase
            .from('products')
            .select('name')
            .eq('id', item.product_id)
            .single();
          
          if (produtoError) {
            console.log(`  - Produto não encontrado (ID: ${item.product_id}), Quantidade: ${item.quantity}`);
          } else {
            console.log(`  - ${produto.name} (ID: ${item.product_id}), Quantidade: ${item.quantity}`);
          }
        }
        
        // Buscar mensagens de venda relacionadas
        const { data: conversas, error: conversasError } = await supabase
          .from('conversations')
          .select('id')
          .eq('client_id', venda.client_id);
        
        if (!conversasError && conversas && conversas.length > 0) {
          let mensagemEncontrada = false;
          
          for (const conversa of conversas) {
            const { data: mensagens, error: mensagensError } = await supabase
              .from('messages')
              .select('content, sent_at')
              .eq('conversation_id', conversa.id)
              .ilike('content', '%Venda registrada com sucesso%')
              .order('sent_at', { ascending: false })
              .limit(5);
            
            if (!mensagensError && mensagens && mensagens.length > 0) {
              for (const msg of mensagens) {
                const dataMsg = new Date(msg.sent_at);
                const dataVenda = new Date(venda.created_at);
                
                // Verificar se a mensagem foi enviada próximo à data da venda (até 5 minutos de diferença)
                const diffMinutos = Math.abs((dataMsg.getTime() - dataVenda.getTime()) / (1000 * 60));
                
                if (diffMinutos <= 5) {
                  console.log('\nMensagem de venda encontrada:');
                  console.log(`Data da mensagem: ${dataMsg.toLocaleString()}`);
                  console.log(`Diferença: ${diffMinutos.toFixed(2)} minutos`);
                  mensagemEncontrada = true;
                  break;
                }
              }
            }
            
            if (mensagemEncontrada) break;
          }
          
          if (!mensagemEncontrada) {
            console.log('\nNenhuma mensagem de venda encontrada para esta venda.');
          }
        } else {
          console.log('\nNão foi possível verificar mensagens de venda (nenhuma conversa encontrada).');
        }
      }
    } else {
      console.log('Nenhuma venda registrada encontrada.');
    }
    
    console.log('=========================');
  } catch (error) {
    console.error('Erro ao verificar vendas registradas:', error);
  }
}

/**
 * Função para criar mensagens de venda para vendas sem mensagens
 */
async function criarMensagensVenda() {
  try {
    console.log('\n=== CRIANDO MENSAGENS DE VENDA FALTANTES ===');
    
    // Buscar vendas registradas
    const { data: vendas, error: vendasError } = await supabase
      .from('sales')
      .select('id, client_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (vendasError) {
      console.error('Erro ao buscar vendas:', vendasError);
      return;
    }
    
    if (!vendas || vendas.length === 0) {
      console.log('Nenhuma venda encontrada para criar mensagens.');
      return;
    }
    
    let mensagensCriadas = 0;
    
    for (const venda of vendas) {
      // Buscar conversas do cliente
      const { data: conversas, error: conversasError } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', venda.client_id);
      
      if (conversasError || !conversas || conversas.length === 0) {
        console.log(`Nenhuma conversa encontrada para o cliente da venda ${venda.id}`);
        continue;
      }
      
      // Verificar se já existe mensagem de venda
      let mensagemExistente = false;
      
      for (const conversa of conversas) {
        const { data: mensagens, error: mensagensError } = await supabase
          .from('messages')
          .select('id')
          .eq('conversation_id', conversa.id)
          .ilike('content', '%Venda registrada com sucesso%')
          .limit(1);
        
        if (!mensagensError && mensagens && mensagens.length > 0) {
          mensagemExistente = true;
          break;
        }
      }
      
      if (mensagemExistente) {
        console.log(`Venda ${venda.id} já possui mensagem de confirmação.`);
        continue;
      }
      
      // Buscar itens da venda
      const { data: itens, error: itensError } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', venda.id);
      
      if (itensError || !itens || itens.length === 0) {
        console.log(`Venda ${venda.id} não possui itens.`);
        continue;
      }
      
      // Preparar mensagem de confirmação
      let saleMessage = "✅ *Venda registrada com sucesso!* \n\n";
      saleMessage += "📋 *Itens:* \n";
      
      // Adicionar informações dos produtos
      for (const item of itens) {
        const { data: produto, error: produtoError } = await supabase
          .from('products')
          .select('name')
          .eq('id', item.product_id)
          .single();
        
        if (!produtoError && produto) {
          saleMessage += `- ${produto.name} (${item.quantity} unid.)\n`;
        } else {
          saleMessage += `- Produto ID: ${item.product_id} (${item.quantity} unid.)\n`;
        }
      }
      
      // Inserir mensagem na primeira conversa do cliente
      const conversationId = conversas[0].id;
      const now = new Date(venda.created_at);
      
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: saleMessage,
          sender: 'user',
          sent_at: now.toISOString(),
          message_type: 'text'
        });
      
      if (msgError) {
        console.error(`Erro ao criar mensagem para venda ${venda.id}:`, msgError);
      } else {
        console.log(`✅ Mensagem criada para venda ${venda.id} na conversa ${conversationId}`);
        mensagensCriadas++;
      }
    }
    
    console.log(`\nTotal de mensagens criadas: ${mensagensCriadas}`);
    console.log('=========================');
  } catch (error) {
    console.error('Erro ao criar mensagens de venda:', error);
  }
}

// Executar as verificações
async function executarVerificacoes() {
  // Verificar conversas ativas e suas mensagens de venda
  await verificarConversas();
  
  // Verificar todas as mensagens de venda no sistema
  await verificarTodasMensagensVenda();
  
  // Verificar vendas registradas no banco de dados
  await verificarVendasRegistradas();
  
  // Perguntar se deseja criar mensagens de venda faltantes
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('\nDeseja criar mensagens de venda para as vendas sem mensagens? (s/n) ', async (resposta) => {
    if (resposta.toLowerCase() === 's') {
      await criarMensagensVenda();
    }
    
    console.log('\n✅ Verificações concluídas!');
    readline.close();
  });
}

executarVerificacoes();