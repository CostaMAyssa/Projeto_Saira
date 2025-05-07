
export interface Product {
  id: string;
  name: string;
  category: string;
  lastPurchase: string;
  continuous: boolean;
}

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
