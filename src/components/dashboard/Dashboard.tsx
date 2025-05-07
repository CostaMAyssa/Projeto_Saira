import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, Users, Package, Bell } from 'lucide-react';

const data = [
  { name: 'Seg', value: 12 },
  { name: 'Ter', value: 19 },
  { name: 'Qua', value: 15 },
  { name: 'Qui', value: 8 },
  { name: 'Sex', value: 22 },
  { name: 'Sáb', value: 16 },
  { name: 'Dom', value: 7 },
];

const Dashboard = () => {
  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-pharmacy-dark1">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <div className="p-4 flex flex-col">
            <div className="flex items-center mb-1">
              <MessageSquare className="mr-2 h-5 w-5 text-pharmacy-accent" />
              <h3 className="text-white font-medium text-base">Conversas</h3>
            </div>
            <p className="text-xs text-pharmacy-green2 mb-2">Últimas 24 horas</p>
            <div className="flex flex-col">
              <p className="text-2xl font-bold text-white">28</p>
              <p className="text-xs text-pharmacy-green2">↑ 12% em relação a ontem</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <div className="p-4 flex flex-col">
            <div className="flex items-center mb-1">
              <Users className="mr-2 h-5 w-5 text-pharmacy-accent" />
              <h3 className="text-white font-medium text-base">Clientes Ativos</h3>
            </div>
            <p className="text-xs text-pharmacy-green2 mb-2">Este mês</p>
            <div className="flex flex-col">
              <p className="text-2xl font-bold text-white">142</p>
              <p className="text-xs text-pharmacy-green2">↑ 5% em relação ao mês anterior</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <div className="p-4 flex flex-col">
            <div className="flex items-center mb-1">
              <Package className="mr-2 h-5 w-5 text-pharmacy-accent" />
              <h3 className="text-white font-medium text-base">Produtos Vendidos</h3>
            </div>
            <p className="text-xs text-pharmacy-green2 mb-2">Este mês</p>
            <div className="flex flex-col">
              <p className="text-2xl font-bold text-white">215</p>
              <p className="text-xs text-pharmacy-green2">↑ 8% em relação ao mês anterior</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <div className="p-4 flex flex-col">
            <div className="flex items-center mb-1">
              <Bell className="mr-2 h-5 w-5 text-pharmacy-accent" />
              <h3 className="text-white font-medium text-base">Campanhas Ativas</h3>
            </div>
            <p className="text-xs text-pharmacy-green2 mb-2">Neste momento</p>
            <div className="flex flex-col">
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-xs text-pharmacy-green2">2 agendadas para a próxima semana</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
            <CardTitle className="text-white text-base sm:text-lg">Conversas por Dia</CardTitle>
            <CardDescription className="text-muted-foreground text-xs sm:text-sm">
              Últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 pb-3 sm:pb-4">
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <XAxis dataKey="name" stroke="#709488" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#709488" tick={{ fontSize: 12 }} width={25} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#3a4543', 
                      borderColor: '#666f41',
                      color: '#fff',
                      fontSize: '12px',
                      padding: '8px'
                    }} 
                  />
                  <Bar dataKey="value" fill="#91925c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
            <CardTitle className="text-white text-base sm:text-lg">Próximos Lembretes</CardTitle>
            <CardDescription className="text-muted-foreground text-xs sm:text-sm">
              Automações agendadas
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="flex items-center justify-between border-b border-pharmacy-dark1 pb-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-white">
                      {index === 1 ? 'Lembrete de Recompra - Losartana' : 
                       index === 2 ? 'Aniversário - Maria Santos' : 
                       index === 3 ? 'Lembrete de Recompra - Insulina' : 
                       'Pós-venda - Medicamentos novos'}
                    </h3>
                    <p className="text-xs text-pharmacy-green2">
                      {index === 1 ? '15 clientes' : 
                       index === 2 ? '1 cliente' : 
                       index === 3 ? '8 clientes' : 
                       '12 clientes'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {index === 1 ? 'Hoje' : 
                     index === 2 ? 'Amanhã' : 
                     index === 3 ? 'Em 2 dias' : 
                     'Em 3 dias'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
