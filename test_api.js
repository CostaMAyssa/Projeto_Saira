// 🧪 TESTE SIMPLES DA EVOLUTION API
// Execute no console do navegador ou Node.js

const API_URL = 'https://evoapi.insignemarketing.com.br';
const API_KEY = '33cf7bf9876391ff485115742bdb149a';

console.log('🔌 Testando Evolution API...');

// Teste 1: Verificar se a API responde
fetch(`${API_URL}/`, {
  method: 'GET',
  headers: {
    'apikey': API_KEY
  }
})
.then(response => {
  console.log('✅ API respondeu:', response.status);
  return response.text();
})
.then(data => {
  console.log('📄 Resposta:', data.substring(0, 200));
})
.catch(error => {
  console.error('❌ Erro na API:', error);
});

// Teste 2: Listar instâncias
fetch(`${API_URL}/instance/fetchInstances`, {
  method: 'GET',
  headers: {
    'apikey': API_KEY,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('✅ Instâncias respondeu:', response.status);
  return response.json();
})
.then(data => {
  console.log('📋 Instâncias:', data);
})
.catch(error => {
  console.error('❌ Erro ao listar instâncias:', error);
});

// Teste 3: Configurar webhook global
const webhookData = {
  url: 'https://localhost:8080/api/evolution',
  events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED']
};

fetch(`${API_URL}/webhook/set/global`, {
  method: 'POST',
  headers: {
    'apikey': API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(webhookData)
})
.then(response => {
  console.log('✅ Webhook respondeu:', response.status);
  return response.json();
})
.then(data => {
  console.log('🔗 Webhook configurado:', data);
})
.catch(error => {
  console.error('❌ Erro ao configurar webhook:', error);
});

console.log('⏳ Executando testes...'); 