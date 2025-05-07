
import React, { useState, useEffect } from 'react';
import ChatHeader from './chat-window/ChatHeader';
import MessageList from './chat-window/MessageList';
import MessageInput from './chat-window/MessageInput';
import EmptyState from './chat-window/EmptyState';
import { Message } from './types';
import { mockMessages } from './mockMessages';

interface ChatWindowProps {
  activeConversation: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ activeConversation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation && mockMessages[activeConversation]) {
      setMessages(mockMessages[activeConversation]);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);
  
  const handleSendMessage = (content: string) => {
    if (!activeConversation) return;
    
    const currentTime = new Date();
    const timeString = currentTime.getHours() + ':' + 
                      (currentTime.getMinutes() < 10 ? '0' : '') + 
                      currentTime.getMinutes();
    
    const newMessage: Message = {
      id: `${activeConversation}-${Date.now()}`,
      content: content,
      sender: 'pharmacy',
      timestamp: timeString,
    };
    
    setMessages(prev => [...prev, newMessage]);
  };
  
  if (!activeConversation) {
    return <EmptyState />;
  }
  
  return (
    <div className="h-full flex flex-col bg-pharmacy-dark2">
      <ChatHeader activeConversation={activeConversation} />
      <MessageList messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
