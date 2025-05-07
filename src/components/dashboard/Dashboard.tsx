import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MessageSquare, Users, Package, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-pharmacy-accent" />
              Conversas
            </CardTitle>
            <CardDescription className="text-gray-500 text-xs">
              Últimas 24 horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">28</div>
            <p className="text-sm text-green-600">↑ 12% em relação a ontem</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-pharmacy-accent" />
              Clientes Ativos
            </CardTitle>
            <CardDescription className="text-gray-500 text-xs">
              Este mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">142</div>
            <p className="text-sm text-green-600">↑ 5% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg flex items-center">
              <Package className="mr-2 h-5 w-5 text-pharmacy-accent" />
              Produtos Vendidos
            </CardTitle>
            <CardDescription className="text-gray-500 text-xs">
              Este mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">215</div>
            <p className="text-sm text-green-600">↑ 8% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Conversas por Dia</CardTitle>
            <CardDescription className="text-gray-500">
              Últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e5e7eb',
                      color: '#111827' 
                    }} 
                  />
                  <Bar dataKey="value" fill="#91925c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Próximos Lembretes</CardTitle>
            <CardDescription className="text-gray-500">
              Automações agendadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 overflow-y-auto pr-1 custom-scrollbar">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {index === 1 ? 'Lembrete de Recompra - Losartana' : 
                         index === 2 ? 'Aniversário - Maria Santos' : 
                         index === 3 ? 'Lembrete de Recompra - Insulina' : 
                         index === 4 ? 'Pós-venda - Medicamentos novos' :
                         index === 5 ? 'Lembrete de Recompra - Dipirona' : 
                         'Aniversário - João Silva'}
                      </h3>
                      <p className="text-xs text-green-600">
                        {index === 1 ? '15 clientes' : 
                         index === 2 ? '1 cliente' : 
                         index === 3 ? '8 clientes' : 
                         index === 4 ? '12 clientes' :
                         index === 5 ? '7 clientes' : 
                         '1 cliente'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {index === 1 ? 'Hoje' : 
                       index === 2 ? 'Amanhã' : 
                       index === 3 ? 'Em 2 dias' : 
                       index === 4 ? 'Em 3 dias' :
                       index === 5 ? 'Em 4 dias' : 
                       'Em 5 dias'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
