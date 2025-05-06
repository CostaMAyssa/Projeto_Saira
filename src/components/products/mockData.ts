
import { Product } from './types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Dipirona 500mg',
    category: 'Analgésico',
    stock: 150,
    tags: ['Uso Comum'],
    needsPrescription: false,
  },
  {
    id: '2',
    name: 'Atorvastatina 20mg',
    category: 'Cardiovascular',
    stock: 80,
    interval: 30,
    tags: ['Uso Contínuo'],
    needsPrescription: true,
  },
  {
    id: '3',
    name: 'Losartana 50mg',
    category: 'Cardiovascular',
    stock: 120,
    interval: 30,
    tags: ['Uso Contínuo'],
    needsPrescription: true,
  },
  {
    id: '4',
    name: 'Omeprazol 20mg',
    category: 'Gastrointestinal',
    stock: 100,
    interval: 30,
    tags: ['Uso Contínuo'],
    needsPrescription: true,
  },
  {
    id: '5',
    name: 'Amoxicilina 500mg',
    category: 'Antibiótico',
    stock: 60,
    interval: 8,
    tags: ['Antibiótico', 'Controlado'],
    needsPrescription: true,
    controlled: true,
  },
];
