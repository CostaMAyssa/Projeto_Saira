
import { Client } from './types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Maria Silva',
    phone: '(11) 98765-4321',
    email: 'maria.silva@email.com',
    status: 'active',
    tags: ['uso continuo', 'vip'],
    lastPurchase: '15/04/2023',
    isVip: true
  },
  {
    id: '2',
    name: 'João Santos',
    phone: '(11) 91234-5678',
    email: 'joao.santos@email.com',
    status: 'inactive',
    tags: ['ocasional'],
    lastPurchase: '23/03/2023',
    isOccasional: true
  },
  {
    id: '3',
    name: 'Ana Oliveira',
    phone: '(11) 99876-5432',
    email: 'ana.oliveira@email.com',
    status: 'active',
    tags: ['uso continuo', 'regular'],
    lastPurchase: '08/04/2023',
    isRegular: true
  },
  {
    id: '4',
    name: 'Carlos Pereira',
    phone: '(11) 98888-7777',
    email: 'carlos.pereira@email.com',
    status: 'active',
    tags: ['regular'],
    lastPurchase: '30/03/2023',
    isRegular: true
  },
  {
    id: '5',
    name: 'Lúcia Ferreira',
    phone: '(11) 97777-8888',
    email: 'lucia.ferreira@email.com',
    status: 'active',
    tags: ['uso continuo', 'vip'],
    lastPurchase: '02/04/2023',
    isVip: true
  },
  {
    id: '6',
    name: 'Roberto Alves',
    phone: '(11) 96666-5555',
    email: 'roberto.alves@email.com',
    status: 'inactive',
    tags: ['inativo'],
    lastPurchase: '12/02/2023'
  },
];
