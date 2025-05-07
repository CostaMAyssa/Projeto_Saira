import React from 'react';
import { Check } from 'lucide-react';
import { Conversation } from '../types';

interface StatusIconProps {
  status: Conversation['status'];
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  switch (status) {
    case 'read':
      return (
        <span className="inline-flex mr-1">
          <Check size={12} className="text-pharmacy-whatsapp-read" />
          <Check size={12} className="text-pharmacy-whatsapp-read -ml-0.5" />
        </span>
      );
    case 'delivered':
      return (
        <span className="inline-flex mr-1">
          <Check size={12} className="text-gray-400" />
          <Check size={12} className="text-gray-400 -ml-0.5" />
        </span>
      );
    case 'sent':
      return <Check size={12} className="text-gray-400 mr-1" />;
    case 'pending':
      return <span className="text-gray-400 mr-1">🕓</span>;
    default:
      return null;
  }
};

export default StatusIcon;
