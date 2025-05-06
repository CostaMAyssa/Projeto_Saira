
export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  interval?: number;
  tags: string[];
  needsPrescription: boolean;
  controlled?: boolean;
}
