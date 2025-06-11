import React, { useState } from 'react';
import { MessageSquare, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/layout/Navigation';
import WhatsAppTab from './tabs/WhatsAppTab';
import EventsTab from './tabs/EventsTab';

const Settings: React.FC = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-pharmacy-text1">Configurações</h1>
              <p className="text-pharmacy-text2 mt-1">
                Configure as integrações e funcionalidades do sistema
              </p>
            </div>

            <Tabs defaultValue="whatsapp" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Eventos</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="whatsapp" className="mt-6">
                <WhatsAppTab />
              </TabsContent>
              
              <TabsContent value="events" className="mt-6">
                <EventsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 