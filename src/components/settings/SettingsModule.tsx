
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { User, Phone, MessageSquare, Lock, Bell, Shield } from 'lucide-react';

const SettingsModule = () => {
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-pharmacy-dark1">
      <h1 className="text-2xl font-bold mb-6 text-white">Configurações</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="bg-pharmacy-dark2 border-pharmacy-dark1 mb-6">
          <TabsTrigger value="profile" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white">
            <Phone className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white">
            <Lock className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white">
            <Shield className="h-4 w-4 mr-2" />
            Usuários e Permissões
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
            <CardHeader>
              <CardTitle className="text-white">Informações do Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value="Maria Farmacêutica" className="bg-pharmacy-dark1 border-pharmacy-green1" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value="maria@farmacia.com" className="bg-pharmacy-dark1 border-pharmacy-green1" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value="+55 11 98765-4321" className="bg-pharmacy-dark1 border-pharmacy-green1" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="role">Função</Label>
                <Input id="role" value="Farmacêutica" disabled className="bg-pharmacy-dark1 border-pharmacy-green1 text-muted-foreground" />
              </div>
              <Button className="bg-pharmacy-accent hover:bg-pharmacy-green1">
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="whatsapp">
          <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
            <CardHeader>
              <CardTitle className="text-white">Configurações do WhatsApp</CardTitle>
              <CardDescription>
                Gerencie suas conexões com o WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Números Conectados</h3>
                
                <div className="bg-pharmacy-dark1 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">+55 11 98765-4321</div>
                    <div className="text-sm text-pharmacy-green2">Principal • Conectado</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="primary-active" checked={true} />
                      <Label htmlFor="primary-active">Ativo</Label>
                    </div>
                    <Button variant="outline" size="sm" className="text-pharmacy-green2 border-pharmacy-green1">
                      Configurar
                    </Button>
                  </div>
                </div>
                
                <div className="bg-pharmacy-dark1 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">+55 11 91234-5678</div>
                    <div className="text-sm text-pharmacy-green2">Secundário • Conectado</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="secondary-active" checked={false} />
                      <Label htmlFor="secondary-active">Ativo</Label>
                    </div>
                    <Button variant="outline" size="sm" className="text-pharmacy-green2 border-pharmacy-green1">
                      Configurar
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Configurações de Mensagens</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Respostas automáticas</Label>
                      <p className="text-sm text-muted-foreground">Ativar respostas automáticas quando offline</p>
                    </div>
                    <Switch id="auto-reply" checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Notificações de leitura</Label>
                      <p className="text-sm text-muted-foreground">Enviar confirmações de leitura</p>
                    </div>
                    <Switch id="read-receipts" checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Mensagens de boas-vindas</Label>
                      <p className="text-sm text-muted-foreground">Enviar mensagem automática para novos contatos</p>
                    </div>
                    <Switch id="welcome-message" checked={true} />
                  </div>
                </div>
              </div>
              
              <Button className="bg-pharmacy-accent hover:bg-pharmacy-green1">
                <MessageSquare className="mr-2 h-4 w-4" />
                Adicionar Novo Número
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
            <CardHeader>
              <CardTitle className="text-white">Preferências de Notificação</CardTitle>
              <CardDescription>
                Gerencie como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Notificações do Sistema</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Novas mensagens</Label>
                      <p className="text-sm text-muted-foreground">Notificar quando receber novas mensagens</p>
                    </div>
                    <Switch id="new-messages" checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Campanhas</Label>
                      <p className="text-sm text-muted-foreground">Notificar sobre status de campanhas</p>
                    </div>
                    <Switch id="campaigns-notifications" checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Lembretes</Label>
                      <p className="text-sm text-muted-foreground">Notificar sobre lembretes programados</p>
                    </div>
                    <Switch id="reminders-notifications" checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Respostas de formulários</Label>
                      <p className="text-sm text-muted-foreground">Notificar sobre novas respostas em formulários</p>
                    </div>
                    <Switch id="forms-notifications" checked={false} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Canais de Notificação</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Email</Label>
                      <p className="text-sm text-muted-foreground">Receber notificações por email</p>
                    </div>
                    <Switch id="email-notifications" checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Push (navegador)</Label>
                      <p className="text-sm text-muted-foreground">Receber notificações push no navegador</p>
                    </div>
                    <Switch id="push-notifications" checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">SMS</Label>
                      <p className="text-sm text-muted-foreground">Receber notificações importantes por SMS</p>
                    </div>
                    <Switch id="sms-notifications" checked={false} />
                  </div>
                </div>
              </div>
              
              <Button className="bg-pharmacy-accent hover:bg-pharmacy-green1">
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
            <CardHeader>
              <CardTitle className="text-white">Segurança da Conta</CardTitle>
              <CardDescription>
                Gerencie as configurações de segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Alterar Senha</h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input id="current-password" type="password" className="bg-pharmacy-dark1 border-pharmacy-green1" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input id="new-password" type="password" className="bg-pharmacy-dark1 border-pharmacy-green1" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input id="confirm-password" type="password" className="bg-pharmacy-dark1 border-pharmacy-green1" />
                  </div>
                  
                  <Button className="bg-pharmacy-accent hover:bg-pharmacy-green1">
                    Atualizar Senha
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Autenticação de Dois Fatores</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Ativar 2FA</Label>
                    <p className="text-sm text-muted-foreground">Adicionar uma camada extra de segurança</p>
                  </div>
                  <Switch id="2fa" checked={false} />
                </div>
                
                <div className="bg-pharmacy-dark1 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta, exigindo uma verificação adicional ao fazer login.
                  </p>
                  <Button variant="outline" className="text-pharmacy-green2 border-pharmacy-green1" disabled>
                    Configurar Autenticação de Dois Fatores
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Sessões Ativas</h3>
                
                <div className="bg-pharmacy-dark1 p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-pharmacy-dark2 pb-3">
                    <div>
                      <div className="text-white font-medium">Chrome - Windows</div>
                      <div className="text-sm text-pharmacy-green2">Atual • São Paulo, Brasil</div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-pharmacy-green2" disabled>
                      Sessão Atual
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-pharmacy-dark2 pb-3">
                    <div>
                      <div className="text-white font-medium">Safari - iOS</div>
                      <div className="text-sm text-pharmacy-green2">Último acesso: 2 dias atrás • São Paulo, Brasil</div>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white">
                      Encerrar
                    </Button>
                  </div>
                  
                  <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white w-full">
                    Encerrar Todas as Outras Sessões
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
            <CardHeader>
              <CardTitle className="text-white">Usuários e Permissões</CardTitle>
              <CardDescription>
                Gerencie os usuários do sistema e suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Usuários</h3>
                <Button className="bg-pharmacy-accent hover:bg-pharmacy-green1">
                  <User className="mr-2 h-4 w-4" />
                  Adicionar Usuário
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-pharmacy-dark1 p-4 rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-pharmacy-green1 flex items-center justify-center text-white font-medium mr-3">
                      MF
                    </div>
                    <div>
                      <div className="text-white font-medium">Maria Farmacêutica</div>
                      <div className="text-sm text-pharmacy-green2">maria@farmacia.com • Administrador</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="text-pharmacy-green2 border-pharmacy-green1">
                      Editar
                    </Button>
                  </div>
                </div>
                
                <div className="bg-pharmacy-dark1 p-4 rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-pharmacy-green1 flex items-center justify-center text-white font-medium mr-3">
                      JS
                    </div>
                    <div>
                      <div className="text-white font-medium">João Silva</div>
                      <div className="text-sm text-pharmacy-green2">joao@farmacia.com • Farmacêutico</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="text-pharmacy-green2 border-pharmacy-green1">
                      Editar
                    </Button>
                  </div>
                </div>
                
                <div className="bg-pharmacy-dark1 p-4 rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-pharmacy-green1 flex items-center justify-center text-white font-medium mr-3">
                      PO
                    </div>
                    <div>
                      <div className="text-white font-medium">Pedro Oliveira</div>
                      <div className="text-sm text-pharmacy-green2">pedro@farmacia.com • Atendente</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="text-pharmacy-green2 border-pharmacy-green1">
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-medium text-white">Funções e Permissões</h3>
                
                <div className="bg-pharmacy-dark1 p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-pharmacy-dark2 pb-3">
                    <div>
                      <div className="text-white font-medium">Administrador</div>
                      <div className="text-sm text-pharmacy-green2">Acesso total ao sistema</div>
                    </div>
                    <Button variant="outline" size="sm" className="text-pharmacy-green2 border-pharmacy-green1">
                      Configurar
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-pharmacy-dark2 pb-3">
                    <div>
                      <div className="text-white font-medium">Farmacêutico</div>
                      <div className="text-sm text-pharmacy-green2">Acesso a clientes, produtos e WhatsApp</div>
                    </div>
                    <Button variant="outline" size="sm" className="text-pharmacy-green2 border-pharmacy-green1">
                      Configurar
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3">
                    <div>
                      <div className="text-white font-medium">Atendente</div>
                      <div className="text-sm text-pharmacy-green2">Acesso limitado a WhatsApp e consulta de produtos</div>
                    </div>
                    <Button variant="outline" size="sm" className="text-pharmacy-green2 border-pharmacy-green1">
                      Configurar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsModule;
