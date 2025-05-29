export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  tags: string[];
  lastPurchase: string;
  isVip?: boolean;
  isRegular?: boolean;
  isOccasional?: boolean;
  profile_type?: 'regular' | 'occasional' | 'vip';
  birth_date?: string; // YYYY-MM-DD format
}
