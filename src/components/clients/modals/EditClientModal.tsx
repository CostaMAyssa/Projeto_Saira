import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  tags: string[];
  last_purchase?: string;
}

interface EditClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onSave: (client: Client) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({ 
  open, 
  onOpenChange, 
  client, 
  onSave 
}) => {
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [email, setEmail] = useState(client.email);
  const [status, setStatus] = useState<'active' | 'inactive'>(client.status);
  const [tags, setTags] = useState<string[]>([...client.tags]);

  // Atualizar os campos quando o cliente mudar
  useEffect(() => {
    setName(client.name);
    setPhone(client.phone);
    setEmail(client.email);
    setStatus(client.status);
    setTags([...client.tags]);
  }, [client]);

  const handleTagToggle = (tag: string) => {
    setTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSave = () => {
    const updatedClient: Client = {
      ...client,
      name,
      phone,
      email,
      status,
      tags
    };
    onSave(updatedClient);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-pharmacy-border1 text-pharmacy-text1 w-[calc(100%-32px)] max-w-lg mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-pharmacy-accent text-xl text-center sm:text-left flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Cliente
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="edit-name" className="text-pharmacy-text1">Nome</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border-gray-300 text-pharmacy-text1"
            />
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="edit-phone" className="text-pharmacy-text1">Telefone</Label>
            <Input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white border-gray-300 text-pharmacy-text1"
            />
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="edit-email" className="text-pharmacy-text1">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-gray-300 text-pharmacy-text1"
            />
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="edit-status" className="text-pharmacy-text1">Status</Label>
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
                  id="edit-tag-vip" 
                  checked={tags.includes('vip')} 
                  onCheckedChange={() => handleTagToggle('vip')} 
                  className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                />
                <label htmlFor="edit-tag-vip" className="text-sm font-medium text-pharmacy-text1">VIP</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-tag-regular" 
                  checked={tags.includes('regular')} 
                  onCheckedChange={() => handleTagToggle('regular')} 
                  className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                />
                <label htmlFor="edit-tag-regular" className="text-sm font-medium text-pharmacy-text1">Regular</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-tag-occasional" 
                  checked={tags.includes('occasional')} 
                  onCheckedChange={() => handleTagToggle('occasional')} 
                  className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                />
                <label htmlFor="edit-tag-occasional" className="text-sm font-medium text-pharmacy-text1">Ocasional</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-tag-continuous" 
                  checked={tags.includes('continuous')} 
                  onCheckedChange={() => handleTagToggle('continuous')} 
                  className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                />
                <label htmlFor="edit-tag-continuous" className="text-sm font-medium text-pharmacy-text1">Uso Contínuo</label>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-4 sm:mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-white text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-pharmacy-accent text-white hover:bg-pharmacy-accent/90"
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 