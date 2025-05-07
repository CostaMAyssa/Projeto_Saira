import React from 'react';
import { Phone, Mail, Home, Calendar } from 'lucide-react';

interface CustomerContactInfoProps {
  phone: string;
  email: string;
  address: string;
  birthdate: string;
}

const CustomerContactInfo: React.FC<CustomerContactInfoProps> = ({
  phone,
  email,
  address,
  birthdate
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Phone className="h-4 w-4 text-pharmacy-whatsapp-primary" />
        <span className="text-sm text-pharmacy-text2">{phone}</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <Mail className="h-4 w-4 text-pharmacy-whatsapp-primary" />
        <span className="text-sm text-pharmacy-text2">{email}</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <Home className="h-4 w-4 text-pharmacy-whatsapp-primary" />
        <span className="text-sm text-pharmacy-text2">{address}</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-pharmacy-whatsapp-primary" />
        <span className="text-sm text-pharmacy-text2">Nascimento: {birthdate}</span>
      </div>
    </div>
  );
};

export default CustomerContactInfo;
