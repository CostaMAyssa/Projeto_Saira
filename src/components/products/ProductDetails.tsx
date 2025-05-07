import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Clock, Tag, Calendar, AlertCircle } from 'lucide-react';
import { Product } from './types';

interface ProductDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  if (!product) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-900 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <DialogDescription>
            <Badge className="bg-gray-200 text-gray-800">{product.category}</Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium">Estoque</p>
              <p>{product.stock} unidades</p>
            </div>
          </div>
          
          {product.interval && (
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium">Intervalo de Uso</p>
                <p>{product.interval} dias</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center">
            <Tag className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium">Classificações</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.tags.map((tag) => (
                  <Badge key={tag} className={getTagBadgeClass(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium">Receita Médica</p>
              <p>{product.needsPrescription ? 'Necessária' : 'Não necessária'}</p>
            </div>
          </div>
          
          {product.controlled && (
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <p className="font-medium">Substância Controlada</p>
                <p>Este medicamento possui controle especial</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button 
            onClick={onClose}
            className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetails; 