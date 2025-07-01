export type Message = {
  id: string;
  content: string;
  sender: 'client' | 'pharmacy';
  timestamp: string;
  message_type?: 'text' | 'image' | 'audio' | 'document';
  media_url?: string;
  media_type?: string;
  file_name?: string;
  file_size?: number;
  transcription?: string;
  caption?: string;
};

export type Conversation = {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: 'read' | 'delivered' | 'sent' | 'pending';
  tags: string[];
};
