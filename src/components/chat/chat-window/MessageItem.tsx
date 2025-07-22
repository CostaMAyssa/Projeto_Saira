import React from 'react';
import { Message } from '../types';
import { Check } from 'lucide-react';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  // Log para depuração
  console.log('Renderizando mensagem:', message);

  const isClient = message.sender === 'client';

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="space-y-2">
            {message.media_url && (
              <img 
                src={message.media_url} 
                alt={message.caption || 'Imagem'} 
                className="max-w-full rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.media_url, '_blank')}
              />
            )}
            {message.caption && (
              <div className="break-words font-normal text-sm">{message.caption}</div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-2">
            {message.media_url && (
              <audio 
                controls 
                src={message.media_url}
                className="w-full max-w-xs"
              >
                Seu navegador não suporta o elemento de áudio.
              </audio>
            )}
            {message.transcription && (
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm">
                <span className="text-gray-600 dark:text-gray-400">📝 Transcrição:</span>
                <p className="mt-1 break-words">{message.transcription}</p>
              </div>
            )}
            {message.content && message.content !== message.transcription && (
              <div className="break-words font-normal text-sm">{message.content}</div>
            )}
          </div>
        );

      case 'document':
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
              <div className="break-words font-normal text-sm">{message.content}</div>
            )}
          </div>
        );

      default:
        return <div className="break-words font-normal text-sm">{message.content}</div>;
    }
  };

  return (
    <div className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 ${
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