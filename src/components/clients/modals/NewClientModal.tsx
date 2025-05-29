import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ClientModalFormData } from '../ClientsModule';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: ClientModalFormData) => void;
}

const NewClientModal = ({ isOpen, onClose, onSave }: NewClientModalProps) => {
  const [formData, setFormData] = useState<ClientModalFormData>({
    name: '',
    phone: '',
    email: '',
    status: 'active',
    tags: [],
    is_vip: false,
    profile_type: 'regular',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as 'active' | 'inactive'
    }));
  };

  const handleTagChange = (value: string) => {
    let profile_type: 'regular' | 'occasional' | 'vip';
    let is_vip = false;
    let tags: string[] = [];

    switch (value) {
      case 'VIP':
        profile_type = 'vip';
        is_vip = true;
        tags = ['VIP'];
        break;
      case 'Ocasional':
        profile_type = 'occasional';
        is_vip = false;
        tags = ['Ocasional'];
        break;
      case 'Regular':
        profile_type = 'regular';
        is_vip = false;
        tags = ['Regular'];
        break;
      case 'Uso Contínuo':
        profile_type = 'regular';
        is_vip = false;
        tags = ['Uso Contínuo'];
        break;
      default:
        profile_type = 'regular';
        is_vip = false;
        tags = [];
    }

    setFormData(prev => ({
      ...prev,
      tags,
      profile_type,
      is_vip
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      status: 'active',
      tags: [],
      is_vip: false,
      profile_type: 'regular',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="bg-white border-gray-300"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="bg-white border-gray-300"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Cliente</Label>
              <RadioGroup
                value={formData.tags[0] || ''}
                onValueChange={handleTagChange}
                className="grid grid-cols-2 gap-4"
              >
                <label className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="VIP" id="tag-vip" />
                  <span>VIP</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="Regular" id="tag-regular" />
                  <span>Regular</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="Ocasional" id="tag-occasional" />
                  <span>Ocasional</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="Uso Contínuo" id="tag-continuous" />
                  <span>Uso Contínuo</span>
                </label>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white text-gray-700 border-gray-300"
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