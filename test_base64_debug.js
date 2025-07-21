// Debug do base64
console.log('🔍 DEBUG DO BASE64');

const testAudioBase64 = 'UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';

console.log('📋 Base64 original:', testAudioBase64);
console.log('📏 Tamanho:', testAudioBase64.length);

// Verificar se é base64 válido
const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(testAudioBase64);
console.log('✅ Base64 válido:', isValidBase64);

// Tentar decodificar
try {
  const binaryString = atob(testAudioBase64);
  console.log('✅ Decodificação bem-sucedida');
  console.log('📏 Tamanho binário:', binaryString.length);
  
  // Converter para Uint8Array
  const buffer = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    buffer[i] = binaryString.charCodeAt(i);
  }
  console.log('✅ Buffer criado com sucesso');
  console.log('📏 Tamanho do buffer:', buffer.length);
  
} catch (error) {
  console.error('❌ Erro na decodificação:', error.message);
}

// Testar com base64 simples
console.log('\n🧪 Teste com base64 simples...');
const simpleBase64 = 'SGVsbG8gV29ybGQ='; // "Hello World"
console.log('Base64 simples:', simpleBase64);
console.log('Válido:', /^[A-Za-z0-9+/]*={0,2}$/.test(simpleBase64));

try {
  const decoded = atob(simpleBase64);
  console.log('Decodificado:', decoded);
} catch (error) {
  console.error('Erro:', error.message);
} 