
import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
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
    <div className="p-4 border-t border-pharmacy-dark1">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-pharmacy-green2 hover:text-pharmacy-accent hover:bg-pharmacy-dark1"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Digite uma mensagem..."
          className="bg-pharmacy-dark1 border-pharmacy-green1 focus:border-pharmacy-green2"
        />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-pharmacy-green2 hover:text-pharmacy-accent hover:bg-pharmacy-dark1"
        >
          <Smile className="h-5 w-5" />
        </Button>
        
        <Button 
          onClick={handleSendMessage}
          disabled={newMessage.trim() === ''}
          variant="default" 
          size="icon" 
          className="bg-pharmacy-accent hover:bg-pharmacy-green1"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
