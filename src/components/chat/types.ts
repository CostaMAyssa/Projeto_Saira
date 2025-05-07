
export type Message = {
  id: string;
  content: string;
  sender: 'client' | 'pharmacy';
  timestamp: string;
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
