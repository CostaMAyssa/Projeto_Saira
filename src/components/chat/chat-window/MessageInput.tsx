
import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Smile, Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendAudio?: (audioBlob: Blob, fileName: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onSendAudio }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioChunks(chunks);
        stream.getTracks().forEach(track => track.stop());
        if (onSendAudio && audioBlob.size > 0) {
          setIsProcessing(true);
          const fileName = `audio_${Date.now()}.webm`;
          onSendAudio(audioBlob, fileName);
          setIsProcessing(false);
        }
      };
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setRecordingTime(0);
      setIsRecording(true);
      recorder.start();
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar microfone. Verifique as permissões.');
    }
  }, [onSendAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [mediaRecorder, isRecording]);

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // NOVO: Função para abrir o seletor de arquivos
  const handleClipClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // NOVO: Função para processar o arquivo selecionado
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      // Converter arquivo para base64
      const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = await toBase64(file);
      // Montar objeto para envio
      const filePayload = {
        name: file.name,
        base64,
        type: file.type
      };
      // Chamar função de envio (precisa ser adaptada no ChatWindow para aceitar arquivo)
      if (typeof (onSendMessage as any) === 'function') {
        (onSendMessage as any)('', filePayload); // Envia mensagem vazia + arquivo
      }
    } catch (err) {
      alert('Erro ao processar arquivo.');
      console.error(err);
    } finally {
      setIsUploading(false);
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
        {/* NOVO: Botão de clipe funcional */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClipClick}
          className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full h-9 w-9 md:h-10 md:w-10"
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5 md:h-6 md:w-6" />}
        </Button>
        {/* Input invisível para upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-zip-compressed,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div className="flex-1 relative">
          {isRecording ? (
            <div className="bg-red-100 border border-red-300 rounded-2xl px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 font-medium">
                  Gravando... {formatRecordingTime(recordingTime)}
                </span>
              </div>
              <Button
                onClick={stopRecording}
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-200 rounded-full h-8 w-8"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          ) : (
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite uma mensagem"
            className="bg-white border-none rounded-2xl pl-3 pr-10 py-2 md:py-2.5 text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-sm font-sans"
          />
          )}
        </div>
        {!isRecording && (
        <Button 
            onClick={newMessage.trim() === '' ? handleMicClick : handleSendMessage}
            disabled={newMessage.trim() === '' && isProcessing}
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
        )}
        {isRecording && (
          <Button 
            onClick={handleMicClick}
            variant="ghost" 
            size="icon" 
            className="text-red-600 bg-red-100 hover:bg-red-200 rounded-full h-9 w-9 md:h-10 md:w-10 transition-colors"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
            ) : (
              <Square className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
