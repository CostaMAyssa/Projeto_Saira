
import React from 'react';

interface ChatHeaderProps {
  activeConversation: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ activeConversation }) => {
  // Get name and phone based on conversation ID
  const getName = (id: string): string => {
    switch (id) {
      case '1': return 'João Silva';
      case '2': return 'Maria Oliveira';
      case '3': return 'Carlos Mendes';
      case '4': return 'Ana Beatriz';
      default: return 'Pedro Santos';
    }
  };
  
  const getPhone = (id: string): string => {
    switch (id) {
      case '1': return '+55 11 98765-4321';
      case '2': return '+55 11 91234-5678';
      case '3': return '+55 11 99876-5432';
      case '4': return '+55 11 97654-3210';
      default: return '+55 11 98877-6655';
    }
  };
  
  const name = getName(activeConversation);
  const phone = getPhone(activeConversation);
  const initial = name.charAt(0).toUpperCase();
  
  return (
    <div className="border-b border-pharmacy-dark1 p-4">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-pharmacy-green1 flex items-center justify-center text-white font-medium mr-3">
          {initial}
        </div>
        <div>
          <h3 className="font-medium text-white">{name}</h3>
          <span className="text-xs text-muted-foreground">{phone}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
