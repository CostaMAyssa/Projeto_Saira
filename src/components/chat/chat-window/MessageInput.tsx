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
    <div className="p-2 bg-pharmacy-whatsapp-header">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-pharmacy-whatsapp-icon hover:text-pharmacy-whatsapp-primary hover:bg-gray-200 rounded-full h-10 w-10"
        >
          <Smile className="h-6 w-6" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-pharmacy-whatsapp-icon hover:text-pharmacy-whatsapp-primary hover:bg-gray-200 rounded-full h-10 w-10"
        >
          <Paperclip className="h-6 w-6" />
        </Button>
        
        <div className="flex-1 relative">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite uma mensagem"
            className="bg-white border-none rounded-2xl pl-4 pr-10 py-2.5 text-pharmacy-text1 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-sm"
          />
        </div>
        
        <Button 
          onClick={handleSendMessage}
          disabled={newMessage.trim() === ''}
          variant="ghost" 
          size="icon" 
          className={`${newMessage.trim() === '' ? 'text-pharmacy-whatsapp-icon bg-transparent hover:bg-gray-200' : 'text-white bg-pharmacy-whatsapp-primary hover:bg-pharmacy-whatsapp-primary/90'} rounded-full h-10 w-10 transition-colors`}
        >
          {newMessage.trim() === '' ? (
            <Mic className="h-6 w-6" />
          ) : (
            <Send className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
