
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Removed LineChart, Line as they are not used
import { MessageSquare, Users, Package, Bell, ArrowRight, AlertTriangle } from 'lucide-react'; // Added AlertTriangle for errors
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { dashboardService, DashboardStats, ChartData, Reminder } from '../../services/dashboardService'; // Import service and types

// Mock data removed

const Dashboard = () => {
  const { toast } = useToast();
  const [activeChart, setActiveChart] = useState<'daily' | 'monthly'>('daily');
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dailyChartData, setDailyChartData] = useState<ChartData[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<ChartData[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingStats(true);
        const stats = await dashboardService.getDashboardStats();
        setDashboardStats(stats);
        setLoadingStats(false);

        setLoadingCharts(true);
        const dailyData = await dashboardService.getDailyConversations();
        setDailyChartData(dailyData);
        const monthlyData = await dashboardService.getMonthlyConversations();
        setMonthlyChartData(monthlyData);
        setLoadingCharts(false);

        setLoadingReminders(true);
        const reminders = await dashboardService.getUpcomingReminders();
        setUpcomingReminders(reminders);
        setLoadingReminders(false);
        
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Falha ao carregar dados do dashboard. Tente novamente mais tarde.");
        // Set all loading states to false on error to stop loading indicators
        setLoadingStats(false);
        setLoadingCharts(false);
        setLoadingReminders(false);
      }
    };

    fetchData();
  }, []);
  
  const handleViewAllReminders = () => {
    toast({
      title: "Visualizar todos os lembretes",
      description: "Esta funcionalidade estará disponível em breve.",
    });
  };

  const handleViewAllConversations = () => {
    toast({
      title: "Visualizar todas as conversas",
      description: "Esta funcionalidade estará disponível em breve.",
    });
  };
  
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className={`${activeChart === 'daily' ? 'bg-pharmacy-accent text-white hover:bg-pharmacy-accent/90' : 'text-pharmacy-accent hover:bg-gray-100'}`}
            onClick={() => setActiveChart('daily')}
          >
            Diário
          </Button>
          <Button 
            variant="outline" 
            className={`${activeChart === 'monthly' ? 'bg-pharmacy-accent text-white hover:bg-pharmacy-accent/90' : 'text-pharmacy-accent hover:bg-gray-100'}`}
            onClick={() => setActiveChart('monthly')}
          >
            Mensal
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Erro ao carregar dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-pharmacy-accent" />
              Conversas
            </CardTitle>
            <CardDescription className="text-gray-500 text-xs">
              {loadingStats ? "Carregando..." : dashboardStats?.conversations.period || "Últimas 24 horas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="text-2xl font-bold text-gray-400">Carregando...</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900">{dashboardStats?.conversations.total ?? 'N/A'}</div>
                <p className="text-sm text-green-600">{dashboardStats?.conversations.change ?? ''}</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-pharmacy-accent" />
              Clientes Ativos
            </CardTitle>
            <CardDescription className="text-gray-500 text-xs">
              {loadingStats ? "Carregando..." : dashboardStats?.activeClients.period || "Este mês"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="text-2xl font-bold text-gray-400">Carregando...</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900">{dashboardStats?.activeClients.total ?? 'N/A'}</div>
                <p className="text-sm text-green-600">{dashboardStats?.activeClients.change ?? ''}</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg flex items-center">
              <Package className="mr-2 h-5 w-5 text-pharmacy-accent" />
              Produtos Vendidos
            </CardTitle>
            <CardDescription className="text-gray-500 text-xs">
              {loadingStats ? "Carregando..." : dashboardStats?.productsSold.period || "Este mês"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="text-2xl font-bold text-gray-400">Carregando...</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900">{dashboardStats?.productsSold.total ?? 'N/A'}</div>
                <p className="text-sm text-green-600">{dashboardStats?.productsSold.change ?? ''}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex justify-between items-start">
            <div>
              <CardTitle className="text-gray-900">Conversas</CardTitle> {/* Title simplified */}
              <CardDescription className="text-gray-500">
                {activeChart === 'daily' ? 'Últimos 7 dias' : 'Últimos 6 meses'}
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-pharmacy-accent hover:text-pharmacy-accent/80" 
              onClick={handleViewAllConversations}
            >
              Ver todos
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingCharts ? (
              <div className="h-80 flex items-center justify-center text-gray-400">Carregando gráfico...</div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeChart === 'daily' ? dailyChartData : monthlyChartData}>
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
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex justify-between items-start">
            <div>
              <CardTitle className="text-gray-900">Próximos Lembretes</CardTitle>
              <CardDescription className="text-gray-500">
                Automações agendadas
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-pharmacy-accent hover:text-pharmacy-accent/80"
              onClick={handleViewAllReminders}
            >
              Ver todos
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80 overflow-y-auto pr-1 custom-scrollbar">
              {loadingReminders ? (
                <div className="h-full flex items-center justify-center text-gray-400">Carregando lembretes...</div>
              ) : upcomingReminders.length === 0 && !loadingReminders ? (
                 <div className="h-full flex items-center justify-center text-gray-400">Nenhum lembrete próximo.</div>
              ) : (
                <div className="space-y-4">
                  {upcomingReminders.map((reminder) => (
                    <div 
                      key={reminder.id} 
                      className="flex items-center justify-between border-b border-gray-200 pb-3 cursor-pointer hover:bg-gray-50 rounded-md p-2"
                      onClick={() => {
                        toast({
                          title: "Detalhe do lembrete",
                          description: `Detalhes do lembrete "${reminder.title}" serão exibidos em breve.`,
                        });
                      }}
                    >
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {reminder.title}
                        </h3>
                        <p className="text-xs text-green-600">
                          {reminder.clientCount > 0 ? `${reminder.clientCount} cliente(s)` : 'Contagem de clientes não disponível'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {dashboardService.formatRelativeDate(reminder.scheduledDate)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
