
import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import { Check } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 flex flex-col gap-2 md:gap-3 bg-[#E5DDD5] font-sans">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex ${message.sender === 'client' ? 'justify-start' : 'justify-end'}`}
        >
          <div 
            className={`max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 ${
              message.sender === 'client' 
                ? 'bg-white text-black border border-gray-200' 
                : 'bg-[#DCF8C6] text-black'
            } shadow-sm`}
          >
            <div className="mb-1 break-words font-normal text-sm">{message.content}</div>
            <div className="text-right flex items-center justify-end gap-1">
              <span className={`text-xs ${message.sender === 'client' ? 'text-gray-500' : 'text-gray-600'}`}>
                {message.timestamp}
              </span>
              {message.sender === 'pharmacy' && (
                <span className="inline-flex">
                  <Check size={12} className="text-gray-500" />
                  <Check size={12} className="text-gray-500 -ml-0.5" />
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
