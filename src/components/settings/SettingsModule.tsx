
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { User, Phone, MessageSquare, Lock, Bell, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const SettingsModule = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-white">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-pharmacy-text1">Configurações</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className={`bg-white border border-pharmacy-border1 rounded-lg mb-4 md:mb-6 ${isMobile ? 'flex flex-wrap gap-1 p-1' : ''}`}>
          <TabsTrigger value="profile" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white text-pharmacy-text1 text-xs md:text-sm">
            <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            {!isMobile && "Perfil"}
            {isMobile && ""}
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white text-pharmacy-text1 text-xs md:text-sm">
            <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            {!isMobile && "WhatsApp"}
            {isMobile && ""}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white text-pharmacy-text1 text-xs md:text-sm">
            <Bell className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            {!isMobile && "Notificações"}
            {isMobile && ""}
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white text-pharmacy-text1 text-xs md:text-sm">
            <Lock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            {!isMobile && "Segurança"}
            {isMobile && ""}
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white text-pharmacy-text1 text-xs md:text-sm">
            <Shield className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            {!isMobile && "Usuários e Permissões"}
            {isMobile && ""}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
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
        </TabsContent>
        
        <TabsContent value="whatsapp">
          <Card className="bg-white border border-pharmacy-border1 shadow-sm">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl text-pharmacy-text1">Configurações do WhatsApp</CardTitle>
              <CardDescription className="text-sm text-pharmacy-text2">
                Gerencie suas conexões com o WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-6">
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Números Conectados</h3>
                
                <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  <div>
                    <div className="text-sm md:text-base text-pharmacy-text1 font-medium">+55 11 98765-4321</div>
                    <div className="text-xs md:text-sm text-pharmacy-accent">Principal • Conectado</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="primary-active" defaultChecked={true} />
                      <Label htmlFor="primary-active" className="text-sm text-pharmacy-text1">Ativo</Label>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
                      Configurar
                    </Button>
                  </div>
                </div>
                
                <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  <div>
                    <div className="text-sm md:text-base text-pharmacy-text1 font-medium">+55 11 91234-5678</div>
                    <div className="text-xs md:text-sm text-pharmacy-accent">Secundário • Conectado</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="secondary-active" defaultChecked={false} />
                      <Label htmlFor="secondary-active" className="text-sm text-pharmacy-text1">Ativo</Label>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
                      Configurar
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Configurações de Mensagens</h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div>
                      <Label className="text-sm md:text-base text-pharmacy-text1">Respostas automáticas</Label>
                      <p className="text-xs md:text-sm text-pharmacy-text2">Ativar respostas automáticas quando offline</p>
                    </div>
                    <Switch id="auto-reply" defaultChecked={true} />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div>
                      <Label className="text-sm md:text-base text-pharmacy-text1">Notificações de leitura</Label>
                      <p className="text-xs md:text-sm text-pharmacy-text2">Enviar confirmações de leitura</p>
                    </div>
                    <Switch id="read-receipts" defaultChecked={true} />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div>
                      <Label className="text-sm md:text-base text-pharmacy-text1">Mensagens de boas-vindas</Label>
                      <p className="text-xs md:text-sm text-pharmacy-text2">Enviar mensagem automática para novos contatos</p>
                    </div>
                    <Switch id="welcome-message" defaultChecked={true} />
                  </div>
                </div>
              </div>
              
              <Button className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white">
                <MessageSquare className="mr-2 h-4 w-4" />
                Adicionar Novo Número
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="bg-white border border-pharmacy-border1 shadow-sm">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl text-pharmacy-text1">Preferências de Notificação</CardTitle>
              <CardDescription className="text-sm text-pharmacy-text2">
                Gerencie como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-6">
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Notificações do Sistema</h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div>
                      <Label className="text-sm md:text-base text-pharmacy-text1">Novas mensagens</Label>
                      <p className="text-xs md:text-sm text-pharmacy-text2">Notificar quando receber novas mensagens</p>
                    </div>
                    <Switch id="new-messages" defaultChecked={true} />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div>
                      <Label className="text-sm md:text-base text-pharmacy-text1">Campanhas</Label>
                      <p className="text-xs md:text-sm text-pharmacy-text2">Notificar sobre status de campanhas</p>
                    </div>
                    <Switch id="campaigns-notifications" defaultChecked={true} />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div>
                      <Label className="text-sm md:text-base text-pharmacy-text1">Lembretes</Label>
                      <p className="text-xs md:text-sm text-pharmacy-text2">Notificar sobre lembretes programados</p>
                    </div>
                    <Switch id="reminders-notifications" defaultChecked={true} />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div>
                      <Label className="text-sm md:text-base text-pharmacy-text1">Respostas de formulários</Label>
                      <p className="text-xs md:text-sm text-pharmacy-text2">Notificar sobre novas respostas em formulários</p>
                    </div>
                    <Switch id="forms-notifications" defaultChecked={false} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Canais de Notificação</h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div>
                      <Label className="text-sm md:text-base text-pharmacy-text1">Email</Label>
                      <p className="text-xs md:text-sm text-pharmacy-text2">Receber notificações por email</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked={true} />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div>
                      <Label className="text-sm md:text-base text-pharmacy-text1">Push (navegador)</Label>
                      <p className="text-xs md:text-sm text-pharmacy-text2">Receber notificações push no navegador</p>
                    </div>
                    <Switch id="push-notifications" defaultChecked={true} />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div>
                      <Label className="text-sm md:text-base text-pharmacy-text1">SMS</Label>
                      <p className="text-xs md:text-sm text-pharmacy-text2">Receber notificações importantes por SMS</p>
                    </div>
                    <Switch id="sms-notifications" defaultChecked={false} />
                  </div>
                </div>
              </div>
              
              <Button className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white">
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card className="bg-white border border-pharmacy-border1 shadow-sm">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl text-pharmacy-text1">Segurança da Conta</CardTitle>
              <CardDescription className="text-sm text-pharmacy-text2">
                Gerencie as configurações de segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-6">
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Alterar Senha</h3>
                
                <div className="space-y-3">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="current-password" className="text-pharmacy-text1">Senha Atual</Label>
                    <Input id="current-password" type="password" className="bg-white border-gray-300 text-pharmacy-text1" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="new-password" className="text-pharmacy-text1">Nova Senha</Label>
                    <Input id="new-password" type="password" className="bg-white border-gray-300 text-pharmacy-text1" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="confirm-password" className="text-pharmacy-text1">Confirmar Nova Senha</Label>
                    <Input id="confirm-password" type="password" className="bg-white border-gray-300 text-pharmacy-text1" />
                  </div>
                </div>
                
                <Button className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white">
                  Atualizar Senha
                </Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Verificação em Duas Etapas</h3>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                  <div>
                    <Label className="text-sm md:text-base text-pharmacy-text1">Ativar Verificação em Duas Etapas</Label>
                    <p className="text-xs md:text-sm text-pharmacy-text2">Aumenta a segurança da sua conta</p>
                  </div>
                  <Switch id="two-factor" defaultChecked={true} />
                </div>
                
                <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg">
                  <div className="text-sm md:text-base text-pharmacy-text1 font-medium mb-1">Método de verificação</div>
                  <div className="text-xs md:text-sm text-pharmacy-text2">SMS para +55 11 98765-4321</div>
                  <Button variant="link" className="p-0 text-xs md:text-sm text-pharmacy-accent">Alterar método</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Sessões Ativas</h3>
                
                <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                  <div>
                    <div className="text-sm md:text-base text-pharmacy-text1 font-medium">Este dispositivo</div>
                    <div className="text-xs md:text-sm text-pharmacy-text2">Última atividade: Agora</div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
                    Encerrar
                  </Button>
                </div>
                
                <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                  <div>
                    <div className="text-sm md:text-base text-pharmacy-text1 font-medium">MacBook Pro</div>
                    <div className="text-xs md:text-sm text-pharmacy-text2">Última atividade: 2 horas atrás</div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
                    Encerrar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card className="bg-white border border-pharmacy-border1 shadow-sm">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl text-pharmacy-text1">Usuários e Permissões</CardTitle>
              <CardDescription className="text-sm text-pharmacy-text2">
                Gerencie usuários e suas permissões no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
                  <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Usuários do Sistema</h3>
                  <Button className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white text-xs md:text-sm" size="sm">
                    Adicionar Usuário
                  </Button>
                </div>
                
                <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-pharmacy-accent flex items-center justify-center text-white text-xs md:text-sm font-medium">
                      MF
                    </div>
                    <div>
                      <div className="text-sm md:text-base text-pharmacy-text1 font-medium">Maria Farmacêutica</div>
                      <div className="text-xs md:text-sm text-pharmacy-text2">Administrador • maria@farmacia.com</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
                    Editar
                  </Button>
                </div>
                
                <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-pharmacy-accent flex items-center justify-center text-white text-xs md:text-sm font-medium">
                      JS
                    </div>
                    <div>
                      <div className="text-sm md:text-base text-pharmacy-text1 font-medium">João Silva</div>
                      <div className="text-xs md:text-sm text-pharmacy-text2">Atendente • joao@farmacia.com</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
                    Editar
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Perfis de Acesso</h3>
                
                <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
                  <div>
                    <div className="text-sm md:text-base text-pharmacy-text1 font-medium">Administrador</div>
                    <div className="text-xs md:text-sm text-pharmacy-text2">Acesso completo ao sistema</div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
                    Configurar
                  </Button>
                </div>
                
                <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
                  <div>
                    <div className="text-sm md:text-base text-pharmacy-text1 font-medium">Atendente</div>
                    <div className="text-xs md:text-sm text-pharmacy-text2">Acesso limitado a chat e clientes</div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
                    Configurar
                  </Button>
                </div>
                
                <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
                  <div>
                    <div className="text-sm md:text-base text-pharmacy-text1 font-medium">Gerente</div>
                    <div className="text-xs md:text-sm text-pharmacy-text2">Acesso a relatórios e configurações</div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
                    Configurar
                  </Button>
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
