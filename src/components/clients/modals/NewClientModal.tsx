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
      isOccasional: tags.includes('ocasional')
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
      <DialogContent className="bg-pharmacy-dark2 border-pharmacy-dark1 text-white">
        <DialogHeader>
          <DialogTitle className="text-pharmacy-accent text-xl">Novo Cliente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-pharmacy-dark1 border-pharmacy-green1"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-pharmacy-dark1 border-pharmacy-green1"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-pharmacy-dark1 border-pharmacy-green1"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: 'active' | 'inactive') => setStatus(value)}>
              <SelectTrigger className="bg-pharmacy-dark1 border-pharmacy-green1">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent className="bg-pharmacy-dark2 border-pharmacy-green1">
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-vip" 
                  checked={tags.includes('vip')} 
                  onCheckedChange={() => handleTagToggle('vip')} 
                  className="border-pharmacy-green1 data-[state=checked]:bg-pharmacy-accent"
                />
                <label htmlFor="tag-vip" className="text-sm font-medium">VIP</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-regular" 
                  checked={tags.includes('regular')} 
                  onCheckedChange={() => handleTagToggle('regular')} 
                  className="border-pharmacy-green1 data-[state=checked]:bg-pharmacy-accent"
                />
                <label htmlFor="tag-regular" className="text-sm font-medium">Regular</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-ocasional" 
                  checked={tags.includes('ocasional')} 
                  onCheckedChange={() => handleTagToggle('ocasional')} 
                  className="border-pharmacy-green1 data-[state=checked]:bg-pharmacy-accent"
                />
                <label htmlFor="tag-ocasional" className="text-sm font-medium">Ocasional</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-uso-continuo" 
                  checked={tags.includes('uso continuo')} 
                  onCheckedChange={() => handleTagToggle('uso continuo')} 
                  className="border-pharmacy-green1 data-[state=checked]:bg-pharmacy-accent"
                />
                <label htmlFor="tag-uso-continuo" className="text-sm font-medium">Uso Contínuo</label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-pharmacy-green1 text-pharmacy-green2"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-pharmacy-accent hover:bg-pharmacy-green1 text-white"
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