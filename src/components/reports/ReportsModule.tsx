import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Input not used directly, can be removed if not needed for future search/filter
// import { Input } from '@/components/ui/input'; 
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { Download, FileDown, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  dashboardService, 
  ReportStats, 
  ChartData, 
  CampaignReportRow 
} from '../../services/dashboardService'; // Import service and types

// Mock data removed

const ReportsModule = () => {
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [messagesByTypeData, setMessagesByTypeData] = useState<ChartData[]>([]);
  const [clientsServedData, setClientsServedData] = useState<ChartData[]>([]);
  const [productCategoryData, setProductCategoryData] = useState<ChartData[]>([]);
  const [campaignReportDisplayData, setCampaignReportDisplayData] = useState<CampaignReportRow[]>([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMessagesByType, setLoadingMessagesByType] = useState(true);
  const [loadingClientsServed, setLoadingClientsServed] = useState(true);
  const [loadingProductCategories, setLoadingProductCategories] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  
  useEffect(() => {
    const fetchAllReportData = async () => {
      try {
        // Fetch report stats
        dashboardService.getReportStats().then(data => {
          setReportStats(data);
          setLoadingStats(false);
        }).catch(err => { 
          console.error("Error fetching report stats:", err); 
          // Set default placeholder data
          setReportStats({
            responseRate: "N/A",
            avgResponseTime: "N/A", 
            conversionRate: "N/A"
          });
          setLoadingStats(false);
        });

        // Fetch messages by type
        dashboardService.getMessagesByType().then(data => {
          setMessagesByTypeData(data.length > 0 ? data : [
            { name: 'WhatsApp', value: 0 },
            { name: 'Email', value: 0 },
            { name: 'Telefone', value: 0 }
          ]);
          setLoadingMessagesByType(false);
        }).catch(err => { 
          console.error("Error fetching messages by type:", err); 
          setMessagesByTypeData([
            { name: 'WhatsApp', value: 0 },
            { name: 'Email', value: 0 },
            { name: 'Telefone', value: 0 }
          ]);
          setLoadingMessagesByType(false);
        });
        
        // Fetch clients served
        dashboardService.getClientsServedLastWeek().then(data => {
          setClientsServedData(data.length > 0 ? data : [
            { name: 'Dom', value: 0 },
            { name: 'Seg', value: 0 },
            { name: 'Ter', value: 0 },
            { name: 'Qua', value: 0 },
            { name: 'Qui', value: 0 },
            { name: 'Sex', value: 0 },
            { name: 'Sáb', value: 0 }
          ]);
          setLoadingClientsServed(false);
        }).catch(err => { 
          console.error("Error fetching clients served:", err); 
          setClientsServedData([
            { name: 'Dom', value: 0 },
            { name: 'Seg', value: 0 },
            { name: 'Ter', value: 0 },
            { name: 'Qua', value: 0 },
            { name: 'Qui', value: 0 },
            { name: 'Sex', value: 0 },
            { name: 'Sáb', value: 0 }
          ]);
          setLoadingClientsServed(false);
        });

        // Fetch product categories
        dashboardService.getProductCategoryDistribution().then(data => {
          setProductCategoryData(data.length > 0 ? data : [
            { name: 'Sem dados', value: 1 }
          ]);
          setLoadingProductCategories(false);
        }).catch(err => { 
          console.error("Error fetching product categories:", err); 
          setProductCategoryData([
            { name: 'Sem dados', value: 1 }
          ]);
          setLoadingProductCategories(false);
        });

        // Fetch campaign reports
        dashboardService.getCampaignReportData().then(data => {
          setCampaignReportDisplayData(data.length > 0 ? data : []);
          setLoadingCampaigns(false);
        }).catch(err => { 
          console.error("Error fetching campaign reports:", err); 
          setCampaignReportDisplayData([]);
          setLoadingCampaigns(false);
        });

      } catch (error) {
        console.error("Error in fetchAllReportData:", error);
        // Ensure all loading states are false
        setLoadingStats(false);
        setLoadingMessagesByType(false);
        setLoadingClientsServed(false);
        setLoadingProductCategories(false);
        setLoadingCampaigns(false);
      }
    };
    
    fetchAllReportData();
  }, []);

  const COLORS = ['#91925c', '#709488', '#666f41', '#3a4543', '#A4B06A', '#869A7C']; // Added more colors

  // Função para converter array em CSV
  const convertToCSV = (objArray: any[]) => { // Added type for objArray
    if (!objArray || objArray.length === 0) {
      toast.error("Não há dados para exportar.");
      return '';
    }
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
  const exportCSV = (data: any[], fileName: string) => { // Added types
    if (!data || data.length === 0) {
      toast.error(`Não há dados para exportar para ${fileName}.`);
      return;
    }
    const csv = convertToCSV(data);
    if (!csv) return; // Do not proceed if CSV string is empty (e.g. no data)

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

  const exportChartDataToCSV = (data: ChartData[], fileName: string) => {
    exportCSV(data, fileName);
  };

  const handleExportCampaignData = () => {
    exportCSV(campaignReportDisplayData, 'top_campanhas.csv');
  };

  const handleExportAll = () => {
    exportChartDataToCSV(messagesByTypeData, 'mensagens_por_tipo.csv');
    exportChartDataToCSV(clientsServedData, 'clientes_atendidos_semana.csv');
    exportChartDataToCSV(productCategoryData, 'distribuicao_categorias_produto.csv');
    handleExportCampaignData(); // Uses its own data state
    // toast.success('Todos os relatórios foram exportados com sucesso!'); // Individual toasts are now shown
  };

  const renderLoadingIndicator = () => (
    <div className="flex justify-center items-center h-full text-gray-500">Carregando dados...</div>
  );

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
              <DropdownMenuItem onClick={() => exportChartDataToCSV(messagesByTypeData, 'mensagens_por_tipo.csv')} className="cursor-pointer">
                Mensagens por Tipo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportChartDataToCSV(clientsServedData, 'clientes_atendidos_semana.csv')} className="cursor-pointer">
                Clientes Atendidos (Semana)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportChartDataToCSV(productCategoryData, 'distribuicao_categorias_produto.csv')} className="cursor-pointer">
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
            {loadingStats ? renderLoadingIndicator() : (
              <>
                <div className="text-3xl font-bold text-gray-900">{reportStats?.responseRate ?? 'N/A'}</div>
                {/* <p className="text-sm text-green-600">↑ 5% em relação ao período anterior</p> */}
                 <p className="text-xs text-gray-500">(Placeholder)</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg">Tempo Médio de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? renderLoadingIndicator() : (
              <>
                <div className="text-3xl font-bold text-gray-900">{reportStats?.avgResponseTime ?? 'N/A'}</div>
                {/* <p className="text-sm text-green-600">↓ 3min em relação ao período anterior</p> */}
                <p className="text-xs text-gray-500">(Placeholder)</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? renderLoadingIndicator() : (
              <>
                <div className="text-3xl font-bold text-gray-900">{reportStats?.conversionRate ?? 'N/A'}</div>
                {/* <p className="text-sm text-green-600">↑ 2% em relação ao período anterior</p> */}
                <p className="text-xs text-gray-500">(Placeholder)</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Mensagens por Tipo</CardTitle> {/* Renamed */}
            <CardDescription className="text-gray-500">
              Distribuição por tipo de mensagem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {loadingMessagesByType ? renderLoadingIndicator() : messagesByTypeData.length === 0 ? <div className="flex justify-center items-center h-full text-gray-500">Sem dados de mensagens.</div> : (
                <ResponsiveContainer width="100%" height="100%">
                  {/* Assuming messagesByTypeData is [{name: 'text', value: 100}, {name: 'image', value: 20}] 
                      The original chart had 'whatsapp' and 'email' keys. We need to adapt.
                      A simple BarChart with one Bar should work if dataKey is "value".
                  */}
                  <BarChart data={messagesByTypeData}>
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
                    {/* Dynamically create bars if needed, or assume a single value per type */}
                    <Bar dataKey="value" name="Quantidade" fill="#91925c" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Clientes Atendidos (Semana)</CardTitle> {/* Updated Title */}
            <CardDescription className="text-gray-500">
              Contagem diária de clientes únicos nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {loadingClientsServed ? renderLoadingIndicator() : clientsServedData.length === 0 ? <div className="flex justify-center items-center h-full text-gray-500">Sem dados de clientes.</div> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clientsServedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" allowDecimals={false} />
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
                      dataKey="value" 
                      name="Clientes Únicos" 
                      stroke="#91925c" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-gray-900">Distribuição de Produtos por Categoria</CardTitle> {/* Updated Title */}
            <CardDescription className="text-gray-500">
              Quantidade de produtos em estoque por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              {loadingProductCategories ? renderLoadingIndicator() : productCategoryData.length === 0 ? <div className="flex justify-center items-center h-full text-gray-500">Sem dados de produtos.</div> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name" // Ensure nameKey is set for labels/tooltips
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {productCategoryData.map((entry, index) => (
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
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900">Relatório de Campanhas</CardTitle> {/* Updated Title */}
            <CardDescription className="text-gray-500">
              Desempenho geral das campanhas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCampaigns ? renderLoadingIndicator() : campaignReportDisplayData.length === 0 ? <div className="flex justify-center items-center h-full text-gray-500">Sem dados de campanhas.</div> : (
              <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                {campaignReportDisplayData.map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {campaign.name}
                      </h3>
                      <p className="text-xs text-gray-600"> {/* Changed color for better contrast with N/A */}
                        {campaign.sent} enviadas, {campaign.responses} respostas
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {campaign.rate}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsModule;
