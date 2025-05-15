
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
      <DialogContent className="bg-white border border-gray-200 text-gray-900 rounded-xl p-4 sm:p-6 shadow-md w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">Nova Automação</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="automationType" className="text-gray-700 block mb-2">Tipo de Automação</Label>
            <Select 
              value={automationType} 
              onValueChange={setAutomationType}
            >
              <SelectTrigger 
                id="automationType" 
                className="bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2"
              >
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="lembrete">Lembrete de Recompra</SelectItem>
                <SelectItem value="aniversario">Lembrete de Aniversário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="product" className="text-gray-700 block mb-2">Produto</Label>
            <Select 
              value={selectedProduct} 
              onValueChange={setSelectedProduct}
            >
              <SelectTrigger 
                id="product" 
                className="bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2"
              >
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="reminderDate" className="text-gray-700 block mb-2">Data do Lembrete</Label>
            <Input 
              id="reminderDate" 
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2 w-full"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddAutomation}
            disabled={!selectedProduct || !reminderDate}
            className="bg-[#A7A45F] text-white hover:bg-[#A7A45F]/90"
          >
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAutomationDialog;
