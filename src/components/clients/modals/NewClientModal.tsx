import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Client } from '../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Client) => void;
}

const NewClientModal = ({ isOpen, onClose, onSave }: NewClientModalProps) => {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'active' | 'inactive'>('active');
  const [tags, setTags] = React.useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: Date.now().toString(),
      name,
      phone,
      email,
      status,
      tags,
      lastPurchase: new Date().toLocaleDateString('pt-BR'),
      isVip: tags.includes('vip'),
      isRegular: tags.includes('regular'),
      isOccasional: tags.includes('occasional')
    };
    
    onSave(newClient);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setStatus('active');
    setTags([]);
  };

  const handleTagToggle = (tag: string) => {
    setTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-pharmacy-border1 text-pharmacy-text1 w-[calc(100%-32px)] max-w-lg mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-pharmacy-accent text-xl text-center sm:text-left">Novo Cliente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="name" className="text-pharmacy-text1">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border-gray-300 text-pharmacy-text1"
              required
            />
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="phone" className="text-pharmacy-text1">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white border-gray-300 text-pharmacy-text1"
              required
            />
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="email" className="text-pharmacy-text1">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-gray-300 text-pharmacy-text1"
              required
            />
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="status" className="text-pharmacy-text1">Status</Label>
            <Select value={status} onValueChange={(value: 'active' | 'inactive') => setStatus(value)}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-pharmacy-text1">Tags</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-vip" 
                  checked={tags.includes('vip')} 
                  onCheckedChange={() => handleTagToggle('vip')} 
                  className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                />
                <label htmlFor="tag-vip" className="text-sm font-medium text-pharmacy-text1">VIP</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-regular" 
                  checked={tags.includes('regular')} 
                  onCheckedChange={() => handleTagToggle('regular')} 
                  className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                />
                <label htmlFor="tag-regular" className="text-sm font-medium text-pharmacy-text1">Regular</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-occasional" 
                  checked={tags.includes('occasional')} 
                  onCheckedChange={() => handleTagToggle('occasional')} 
                  className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                />
                <label htmlFor="tag-occasional" className="text-sm font-medium text-pharmacy-text1">Ocasional</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-continuous" 
                  checked={tags.includes('continuous')} 
                  onCheckedChange={() => handleTagToggle('continuous')} 
                  className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                />
                <label htmlFor="tag-continuous" className="text-sm font-medium text-pharmacy-text1">Uso Contínuo</label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4 sm:mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-white text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-pharmacy-accent text-white hover:bg-pharmacy-accent/90"
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewClientModal; 