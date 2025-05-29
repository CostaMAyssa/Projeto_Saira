import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard'; // Adjust path as necessary
import { dashboardService, DashboardStats, ChartData, Reminder } from '../../services/dashboardService';

// Mock the dashboardService
jest.mock('../../services/dashboardService', () => ({
  dashboardService: {
    getDashboardStats: jest.fn(),
    getDailyConversations: jest.fn(),
    getMonthlyConversations: jest.fn(),
    getUpcomingReminders: jest.fn(),
    formatRelativeDate: jest.fn((dateString: string) => { // Mock the actual utility function if it's simple
      if (!dateString) return "Invalid date";
      // Simplified mock, real one is more complex
      if (dateString.includes("2023-01-01")) return "01/01/2023"; 
      return new Date(dateString).toLocaleDateString('pt-BR');
    }),
  },
}));

// Mock recharts ResponsiveContainer and specific charts to avoid rendering issues in JSDOM
jest.mock('recharts', () => {
  const OriginalRecharts = jest.requireActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: '100%', height: '100%' }}>{children}</div>
    ),
    BarChart: ({ children, data }: { children: React.ReactNode, data: any[] }) => <div data-testid="bar-chart" data-props={JSON.stringify(data)}>{children}</div>,
    LineChart: ({ children, data }: { children: React.ReactNode, data: any[] }) => <div data-testid="line-chart" data-props={JSON.stringify(data)}>{children}</div>,
    // Mock other chart components if used and causing issues (Tooltip, Legend, etc.)
    Bar: () => <div data-testid="bar-element" />,
    XAxis: () => <div data-testid="xaxis-element" />,
    YAxis: () => <div data-testid="yaxis-element" />,
    CartesianGrid: () => <div data-testid="grid-element" />,
    Tooltip: () => <div data-testid="tooltip-element" />,
    Legend: () => <div data-testid="legend-element" />,
  };
});


// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));


const mockStats: DashboardStats = {
  conversations: { total: 150, change: "N/A", period: 'Últimas 24 horas' },
  activeClients: { total: 75, change: "N/A", period: 'Este mês' },
  productsSold: { total: 30, change: "N/A", period: 'Este mês' },
};

const mockDailyChart: ChartData[] = [
  { name: 'Seg', value: 10 }, { name: 'Ter', value: 20 },
];
const mockMonthlyChart: ChartData[] = [
  { name: 'Jan', value: 100 }, { name: 'Fev', value: 200 },
];
const mockReminders: Reminder[] = [
  { id: 'rem1', title: 'Lembrete Teste 1', clientCount: 5, scheduledDate: new Date(2023,0,1).toISOString(), type: 'recompra' },
  { id: 'rem2', title: 'Aniversário Teste', clientCount: 1, scheduledDate: new Date(2023,0,2).toISOString(), type: 'aniversario' },
];


describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (dashboardService.getDashboardStats as jest.Mock).mockResolvedValue(mockStats);
    (dashboardService.getDailyConversations as jest.Mock).mockResolvedValue(mockDailyChart);
    (dashboardService.getMonthlyConversations as jest.Mock).mockResolvedValue(mockMonthlyChart);
    (dashboardService.getUpcomingReminders as jest.Mock).mockResolvedValue(mockReminders);
  });

  it('displays loading state initially for all sections', () => {
    // Temporarily make promises not resolve immediately to catch initial loading state
    (dashboardService.getDashboardStats as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (dashboardService.getDailyConversations as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (dashboardService.getMonthlyConversations as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (dashboardService.getUpcomingReminders as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<Dashboard />);
    
    // Check for loading text in stats cards
    expect(screen.getAllByText('Carregando...').length).toBeGreaterThanOrEqual(3); // 3 stats cards
    // Check for loading text in charts section
    expect(screen.getByText('Carregando gráfico...')).toBeInTheDocument();
    // Check for loading text in reminders section
    expect(screen.getByText('Carregando lembretes...')).toBeInTheDocument();
  });

  it('fetches and displays dashboard stats correctly', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(dashboardService.getDashboardStats).toHaveBeenCalledTimes(1);
      // Stats card for Conversations
      expect(screen.getByText('Conversas')).toBeInTheDocument();
      expect(screen.getByText(mockStats.conversations.total.toString())).toBeInTheDocument();
      expect(screen.getByText(mockStats.conversations.change)).toBeInTheDocument();
      expect(screen.getByText(mockStats.conversations.period)).toBeInTheDocument();

      // Stats card for Active Clients
      expect(screen.getByText('Clientes Ativos')).toBeInTheDocument();
      expect(screen.getByText(mockStats.activeClients.total.toString())).toBeInTheDocument();
      expect(screen.getByText(mockStats.activeClients.change)).toBeInTheDocument();
      expect(screen.getByText(mockStats.activeClients.period)).toBeInTheDocument();

      // Stats card for Products Sold
      expect(screen.getByText('Produtos Vendidos')).toBeInTheDocument();
      expect(screen.getByText(mockStats.productsSold.total.toString())).toBeInTheDocument();
      expect(screen.getByText(mockStats.productsSold.change)).toBeInTheDocument();
      expect(screen.getByText(mockStats.productsSold.period)).toBeInTheDocument();
    });
  });

  it('fetches and displays chart data correctly (daily default)', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(dashboardService.getDailyConversations).toHaveBeenCalledTimes(1);
      expect(dashboardService.getMonthlyConversations).toHaveBeenCalledTimes(1);
      // Check if the BarChart component is rendered with correct data (mocked BarChart)
      const barChart = screen.getByTestId('bar-chart');
      expect(barChart).toBeInTheDocument();
      expect(JSON.parse(barChart.getAttribute('data-props') || '{}')).toEqual(mockDailyChart);
    });
  });
  
  // Add test for switching to monthly chart if needed

  it('fetches and displays upcoming reminders correctly', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(dashboardService.getUpcomingReminders).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Lembrete Teste 1')).toBeInTheDocument();
      expect(screen.getByText('5 cliente(s)')).toBeInTheDocument(); // For Lembrete Teste 1
      expect(screen.getByText('01/01/2023')).toBeInTheDocument(); // From mocked formatRelativeDate

      expect(screen.getByText('Aniversário Teste')).toBeInTheDocument();
      expect(screen.getByText('1 cliente(s)')).toBeInTheDocument(); // For Aniversário Teste
    });
  });

  it('displays error message if fetching data fails', async () => {
    const errorMessage = "Falha ao carregar dados do dashboard. Tente novamente mais tarde.";
    (dashboardService.getDashboardStats as jest.Mock).mockRejectedValue(new Error("API Error"));
    // Other service calls can also be mocked to reject if needed for a more comprehensive error test

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle')).toBeInTheDocument(); // Check for error icon
    });
  });
});
