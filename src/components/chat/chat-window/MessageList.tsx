import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import { Check } from 'lucide-react';
import MessageItem from './MessageItem';

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
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
