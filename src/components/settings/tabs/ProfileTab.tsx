import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from '@/components/ui/use-toast';

const ProfileTab = () => {
  const { user, session } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    role: user?.user_metadata?.role || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        role: user.user_metadata?.role || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        email: formData.email,
        data: {
          name: formData.name,
          phone: formData.phone,
          role: formData.role
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Suas informações foram atualizadas.",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar suas informações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border border-pharmacy-border1 shadow-sm">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl text-pharmacy-text1">Informações do Perfil</CardTitle>
        <CardDescription className="text-sm text-pharmacy-text2">
          Atualize suas informações pessoais
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name" className="text-pharmacy-text1">Nome</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={handleInputChange}
              className="bg-white border-gray-300 text-pharmacy-text1" 
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="email" className="text-pharmacy-text1">Email</Label>
            <Input 
              id="email" 
              value={formData.email}
              onChange={handleInputChange}
              className="bg-white border-gray-300 text-pharmacy-text1" 
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="phone" className="text-pharmacy-text1">Telefone</Label>
            <Input 
              id="phone" 
              value={formData.phone}
              onChange={handleInputChange}
              className="bg-white border-gray-300 text-pharmacy-text1" 
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="role" className="text-pharmacy-text1">Função</Label>
            <Input 
              id="role" 
              value={formData.role}
              disabled 
              className="bg-pharmacy-light2 border-gray-300 text-pharmacy-text2" 
            />
          </div>
          <Button 
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileTab;
