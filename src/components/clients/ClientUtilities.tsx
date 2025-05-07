import React from 'react';
import { Badge } from '@/components/ui/badge';

export const getTagBadge = (tag: string) => {
  switch(tag.toLowerCase()) {
    case 'continuous':
    case 'uso continuo':
      return <Badge className="bg-pharmacy-light2 border border-pharmacy-border1 text-pharmacy-text2 font-medium mr-1">Uso Contínuo</Badge>;
    case 'vip':
      return <Badge className="bg-pharmacy-light2 border border-pharmacy-border1 text-pharmacy-accent font-medium mr-1">VIP</Badge>;
    case 'regular':
      return <Badge className="bg-pharmacy-light2 border border-pharmacy-border1 text-pharmacy-text2 font-medium mr-1">Regular</Badge>;
    case 'occasional':
    case 'ocasional':
      return <Badge className="bg-pharmacy-light2 border border-pharmacy-border1 text-pharmacy-text2 font-medium mr-1">Ocasional</Badge>;
    case 'inativo':
      return <Badge className="bg-red-100 text-red-600 border border-red-200 font-medium mr-1">Inativo</Badge>;
    default:
      return <Badge className="bg-pharmacy-light2 border border-pharmacy-border1 text-pharmacy-text2 font-medium mr-1">{tag}</Badge>;
  }
};

export const getStatusBadge = (status: 'active' | 'inactive') => {
  return status === 'active' 
    ? <Badge className="bg-green-100 text-green-700 border border-green-200 font-medium">Ativo</Badge>
    : <Badge className="bg-gray-100 text-gray-600 border border-gray-200 font-medium">Inativo</Badge>;
};
