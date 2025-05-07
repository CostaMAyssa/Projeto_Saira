import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from './types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const categories = [
  'Analgésico',
  'Cardiovascular',
  'Gastrointestinal',
  'Antibiótico',
  'Anti-inflamatório',
  'Antialérgico',
];

const tags = [
  'Uso Comum',
  'Uso Contínuo',
  'Antibiótico',
  'Controlado',
];

interface ProductEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (updatedProduct: Product) => void;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
}) => {
  const [formData, setFormData] = useState<Product | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({...product});
    }
  }, [product]);

  if (!formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev!,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev!,
      [name]: parseInt(value) || 0
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev!,
      category: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      
      const currentTags = [...prev.tags];
      if (currentTags.includes(tag)) {
        return {
          ...prev,
          tags: currentTags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          tags: [...currentTags, tag]
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-900 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Editar Produto
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome do produto"
              required
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900">
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="text-gray-900">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stock">Estoque (unidades)</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleNumberChange}
              required
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interval">Intervalo de Uso (dias)</Label>
            <Input
              id="interval"
              name="interval"
              type="number"
              min="0"
              value={formData.interval || ''}
              onChange={handleNumberChange}
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Classificações</Label>
            <div className="space-y-2">
              {tags.map(tag => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={formData.tags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                    className="border-gray-300 text-pharmacy-accent"
                  />
                  <Label htmlFor={`tag-${tag}`} className="text-gray-900">{tag}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="needsPrescription"
              name="needsPrescription"
              checked={formData.needsPrescription}
              onCheckedChange={(checked) => 
                setFormData(prev => ({...prev!, needsPrescription: !!checked}))
              }
              className="border-gray-300 text-pharmacy-accent"
            />
            <Label htmlFor="needsPrescription" className="text-gray-900">Requer Receita Médica</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="controlled"
              name="controlled"
              checked={formData.controlled || false}
              onCheckedChange={(checked) => 
                setFormData(prev => ({...prev!, controlled: !!checked}))
              }
              className="border-gray-300 text-pharmacy-accent"
            />
            <Label htmlFor="controlled" className="text-gray-900">Substância Controlada</Label>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="mr-2 bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditForm; 