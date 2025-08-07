import React, { useState } from 'react';
import { Message } from '../types';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Log para depuração
  console.log('🎯 Renderizando mensagem:', {
    id: message.id,
    content: message.content,
    sender: message.sender,
    message_type: message.message_type,
    media_url: message.media_url,
    media_type: message.media_type,
    file_name: message.file_name,
    file_size: message.file_size,
    caption: message.caption
  });

  const isClient = message.sender === 'client';
  
  // Definir limite de caracteres para truncamento - AUMENTADO
  const MAX_CHARS = 300; // Dobrado de 150 para 300
  const shouldTruncate = message.content && message.content.length > MAX_CHARS;
  const displayContent = shouldTruncate && !isExpanded 
    ? message.content.substring(0, MAX_CHARS) + '...'
    : message.content;

  // Função para detectar se é uma URL longa
  const isLongUrl = (text: string) => {
    return text.includes('http') && text.length > 150; // Aumentado de 100 para 150
  };

  const renderMessageContent = () => {
    console.log(`🎨 Renderizando conteúdo para tipo: ${message.message_type}`);
    
    switch (message.message_type) {
      case 'image':
        console.log('🖼️ Renderizando imagem:', {
          media_url: message.media_url,
          caption: message.caption
        });
        return (
          <div className="space-y-2">
            {message.media_url && (
              <img 
                src={message.media_url} 
                alt={message.caption || 'Imagem'} 
                className="max-w-full rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.media_url, '_blank')}
                onError={(e) => console.error('❌ Erro ao carregar imagem:', e)}
                onLoad={() => console.log('✅ Imagem carregada com sucesso')}
              />
            )}
            {message.caption && (
              <div className="break-all font-normal text-sm">{message.caption}</div>
            )}
          </div>
        );

      case 'audio':
        console.log('🎵 Renderizando áudio:', {
          media_url: message.media_url,
          file_name: message.file_name,
          file_size: message.file_size
        });
        return (
          <div className="space-y-2">
            {message.media_url && (
              <audio 
                controls 
                src={message.media_url}
                className="w-full max-w-xs"
                onError={(e) => console.error('❌ Erro ao carregar áudio:', e)}
                onLoadStart={() => console.log('🎵 Iniciando carregamento do áudio')}
                onCanPlay={() => console.log('✅ Áudio pronto para reprodução')}
              >
                Seu navegador não suporta o elemento de áudio.
              </audio>
            )}
            {message.transcription && (
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm">
                <span className="text-gray-600 dark:text-gray-400">📝 Transcrição:</span>
                <p className="mt-1 break-all">{message.transcription}</p>
              </div>
            )}
            {message.content && message.content !== message.transcription && (
              <div className="break-all font-normal text-sm">{message.content}</div>
            )}
          </div>
        );

      case 'document':
        console.log('📄 Renderizando documento:', {
          media_url: message.media_url,
          file_name: message.file_name,
          media_type: message.media_type,
          file_size: message.file_size
        });
        return (
          <div className="space-y-2">
            {message.media_url && (
              <a 
                href={message.media_url} 
                download={message.file_name}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-2xl">
                  {message.media_type?.includes('pdf') ? '📄' : 
                   message.media_type?.includes('image') ? '🖼️' :
                   message.media_type?.includes('video') ? '🎥' :
                   message.media_type?.includes('audio') ? '🎵' : '📎'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{message.file_name || 'Documento'}</p>
                  {message.file_size && (
                    <p className="text-xs text-gray-500">
                      {(message.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
                <div className="text-blue-500">
                  ⬇️
                </div>
              </a>
            )}
            {message.content && (
              <div className="break-all font-normal text-sm">{message.content}</div>
            )}
          </div>
        );

      default:
        console.log('📝 Renderizando texto padrão');
        
        // Se for uma URL longa, mostrar de forma especial
        if (message.content && isLongUrl(message.content)) {
          const urlDisplay = shouldTruncate && !isExpanded 
            ? message.content.substring(0, 150) + '...' // Aumentado de 80 para 150
            : message.content;
            
          return (
            <div className="space-y-2">
              <div className="break-all font-normal text-sm">
                {urlDisplay}
              </div>
              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-500 hover:text-blue-700 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp size={12} />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown size={12} />
                      Ler mais
                    </>
                  )}
                </button>
              )}
            </div>
          );
        }
        
        // Texto normal
        return (
          <div className="space-y-2">
            <div className="break-all font-normal text-sm">
              {displayContent}
            </div>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-500 hover:text-blue-700 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={12} />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} />
                    Ler mais
                  </>
                )}
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[75%] md:max-w-[60%] lg:max-w-[55%] rounded-lg px-3 py-2 ${
          isClient 
            ? 'bg-white text-black border border-gray-200' 
            : 'bg-[#DCF8C6] text-black'
        } shadow-sm`}
      >
        <div className="mb-1">
          {renderMessageContent()}
        </div>
        <div className="text-right flex items-center justify-end gap-1">
          <span className={`text-xs ${isClient ? 'text-gray-500' : 'text-gray-600'}`}>
            {message.timestamp}
          </span>
          {!isClient && (
            <span className="inline-flex">
              <Check size={12} className="text-gray-500" />
              <Check size={12} className="text-gray-500 -ml-0.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem; 