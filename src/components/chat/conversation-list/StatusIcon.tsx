
import React from 'react';
import { Conversation } from '../types';

interface StatusIconProps {
  status: Conversation['status'];
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  switch (status) {
    case 'read':
      return <span className="text-blue-400">✓✓</span>;
    case 'delivered':
      return <span className="text-gray-400">✓✓</span>;
    case 'sent':
      return <span className="text-gray-400">✓</span>;
    case 'pending':
      return <span className="text-gray-400">🕓</span>;
    default:
      return null;
  }
};

export default StatusIcon;
