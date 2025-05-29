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
  const [tagsString, setTagsString] = useState(''); // Comma-separated string for tags
  const [is_vip, setIsVip] = useState(false);
  const [profile_type, setProfileType] = useState<'regular' | 'occasional' | 'vip' | ''>('');
  const [birth_date, setBirthDate] = useState(''); // YYYY-MM-DD

  useEffect(() => {
    if (isOpen && initialClientData) {
      setName(initialClientData.name || '');
      setPhone(initialClientData.phone || '');
      setEmail(initialClientData.email || '');
      setStatus(initialClientData.status || 'active');
      setTagsString(Array.isArray(initialClientData.tags) ? initialClientData.tags.join(', ') : '');
      setIsVip(initialClientData.isVip || false);
      // Ensure profile_type from Client matches one of the Select options or is empty
      const pfType = initialClientData.profile_type as 'regular' | 'occasional' | 'vip' | undefined;
      setProfileType(pfType && ['regular', 'occasional', 'vip'].includes(pfType) ? pfType : '');
      // Assuming initialClientData.birth_date is already in YYYY-MM-DD or needs conversion
      // For simplicity, assuming it's directly usable or empty string if not present.
      // If initialClientData.birth_date is a Date object or full ISO string, it needs formatting.
      // The `Client` type doesn't specify birth_date, but ClientModalFormData does.
      // So, if initialClientData (type Client) doesn't have it, it should default.
      setBirthDate(initialClientData.birth_date || ''); // Assuming birth_date is on Client type from previous changes
    } else if (isOpen && !initialClientData) {
      // Reset form for "Add New" case when modal opens
      setName('');
      setPhone('');
      setEmail('');
      setStatus('active');
      setTagsString('');
      setIsVip(false);
      setProfileType('');
      setBirthDate('');
    }
  }, [isOpen, initialClientData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    onSubmit({
      name,
      phone,
      email,
      status,
      tags: tagsArray.length > 0 ? tagsArray : undefined, // Pass undefined if no tags, so service can use null
      is_vip,
      profile_type: profile_type || undefined, // Pass undefined if empty, so service can use null
      birth_date: birth_date || undefined, // Pass undefined if empty
    });
  };

  // Common Profile Types for Select
  const profileTypes: { value: 'regular' | 'occasional' | 'vip'; label: string }[] = [
    { value: 'regular', label: 'Regular' },
    { value: 'occasional', label: 'Ocasional' },
    { value: 'vip', label: 'VIP' },
  ];

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
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input id="tags" value={tagsString} onChange={(e) => setTagsString(e.target.value)} className="bg-white border-gray-300" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is_vip" checked={is_vip} onCheckedChange={(checked) => setIsVip(!!checked)} />
            <Label htmlFor="is_vip">Cliente VIP</Label>
          </div>
          <div>
            <Label htmlFor="profile_type">Tipo de Perfil</Label>
            <Select value={profile_type} onValueChange={(value) => setProfileType(value as 'regular' | 'occasional' | 'vip' | '')}>
              <SelectTrigger id="profile_type" className="bg-white border-gray-300">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="">Nenhum</SelectItem>
                {profileTypes.map(pt => <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>)}
              </SelectContent>
            </Select>
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
