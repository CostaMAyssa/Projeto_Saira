import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { Download, FileDown } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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

  const campaignData = [
    { name: 'Lembrete de Recompra - Hipertensão', rate: '35%', sent: 150, responses: 52 },
    { name: 'Aniversariantes do Mês', rate: '28%', sent: 45, responses: 13 },
    { name: 'Pós-venda - Antibióticos', rate: '23%', sent: 78, responses: 18 },
    { name: 'Lembrete de Recompra - Diabetes', rate: '20%', sent: 112, responses: 22 },
    { name: 'Reativação de Clientes Inativos', rate: '12%', sent: 200, responses: 24 },
  ];

  const COLORS = ['#91925c', '#709488', '#666f41', '#3a4543'];

  // Função para converter array em CSV
  const convertToCSV = (objArray) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    // Adicionar cabeçalhos
    const headers = Object.keys(array[0]);
    str += headers.join(',') + '\r\n';

    // Adicionar dados
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (const index in headers) {
        if (line !== '') line += ',';
        let value = array[i][headers[index]];
        // Se o valor contém vírgula, aspas ou quebra de linha, envolva com aspas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        line += value !== undefined ? value : '';
      }
      str += line + '\r\n';
    }
    return str;
  };

  // Função para exportar dados como CSV
  const exportCSV = (data, fileName) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Relatório ${fileName} exportado com sucesso!`);
  };

  const handleExportBarData = () => {
    exportCSV(barData, 'mensagens_por_canal.csv');
  };

  const handleExportLineData = () => {
    exportCSV(lineData, 'clientes_atendidos.csv');
  };

  const handleExportPieData = () => {
    exportCSV(pieData, 'distribuicao_categorias.csv');
  };

  const handleExportCampaignData = () => {
    exportCSV(campaignData, 'top_campanhas.csv');
  };

  const handleExportAll = () => {
    handleExportBarData();
    handleExportLineData();
    handleExportPieData();
    handleExportCampaignData();
    toast.success('Todos os relatórios foram exportados com sucesso!');
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={handleExportAll} className="cursor-pointer">
                Exportar todos os relatórios
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportBarData} className="cursor-pointer">
                Mensagens por Canal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportLineData} className="cursor-pointer">
                Clientes Atendidos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPieData} className="cursor-pointer">
                Distribuição por Categoria
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCampaignData} className="cursor-pointer">
                Top Campanhas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg">Taxa de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">78%</div>
            <p className="text-sm text-green-600">↑ 5% em relação ao período anterior</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg">Tempo Médio de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">12min</div>
            <p className="text-sm text-green-600">↓ 3min em relação ao período anterior</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">22%</div>
            <p className="text-sm text-green-600">↑ 2% em relação ao período anterior</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Mensagens por Canal</CardTitle>
            <CardDescription className="text-gray-500">
              Últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
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
                  <Legend />
                  <Bar dataKey="whatsapp" name="WhatsApp" fill="#91925c" />
                  <Bar dataKey="email" name="Email" fill="#709488" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Clientes Atendidos</CardTitle>
            <CardDescription className="text-gray-500">
              Última semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
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
        <Card className="bg-white border-gray-200 shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-gray-900">Distribuição por Categoria</CardTitle>
            <CardDescription className="text-gray-500">
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
                      backgroundColor: '#ffffff', 
                      borderColor: '#e5e7eb',
                      color: '#111827' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900">Top Campanhas</CardTitle>
            <CardDescription className="text-gray-500">
              Por taxa de conversão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignData.map((campaign, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {campaign.name}
                    </h3>
                    <p className="text-xs text-green-600">
                      {campaign.sent} enviadas, {campaign.responses} respostas
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
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
