
import React, { useRef, useEffect } from 'react';
import { Message } from '../types';

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
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex ${message.sender === 'client' ? 'justify-start' : 'justify-end'}`}
        >
          <div className={message.sender === 'client' ? 'message-bubble-client' : 'message-bubble-pharmacy'}>
            <div className="mb-1">{message.content}</div>
            <div className="text-right">
              <span className="text-xs opacity-70">{message.timestamp}</span>
              {message.sender === 'pharmacy' && (
                <span className="ml-1 text-xs">✓✓</span>
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
