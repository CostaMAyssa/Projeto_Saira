import React, { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiClick: (emoji: string) => void;
  children: React.ReactNode;
}

const EmojiPickerComponent: React.FC<EmojiPickerProps> = ({ onEmojiClick, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    console.log('🎯 Emoji clicado:', emojiData.emoji);
    onEmojiClick(emojiData.emoji);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    console.log('🎯 Botão de emoji clicado!');
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <div onClick={handleButtonClick}>
        {children}
      </div>
      
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              autoFocusSearch={false}
              searchPlaceholder="Procurar emojis..."
              width={350}
              height={400}
              lazyLoadEmojis={true}
              skinTonesDisabled={false}
              searchDisabled={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPickerComponent; 