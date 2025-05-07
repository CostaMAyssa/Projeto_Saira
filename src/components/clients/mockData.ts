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
  // Adicionando mais clientes para testar o scroll
  {
    id: '7',
    name: 'Fernanda Costa',
    phone: '(11) 95555-6666',
    email: 'fernanda.costa@email.com',
    status: 'active',
    tags: ['regular'],
    lastPurchase: '05/03/2023',
    isRegular: true
  },
  {
    id: '8',
    name: 'Pedro Souza',
    phone: '(11) 94444-3333',
    email: 'pedro.souza@email.com',
    status: 'active',
    tags: ['vip', 'uso continuo'],
    lastPurchase: '10/04/2023',
    isVip: true
  },
  {
    id: '9',
    name: 'Mariana Ribeiro',
    phone: '(11) 93333-2222',
    email: 'mariana.ribeiro@email.com',
    status: 'inactive',
    tags: ['ocasional'],
    lastPurchase: '20/02/2023',
    isOccasional: true
  },
  {
    id: '10',
    name: 'Ricardo Gomes',
    phone: '(11) 92222-1111',
    email: 'ricardo.gomes@email.com',
    status: 'active',
    tags: ['regular'],
    lastPurchase: '25/03/2023',
    isRegular: true
  },
  {
    id: '11',
    name: 'Amanda Lima',
    phone: '(11) 91111-0000',
    email: 'amanda.lima@email.com',
    status: 'active',
    tags: ['uso continuo'],
    lastPurchase: '18/04/2023'
  },
  {
    id: '12',
    name: 'Gabriel Santos',
    phone: '(11) 90000-9999',
    email: 'gabriel.santos@email.com',
    status: 'active',
    tags: ['vip'],
    lastPurchase: '03/04/2023',
    isVip: true
  },
  {
    id: '13',
    name: 'Camila Ferreira',
    phone: '(11) 99999-8888',
    email: 'camila.ferreira@email.com',
    status: 'inactive',
    tags: ['inativo'],
    lastPurchase: '15/01/2023'
  },
  {
    id: '14',
    name: 'Lucas Oliveira',
    phone: '(11) 98888-7777',
    email: 'lucas.oliveira@email.com',
    status: 'active',
    tags: ['regular', 'uso continuo'],
    lastPurchase: '22/03/2023',
    isRegular: true
  },
  {
    id: '15',
    name: 'Juliana Almeida',
    phone: '(11) 97777-6666',
    email: 'juliana.almeida@email.com',
    status: 'active',
    tags: ['vip'],
    lastPurchase: '01/04/2023',
    isVip: true
  },
  {
    id: '16',
    name: 'Rodrigo Martins',
    phone: '(11) 96666-5555',
    email: 'rodrigo.martins@email.com',
    status: 'active',
    tags: ['ocasional'],
    lastPurchase: '28/03/2023',
    isOccasional: true
  }
];
