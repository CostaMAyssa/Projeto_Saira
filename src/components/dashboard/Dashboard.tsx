
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
    <div className="flex-1 p-6 overflow-y-auto bg-pharmacy-dark1">
      <h1 className="text-2xl font-bold mb-6 text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-pharmacy-accent" />
              Conversas
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Últimas 24 horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">28</div>
            <p className="text-xs text-pharmacy-green2">↑ 12% em relação a ontem</p>
          </CardContent>
        </Card>
        
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center">
              <Users className="mr-2 h-5 w-5 text-pharmacy-accent" />
              Clientes Ativos
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Este mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">142</div>
            <p className="text-xs text-pharmacy-green2">↑ 5% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center">
              <Package className="mr-2 h-5 w-5 text-pharmacy-accent" />
              Produtos Vendidos
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Este mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">215</div>
            <p className="text-xs text-pharmacy-green2">↑ 8% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center">
              <Bell className="mr-2 h-5 w-5 text-pharmacy-accent" />
              Campanhas Ativas
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Neste momento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4</div>
            <p className="text-xs text-pharmacy-green2">2 agendadas para a próxima semana</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader>
            <CardTitle className="text-white">Conversas por Dia</CardTitle>
            <CardDescription className="text-muted-foreground">
              Últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" stroke="#709488" />
                  <YAxis stroke="#709488" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#3a4543', 
                      borderColor: '#666f41',
                      color: '#fff' 
                    }} 
                  />
                  <Bar dataKey="value" fill="#91925c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader>
            <CardTitle className="text-white">Próximos Lembretes</CardTitle>
            <CardDescription className="text-muted-foreground">
              Automações agendadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="flex items-center justify-between border-b border-pharmacy-dark1 pb-3">
                  <div>
                    <h3 className="text-sm font-medium text-white">
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
                  <span className="text-xs text-muted-foreground">
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
