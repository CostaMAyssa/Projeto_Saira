
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Clock, Edit } from 'lucide-react';
import { Product } from './types';

interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onViewDetails: (id: string) => void;
  isMobile?: boolean;
}

const ProductCard = ({ product, onEdit, onViewDetails, isMobile = false }: ProductCardProps) => {
  const getTagBadgeClass = (tag: string) => {
    if (tag === "Uso Contínuo") {
      return "bg-pharmacy-green2 text-white";
    } else if (tag === "Uso Comum") {
      return "bg-pharmacy-green1 text-white";
    } else if (tag === "Antibiótico") {
      return "bg-pharmacy-green1 text-white";
    } else if (tag === "Controlado") {
      return "bg-pharmacy-accent text-white";
    } else {
      return "bg-gray-700 text-white";
    }
  };

  return (
    <Card className="p-4 sm:p-6 bg-white border border-gray-200 shadow-sm">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{product.name}</h3>
          <Badge className="bg-gray-200 text-gray-800 mt-1 text-xs sm:text-sm">{product.category}</Badge>
        </div>
      </div>
      
      <div className="mt-3 sm:mt-4 space-y-2">
        <div className="flex items-center">
          <Package className="h-4 w-4 text-green-600 mr-1 sm:mr-2" />
          <span className="text-sm text-gray-700">Estoque: {product.stock} unidades</span>
        </div>
        
        {product.interval && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-green-600 mr-1 sm:mr-2" />
            <span className="text-sm text-gray-700">Intervalo: {product.interval} dias</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
          {product.tags.map((tag) => (
            <Badge key={tag} className={`${getTagBadgeClass(tag)} text-xs mr-1`}>
              {tag}
            </Badge>
          ))}
          
          {product.needsPrescription ? (
            <Badge className="bg-pharmacy-accent text-white text-xs">
              Com Receita
            </Badge>
          ) : (
            <Badge className="bg-pharmacy-green1 text-white text-xs">
              Sem Receita
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-gray-200">
        <Button 
          className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
          size={isMobile ? "sm" : "default"}
          onClick={() => onEdit(product.id)}
        >
          <Edit className="h-4 w-4 mr-1" />
          {isMobile ? "" : "Editar"}
        </Button>
        <Button 
          className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
          size={isMobile ? "sm" : "default"}
          onClick={() => onViewDetails(product.id)}
        >
          {isMobile ? "Ver" : "Detalhes"}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
