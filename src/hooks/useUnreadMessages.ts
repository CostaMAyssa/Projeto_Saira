import { useUnreadMessages as useUnreadMessagesContext } from '@/contexts/UnreadMessagesContext';

// Hook de compatibilidade - agora usa o contexto compartilhado
export const useUnreadMessages = () => {
  return useUnreadMessagesContext();
};