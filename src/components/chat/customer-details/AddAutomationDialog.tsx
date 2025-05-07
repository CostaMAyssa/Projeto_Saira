
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddAutomationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAddAutomation: (data: any) => void;
  products: { id: string; name: string }[];
}

const AddAutomationDialog: React.FC<AddAutomationDialogProps> = ({ open, setOpen, onAddAutomation, products }) => {
  const [automationType, setAutomationType] = useState('lembrete');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  
  const handleAddAutomation = () => {
    if (selectedProduct && reminderDate) {
      const product = products.find(p => p.id === selectedProduct);
      const newAutomation = {
        type: automationType,
        productId: selectedProduct,
        productName: product?.name || '',
        reminderDate: reminderDate,
      };
      
      onAddAutomation(newAutomation);
      
      // Reset form
      setSelectedProduct('');
      setReminderDate('');
      
      setOpen(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-pharmacy-dark2 text-white border-pharmacy-dark1">
        <DialogHeader>
          <DialogTitle className="text-pharmacy-green2">Nova Automação</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="automationType" className="text-white block mb-2">Tipo de Automação</Label>
            <Select 
              value={automationType} 
              onValueChange={setAutomationType}
            >
              <SelectTrigger 
                id="automationType" 
                className="bg-pharmacy-dark1 border-pharmacy-green1 text-white"
              >
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-pharmacy-dark2 border-pharmacy-green1">
                <SelectItem value="lembrete">Lembrete de Recompra</SelectItem>
                <SelectItem value="aniversario">Lembrete de Aniversário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="product" className="text-white block mb-2">Produto</Label>
            <Select 
              value={selectedProduct} 
              onValueChange={setSelectedProduct}
            >
              <SelectTrigger 
                id="product" 
                className="bg-pharmacy-dark1 border-pharmacy-green1 text-white"
              >
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent className="bg-pharmacy-dark2 border-pharmacy-green1">
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="reminderDate" className="text-white block mb-2">Data do Lembrete</Label>
            <Input 
              id="reminderDate" 
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="bg-pharmacy-dark1 border-pharmacy-green1 text-white"
            />
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
            onClick={handleAddAutomation}
            disabled={!selectedProduct || !reminderDate}
            className="bg-pharmacy-accent hover:bg-pharmacy-green1"
          >
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAutomationDialog;
