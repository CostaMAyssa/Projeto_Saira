
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const ProfileTab = () => {
  return (
    <Card className="bg-white border border-pharmacy-border1 shadow-sm">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl text-pharmacy-text1">Informações do Perfil</CardTitle>
        <CardDescription className="text-sm text-pharmacy-text2">
          Atualize suas informações pessoais
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 space-y-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name" className="text-pharmacy-text1">Nome</Label>
          <Input id="name" defaultValue="Maria Farmacêutica" className="bg-white border-gray-300 text-pharmacy-text1" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email" className="text-pharmacy-text1">Email</Label>
          <Input id="email" defaultValue="maria@farmacia.com" className="bg-white border-gray-300 text-pharmacy-text1" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="phone" className="text-pharmacy-text1">Telefone</Label>
          <Input id="phone" defaultValue="+55 11 98765-4321" className="bg-white border-gray-300 text-pharmacy-text1" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="role" className="text-pharmacy-text1">Função</Label>
          <Input id="role" defaultValue="Farmacêutica" disabled className="bg-pharmacy-light2 border-gray-300 text-pharmacy-text2" />
        </div>
        <Button className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white">
          Salvar Alterações
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileTab;
