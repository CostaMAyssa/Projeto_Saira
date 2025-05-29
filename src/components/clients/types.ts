export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  tags: string[];
  lastPurchase: string;
  isVip?: boolean;
  profile_type: 'regular' | 'occasional' | 'vip';
}
