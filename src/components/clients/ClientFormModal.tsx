import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Client } from './types'; // Main UI Client type
import { ClientModalFormData } from './ClientsModule'; // FormData type for the modal

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ClientModalFormData) => void;
  initialClientData?: Client | null;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialClientData 
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [tags, setTags] = useState<string[]>([]); // Changed back to array
  const [is_vip, setIsVip] = useState(false);
  const [birth_date, setBirthDate] = useState(''); // YYYY-MM-DD

  useEffect(() => {
    if (isOpen && initialClientData) {
      setName(initialClientData.name || '');
      setPhone(initialClientData.phone || '');
      setEmail(initialClientData.email || '');
      setStatus(initialClientData.status || 'active');
      setTags(Array.isArray(initialClientData.tags) ? initialClientData.tags : []);
      setIsVip(initialClientData.isVip || false);
      setBirthDate(initialClientData.birth_date || '');
    } else if (isOpen && !initialClientData) {
      // Reset form for "Add New" case when modal opens
      setName('');
      setPhone('');
      setEmail('');
      setStatus('active');
      setTags([]);
      setIsVip(false);
      setBirthDate('');
    }
  }, [isOpen, initialClientData]);

  const handleTagToggle = (tag: string) => {
    setTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('ClientFormModal: Submitting form data', {
        name,
        phone,
        email,
        status,
        tags,
        is_vip,
        birth_date
      });

      // Determine profile_type based on selected tags
      let profile_type: 'regular' | 'occasional' | 'vip' | undefined = undefined;
      if (tags.includes('VIP') || is_vip) {
        profile_type = 'vip';
      } else if (tags.includes('Ocasional')) {
        profile_type = 'occasional';
      } else if (tags.includes('Regular')) {
        profile_type = 'regular';
      }
      
      const formData = {
        name,
        phone,
        email,
        status,
        tags: tags.length > 0 ? tags : undefined,
        is_vip,
        profile_type,
        birth_date: birth_date || undefined,
      };

      console.log('ClientFormModal: Prepared form data', formData);
      
      onSubmit(formData);
    } catch (error) {
      console.error('ClientFormModal: Error in handleSubmit', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-pharmacy-accent text-xl">
            {initialClientData ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-white border-gray-300" />
          </div>
          <div>
            <Label htmlFor="phone">Telefone (WhatsApp)</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="bg-white border-gray-300" />
          </div>
          <div>
            <Label htmlFor="email">Email (opcional)</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-gray-300" />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as 'active' | 'inactive')}>
              <SelectTrigger id="status" className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tags</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-vip" 
                  checked={tags.includes('VIP')} 
                  onCheckedChange={() => handleTagToggle('VIP')} 
                  className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                />
                <Label htmlFor="tag-vip" className="text-sm font-medium">VIP</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-regular" 
                  checked={tags.includes('Regular')} 
                  onCheckedChange={() => handleTagToggle('Regular')} 
                  className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                />
                <Label htmlFor="tag-regular" className="text-sm font-medium">Regular</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-occasional" 
                  checked={tags.includes('Ocasional')} 
                  onCheckedChange={() => handleTagToggle('Ocasional')} 
                  className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                />
                <Label htmlFor="tag-occasional" className="text-sm font-medium">Ocasional</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-continuous" 
                  checked={tags.includes('Uso Contínuo')} 
                  onCheckedChange={() => handleTagToggle('Uso Contínuo')} 
                  className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                />
                <Label htmlFor="tag-continuous" className="text-sm font-medium">Uso Contínuo</Label>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is_vip" checked={is_vip} onCheckedChange={(checked) => setIsVip(!!checked)} />
            <Label htmlFor="is_vip">Cliente VIP</Label>
          </div>
          <div>
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Input id="birth_date" type="date" value={birth_date} onChange={(e) => setBirthDate(e.target.value)} className="bg-white border-gray-300" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} className="bg-white text-gray-700 border-gray-300">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-pharmacy-accent text-white hover:bg-pharmacy-accent/90">
              {initialClientData ? 'Salvar Alterações' : 'Adicionar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientFormModal;
