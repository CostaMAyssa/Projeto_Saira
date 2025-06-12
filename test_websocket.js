// 🧪 SCRIPT PARA TESTAR WEBSOCKET EVOLUTION API
// Execute: node test_websocket.js

const { io } = require('socket.io-client');

const API_URL = 'https://evoapi.insignemarketing.com.br';
const API_KEY = '33cf7bf9876391ff485115742bdb149a';

console.log('🔌 Testando conexão WebSocket Evolution API...');
console.log(`📡 URL: ${API_URL}`);
console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);

// Conectar no modo global
const socket = io(API_URL, {
  transports: ['websocket'],
  query: {
    apikey: API_KEY
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

socket.on('connect', () => {
  console.log('✅ WebSocket conectado com sucesso!');
  console.log('🆔 Socket ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ WebSocket desconectado:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Erro de conexão:', error.message);
});

// Eventos da Evolution API
socket.on('APPLICATION_STARTUP', (data) => {
  console.log('🚀 APPLICATION_STARTUP:', data);
});

socket.on('QRCODE_UPDATED', (data) => {
  console.log('📱 QRCODE_UPDATED:', data);
});

socket.on('CONNECTION_UPDATE', (data) => {
  console.log('🔗 CONNECTION_UPDATE:', data);
});

socket.on('MESSAGES_UPSERT', (data) => {
  console.log('📨 MESSAGES_UPSERT:', data);
});

socket.on('MESSAGES_UPDATE', (data) => {
  console.log('🔄 MESSAGES_UPDATE:', data);
});

socket.on('CONTACTS_UPSERT', (data) => {
  console.log('👤 CONTACTS_UPSERT:', data);
});

socket.on('CHATS_UPSERT', (data) => {
  console.log('💬 CHATS_UPSERT:', data);
});

// Timeout para teste
setTimeout(() => {
  if (socket.connected) {
    console.log('✅ Teste concluído - WebSocket está funcionando!');
  } else {
    console.log('❌ Teste falhou - WebSocket não conectou');
  }
  process.exit(0);
}, 15000);

console.log('⏳ Aguardando conexão por 15 segundos...'); 