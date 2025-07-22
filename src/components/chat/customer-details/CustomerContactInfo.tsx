import React from 'react';
import { Phone, Mail, Home, Calendar, Cake } from 'lucide-react';

interface CustomerContactInfoProps {
  phone: string;
  email: string;
  birthdate: string;
}

const CustomerContactInfo: React.FC<CustomerContactInfoProps> = ({ phone, email, birthdate }) => (
  <div className="text-sm text-pharmacy-text2 space-y-1 mt-3">
    {phone && (
      <div className="flex items-center gap-2 mb-1">
        <Phone className="h-4 w-4 text-pharmacy-whatsapp-primary" />
        <span>{phone}</span>
      </div>
    )}
    {email && (
      <div className="flex items-center gap-2 mb-1">
        <Mail className="h-4 w-4 text-pharmacy-whatsapp-primary" />
        <span>{email}</span>
      </div>
    )}
    {birthdate && (
      <div className="flex items-center">
        <Cake className="h-4 w-4 mr-2" />
        <span>{birthdate}</span>
      </div>
    )}
  </div>
);

export default CustomerContactInfo;
