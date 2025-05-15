
import React, { useState } from 'react';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    onSendMessage(newMessage);
    setNewMessage('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="p-2 bg-[#F0F2F5]">
      <div className="flex items-center gap-1 md:gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full h-9 w-9 md:h-10 md:w-10 hidden sm:flex"
        >
          <Smile className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full h-9 w-9 md:h-10 md:w-10"
        >
          <Paperclip className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
        
        <div className="flex-1 relative">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite uma mensagem"
            className="bg-white border-none rounded-2xl pl-3 pr-10 py-2 md:py-2.5 text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-sm font-sans"
          />
        </div>
        
        <Button 
          onClick={handleSendMessage}
          disabled={newMessage.trim() === ''}
          variant="ghost" 
          size="icon" 
          className={`${newMessage.trim() === '' ? 'text-gray-600 bg-transparent hover:bg-gray-200' : 'text-white bg-[#008069] hover:bg-[#00725e]'} rounded-full h-9 w-9 md:h-10 md:w-10 transition-colors`}
        >
          {newMessage.trim() === '' ? (
            <Mic className="h-5 w-5 md:h-6 md:w-6" />
          ) : (
            <Send className="h-5 w-5 md:h-6 md:w-6" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
