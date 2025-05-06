
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
  const getProductBadges = (product: Product) => {
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {product.tags.map((tag) => {
          let className = "";
          if (tag === "Uso Contínuo") {
            className = "bg-blue-600 text-white";
          } else if (tag === "Uso Comum") {
            className = "bg-green-600 text-white";
          } else if (tag === "Antibiótico") {
            className = "bg-purple-600 text-white";
          } else if (tag === "Controlado") {
            className = "bg-red-600 text-white";
          } else {
            className = "bg-gray-600 text-white";
          }
          
          return (
            <Badge key={tag} className={className + " mr-1"}>
              {tag}
            </Badge>
          );
        })}
        
        {product.needsPrescription && (
          <Badge className="bg-yellow-600 text-white">
            Com Receita
          </Badge>
        )}
        
        {!product.needsPrescription && (
          <Badge className="bg-green-600 text-white">
            Sem Receita
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6 shadow-md border border-gray-200">
      <div className="flex justify-between">
        <div>
          <h3 className="text-xl font-bold text-pharmacy-dark1">{product.name}</h3>
          <Badge className="bg-gray-200 text-gray-700 mt-1">{product.category}</Badge>
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex items-center">
          <Package className="h-4 w-4 text-gray-500 mr-2" />
          <span>Estoque: {product.stock} unidades</span>
        </div>
        
        {product.interval && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-500 mr-2" />
            <span>Intervalo: {product.interval} dias</span>
          </div>
        )}
        
        <div className="flex items-center">
          <Tag className="h-4 w-4 text-gray-500 mr-2" />
          {getProductBadges(product)}
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          className="border-gray-300"
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
