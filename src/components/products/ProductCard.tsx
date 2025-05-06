
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Clock, Tag, Edit } from 'lucide-react';
import { Product } from './types';

interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const ProductCard = ({ product, onEdit, onViewDetails }: ProductCardProps) => {
  const getTagBadgeClass = (tag: string) => {
    if (tag === "Uso Contínuo") {
      return "bg-blue-600 text-white";
    } else if (tag === "Uso Comum") {
      return "bg-green-600 text-white";
    } else if (tag === "Antibiótico") {
      return "bg-purple-600 text-white";
    } else if (tag === "Controlado") {
      return "bg-red-600 text-white";
    } else {
      return "bg-gray-600 text-white";
    }
  };

  return (
    <Card className="p-6 bg-pharmacy-dark2 text-white border-pharmacy-dark1">
      <div className="flex justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{product.name}</h3>
          <Badge className="bg-gray-600 text-white mt-1">{product.category}</Badge>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center">
          <Package className="h-4 w-4 text-gray-300 mr-2" />
          <span>Estoque: {product.stock} unidades</span>
        </div>
        
        {product.interval && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-300 mr-2" />
            <span>Intervalo: {product.interval} dias</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-3">
          {product.tags.map((tag) => (
            <Badge key={tag} className={getTagBadgeClass(tag) + " mr-1"}>
              {tag}
            </Badge>
          ))}
          
          {product.needsPrescription ? (
            <Badge className="bg-yellow-600 text-white">
              Com Receita
            </Badge>
          ) : (
            <Badge className="bg-green-600 text-white">
              Sem Receita
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-4 pt-3 border-t border-pharmacy-dark1">
        <Button 
          variant="outline" 
          className="border-pharmacy-green1 text-pharmacy-green2"
          onClick={() => onEdit(product.id)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => onViewDetails(product.id)}
        >
          Detalhes
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
