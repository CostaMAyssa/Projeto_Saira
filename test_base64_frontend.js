// Teste para verificar se o base64 está sendo gerado corretamente
import fs from 'fs';

// Simular o processo do frontend
function testBase64Conversion() {
  console.log('🧪 TESTE DE CONVERSÃO BASE64');
  
  // Criar um buffer de teste (simulando áudio)
  const testBuffer = Buffer.from('Hello World Audio Test', 'utf8');
  const uint8Array = new Uint8Array(testBuffer);
  
  console.log('📏 Tamanho original:', uint8Array.length);
  
  // Método atual (problemático)
  let base64Problematic = '';
  const chunkSize = 8192;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    try {
      base64Problematic += String.fromCharCode.apply(null, Array.from(chunk));
    } catch (error) {
      console.log('❌ Erro no método problemático:', error.message);
      break;
    }
  }
  
  base64Problematic = Buffer.from(base64Problematic, 'binary').toString('base64');
  
  // Método corrigido
  let base64Fixed = '';
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    const chunkString = Array.from(chunk, byte => String.fromCharCode(byte)).join('');
    base64Fixed += chunkString;
  }
  
  base64Fixed = Buffer.from(base64Fixed, 'binary').toString('base64');
  
  // Método direto (referência)
  const base64Direct = testBuffer.toString('base64');
  
  console.log('📊 Resultados:');
  console.log('Método problemático:', base64Problematic);
  console.log('Método corrigido:', base64Fixed);
  console.log('Método direto:', base64Direct);
  console.log('✅ Método corrigido igual ao direto:', base64Fixed === base64Direct);
  
  return base64Fixed;
}

// Testar com um arquivo de áudio real se existir
function testWithRealAudio() {
  console.log('\n🎤 TESTE COM ÁUDIO REAL');
  
  try {
    // Tentar ler um arquivo de áudio de teste
    const audioPath = './test_audio.webm';
    if (fs.existsSync(audioPath)) {
      const audioBuffer = fs.readFileSync(audioPath);
      const uint8Array = new Uint8Array(audioBuffer);
      
      console.log('📏 Tamanho do áudio:', uint8Array.length);
      
      // Método corrigido
      let base64 = '';
      const chunkSize = 8192;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        const chunkString = Array.from(chunk, byte => String.fromCharCode(byte)).join('');
        base64 += chunkString;
      }
      
      base64 = Buffer.from(base64, 'binary').toString('base64');
      
      console.log('✅ Base64 gerado:', base64.substring(0, 50) + '...');
      console.log('📏 Tamanho do base64:', base64.length);
      
      // Verificar se é válido
      try {
        const decoded = Buffer.from(base64, 'base64');
        console.log('✅ Base64 válido, tamanho decodificado:', decoded.length);
      } catch (error) {
        console.log('❌ Base64 inválido:', error.message);
      }
    } else {
      console.log('⚠️ Arquivo de áudio não encontrado, criando um simulado...');
      
      // Criar um áudio simulado
      const simulatedAudio = Buffer.alloc(1000, 'A'); // 1KB de dados
      const uint8Array = new Uint8Array(simulatedAudio);
      
      let base64 = '';
      const chunkSize = 8192;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        const chunkString = Array.from(chunk, byte => String.fromCharCode(byte)).join('');
        base64 += chunkString;
      }
      
      base64 = Buffer.from(base64, 'binary').toString('base64');
      
      console.log('✅ Base64 simulado gerado:', base64.substring(0, 50) + '...');
      console.log('📏 Tamanho do base64:', base64.length);
    }
  } catch (error) {
    console.log('❌ Erro no teste com áudio real:', error.message);
  }
}

// Executar testes
testBase64Conversion();
testWithRealAudio(); 