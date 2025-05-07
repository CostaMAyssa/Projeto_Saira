
import { CustomerDetails } from './types';

export const mockCustomerDetails: Record<string, CustomerDetails> = {
  '1': {
    id: '1',
    name: 'João Silva',
    phone: '+55 11 98765-4321',
    email: 'joao.silva@email.com',
    address: 'Rua das Flores, 123 - São Paulo',
    birthdate: '15/05/1975',
    tags: ['hipertenso', 'uso contínuo', 'cliente fiel'],
    products: [
      {
        id: 'p1',
        name: 'Losartana 50mg',
        category: 'Anti-hipertensivo',
        lastPurchase: '30/04/2023',
        continuous: true,
      },
      {
        id: 'p2',
        name: 'Aspirina 100mg',
        category: 'Analgésico',
        lastPurchase: '15/04/2023',
        continuous: true,
      }
    ],
    notes: 'Cliente prefere ser atendido no período da manhã. Geralmente retira medicamentos entre os dias 1 e 5 de cada mês.',
  },
  '2': {
    id: '2',
    name: 'Maria Oliveira',
    phone: '+55 11 91234-5678',
    email: 'maria.oliveira@email.com',
    address: 'Av. Paulista, 1000 - São Paulo',
    birthdate: '22/09/1982',
    tags: ['diabético', 'uso contínuo'],
    products: [
      {
        id: 'p3',
        name: 'Insulina Lantus',
        category: 'Antidiabético',
        lastPurchase: '02/05/2023',
        continuous: true,
      }
    ],
    notes: 'Cliente sensível a preços, sempre pergunta por genéricos ou opções mais econômicas.',
  },
};
