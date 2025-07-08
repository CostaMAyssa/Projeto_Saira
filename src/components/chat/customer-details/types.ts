import { Product } from '@/components/products/types';

export interface CustomerDetails {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  birthdate: string;
  tags: string[];
  products: Product[];
  notes: string;
}
