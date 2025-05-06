
import React from 'react';
import { Badge } from '@/components/ui/badge';

export const getTagBadge = (tag: string) => {
  switch(tag.toLowerCase()) {
    case 'uso continuo':
      return <Badge className="bg-pharmacy-dark1 border-pharmacy-green1 text-pharmacy-green2 mr-1">Uso Contínuo</Badge>;
    case 'vip':
      return <Badge className="bg-pharmacy-dark1 border-pharmacy-green1 text-pharmacy-green2 mr-1">VIP</Badge>;
    case 'regular':
      return <Badge className="bg-pharmacy-dark1 border-pharmacy-green1 text-pharmacy-green2 mr-1">Regular</Badge>;
    case 'ocasional':
      return <Badge className="bg-pharmacy-dark1 border-pharmacy-green1 text-pharmacy-green2 mr-1">Ocasional</Badge>;
    case 'inativo':
      return <Badge className="bg-red-900 text-white mr-1">Inativo</Badge>;
    default:
      return <Badge className="bg-pharmacy-dark1 border-pharmacy-green1 text-pharmacy-green2 mr-1">{tag}</Badge>;
  }
};

export const getStatusBadge = (status: 'active' | 'inactive') => {
  return status === 'active' 
    ? <Badge className="bg-green-600 text-white">Ativo</Badge>
    : <Badge className="bg-gray-600 text-white">Inativo</Badge>;
};
