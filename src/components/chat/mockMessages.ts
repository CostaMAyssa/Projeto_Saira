
import { Message } from './types';

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1-1',
      content: 'Olá, bom dia! Gostaria de saber se vocês têm Losartana em estoque?',
      sender: 'client',
      timestamp: '10:30',
    },
    {
      id: '1-2',
      content: 'Bom dia, Sr. João! Sim, temos Losartana disponível. Qual a dosagem que o senhor precisa?',
      sender: 'pharmacy',
      timestamp: '10:32',
    },
    {
      id: '1-3',
      content: 'Preciso da Losartana de 50mg, caixa com 30 comprimidos.',
      sender: 'client',
      timestamp: '10:35',
    },
    {
      id: '1-4',
      content: 'Perfeito, temos disponível. O preço é R$ 22,90. O senhor vai querer reservar para retirada?',
      sender: 'pharmacy',
      timestamp: '10:37',
    },
    {
      id: '1-5',
      content: 'Sim, por favor. Posso retirar meu remédio hoje?',
      sender: 'client',
      timestamp: '10:42',
    },
  ],
  '2': [
    {
      id: '2-1',
      content: 'Olá, preciso de uma caixa de Insulina Lantus. Vocês têm?',
      sender: 'client',
      timestamp: '09:10',
    },
    {
      id: '2-2',
      content: 'Bom dia, Sra. Maria! Sim, temos Insulina Lantus disponível. Gostaria de reservar?',
      sender: 'pharmacy',
      timestamp: '09:12',
    },
    {
      id: '2-3',
      content: 'Sim, por favor. Vou passar para retirar à tarde.',
      sender: 'client',
      timestamp: '09:13',
    },
    {
      id: '2-4',
      content: 'Perfeito! Vou deixar reservado em seu nome. Pode retirar até às 19h de hoje.',
      sender: 'pharmacy',
      timestamp: '09:14',
    },
    {
      id: '2-5',
      content: 'Obrigada pelo atendimento!',
      sender: 'client',
      timestamp: '09:15',
    },
  ],
  '3': [],
  '4': [],
  '5': []
};
