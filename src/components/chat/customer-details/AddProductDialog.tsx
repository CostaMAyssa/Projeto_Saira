
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from './types';

interface AddProductDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAddProduct: (product: Product) => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ open, setOpen, onAddProduct }) => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [continuous, setContinuous] = useState(false);
  
  const handleAddProduct = () => {
    if (productName.trim() && category.trim()) {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: productName.trim(),
        category: category.trim(),
        lastPurchase: new Date().toLocaleDateString('pt-BR'),
        continuous: continuous,
      };
      
      onAddProduct(newProduct);
      
      // Reset form
      setProductName('');
      setCategory('');
      setContinuous(false);
      
      setOpen(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-pharmacy-dark2 text-white border-pharmacy-dark1">
        <DialogHeader>
          <DialogTitle className="text-pharmacy-green2">Adicionar Produto</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="productName" className="text-white block mb-2">Nome do Produto</Label>
            <Input 
              id="productName" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="bg-pharmacy-dark1 border-pharmacy-green1 text-white"
              placeholder="Ex: Losartana 50mg"
            />
          </div>
          
          <div>
            <Label htmlFor="category" className="text-white block mb-2">Categoria</Label>
            <Input 
              id="category" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-pharmacy-dark1 border-pharmacy-green1 text-white"
              placeholder="Ex: Anti-hipertensivo"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="continuous" 
              checked={continuous}
              onCheckedChange={(checked) => setContinuous(checked as boolean)}
            />
            <Label 
              htmlFor="continuous" 
              className="text-white cursor-pointer"
            >
              Uso Contínuo
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddProduct}
            disabled={!productName.trim() || !category.trim()}
            className="bg-pharmacy-accent hover:bg-pharmacy-green1"
          >
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
