
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { Download, Calendar } from 'lucide-react';

const ReportsModule = () => {
  const barData = [
    { name: 'Jan', whatsapp: 65, email: 45 },
    { name: 'Fev', whatsapp: 59, email: 40 },
    { name: 'Mar', whatsapp: 80, email: 55 },
    { name: 'Abr', whatsapp: 81, email: 60 },
    { name: 'Mai', whatsapp: 56, email: 45 },
    { name: 'Jun', whatsapp: 55, email: 48 },
  ];

  const lineData = [
    { name: 'Seg', clientes: 12 },
    { name: 'Ter', clientes: 19 },
    { name: 'Qua', clientes: 15 },
    { name: 'Qui', clientes: 8 },
    { name: 'Sex', clientes: 22 },
    { name: 'Sáb', clientes: 16 },
    { name: 'Dom', clientes: 7 },
  ];

  const pieData = [
    { name: 'Hipertensão', value: 35 },
    { name: 'Diabetes', value: 25 },
    { name: 'Antibióticos', value: 15 },
    { name: 'Outros', value: 25 },
  ];

  const COLORS = ['#91925c', '#709488', '#666f41', '#3a4543'];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-pharmacy-dark1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-pharmacy-dark2 rounded-md p-2">
            <Calendar className="h-4 w-4 text-pharmacy-green2 mr-2" />
            <span className="text-pharmacy-green2 text-sm">Último mês</span>
          </div>
          <Button variant="outline" className="text-pharmacy-green2 border-pharmacy-green1">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Taxa de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">78%</div>
            <p className="text-sm text-pharmacy-green2">↑ 5% em relação ao período anterior</p>
          </CardContent>
        </Card>
        
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Tempo Médio de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">12min</div>
            <p className="text-sm text-pharmacy-green2">↓ 3min em relação ao período anterior</p>
          </CardContent>
        </Card>
        
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">22%</div>
            <p className="text-sm text-pharmacy-green2">↑ 2% em relação ao período anterior</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader>
            <CardTitle className="text-white">Mensagens por Canal</CardTitle>
            <CardDescription className="text-muted-foreground">
              Últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a4543" />
                  <XAxis dataKey="name" stroke="#709488" />
                  <YAxis stroke="#709488" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#3a4543', 
                      borderColor: '#666f41',
                      color: '#fff' 
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="whatsapp" name="WhatsApp" fill="#91925c" />
                  <Bar dataKey="email" name="Email" fill="#709488" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <CardHeader>
            <CardTitle className="text-white">Clientes Atendidos</CardTitle>
            <CardDescription className="text-muted-foreground">
              Última semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a4543" />
                  <XAxis dataKey="name" stroke="#709488" />
                  <YAxis stroke="#709488" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#3a4543', 
                      borderColor: '#666f41',
                      color: '#fff' 
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="clientes" 
                    name="Clientes" 
                    stroke="#91925c" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Distribuição por Categoria</CardTitle>
            <CardDescription className="text-muted-foreground">
              Produtos vendidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#3a4543', 
                      borderColor: '#666f41',
                      color: '#fff' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-pharmacy-dark2 border-pharmacy-dark1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Top Campanhas</CardTitle>
            <CardDescription className="text-muted-foreground">
              Por taxa de conversão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Lembrete de Recompra - Hipertensão', rate: '35%', sent: 150, responses: 52 },
                { name: 'Aniversariantes do Mês', rate: '28%', sent: 45, responses: 13 },
                { name: 'Pós-venda - Antibióticos', rate: '23%', sent: 78, responses: 18 },
                { name: 'Lembrete de Recompra - Diabetes', rate: '20%', sent: 112, responses: 22 },
                { name: 'Reativação de Clientes Inativos', rate: '12%', sent: 200, responses: 24 },
              ].map((campaign, index) => (
                <div key={index} className="flex items-center justify-between border-b border-pharmacy-dark1 pb-3">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {campaign.name}
                    </h3>
                    <p className="text-xs text-pharmacy-green2">
                      {campaign.sent} enviadas, {campaign.responses} respostas
                    </p>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {campaign.rate}
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

export default ReportsModule;
