import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportsModule from './ReportsModule'; // Adjust path as necessary
import { dashboardService, ReportStats, ChartData, CampaignReportRow } from '../../services/dashboardService';

// Mock the dashboardService for reports
jest.mock('../../services/dashboardService', () => ({
  dashboardService: {
    getReportStats: jest.fn(),
    getMessagesByType: jest.fn(),
    getClientsServedLastWeek: jest.fn(),
    getProductCategoryDistribution: jest.fn(),
    getCampaignReportData: jest.fn(),
  },
}));

// Mock recharts (similar to Dashboard.test.tsx)
jest.mock('recharts', () => {
  const OriginalRecharts = jest.requireActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    Bar: () => <div data-testid="bar-element" />,
    Line: () => <div data-testid="line-element" />,
    Pie: () => <div data-testid="pie-element" />,
    Cell: () => <div data-testid="cell-element" />,
    XAxis: () => <div data-testid="xaxis-element" />,
    YAxis: () => <div data-testid="yaxis-element" />,
    CartesianGrid: () => <div data-testid="grid-element" />,
    Tooltip: () => <div data-testid="tooltip-element" />,
    Legend: () => <div data-testid="legend-element" />,
  };
});

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));


const mockReportStatsData: ReportStats = {
  responseRate: "80% (placeholder)",
  avgResponseTime: "10min (placeholder)",
  conversionRate: "25% (placeholder)",
};
const mockMessagesData: ChartData[] = [{ name: 'text', value: 100 }, { name: 'image', value: 20 }];
const mockClientsData: ChartData[] = [{ name: 'Seg', value: 10 }, { name: 'Ter', value: 15 }];
const mockCategoryData: ChartData[] = [{ name: 'Analgésico', value: 50 }, { name: 'Antibiótico', value: 30 }];
const mockCampaignReport: CampaignReportRow[] = [
  { name: 'Campanha Top', sent: 200, responses: 'N/A', rate: 'N/A' },
];

describe('ReportsModule Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (dashboardService.getReportStats as jest.Mock).mockResolvedValue(mockReportStatsData);
    (dashboardService.getMessagesByType as jest.Mock).mockResolvedValue(mockMessagesData);
    (dashboardService.getClientsServedLastWeek as jest.Mock).mockResolvedValue(mockClientsData);
    (dashboardService.getProductCategoryDistribution as jest.Mock).mockResolvedValue(mockCategoryData);
    (dashboardService.getCampaignReportData as jest.Mock).mockResolvedValue(mockCampaignReport);
  });

  it('displays loading state initially for all sections', () => {
    (dashboardService.getReportStats as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (dashboardService.getMessagesByType as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (dashboardService.getClientsServedLastWeek as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (dashboardService.getProductCategoryDistribution as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (dashboardService.getCampaignReportData as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<ReportsModule />);
    // Multiple "Carregando dados..." might appear
    expect(screen.getAllByText('Carregando dados...').length).toBeGreaterThanOrEqual(1); 
  });

  it('fetches and displays report stats correctly', async () => {
    render(<ReportsModule />);
    await waitFor(() => {
      expect(dashboardService.getReportStats).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Taxa de Resposta')).toBeInTheDocument();
      expect(screen.getByText(mockReportStatsData.responseRate)).toBeInTheDocument();
      expect(screen.getByText('Tempo Médio de Resposta')).toBeInTheDocument();
      expect(screen.getByText(mockReportStatsData.avgResponseTime)).toBeInTheDocument();
      expect(screen.getByText('Taxa de Conversão')).toBeInTheDocument();
      expect(screen.getByText(mockReportStatsData.conversionRate)).toBeInTheDocument();
      // Check for placeholder text
      expect(screen.getAllByText('(Placeholder)').length).toBe(3);
    });
  });

  it('fetches and displays messages by type chart data', async () => {
    render(<ReportsModule />);
    await waitFor(() => {
      expect(dashboardService.getMessagesByType).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Mensagens por Tipo')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument(); // Mocked chart
    });
  });

  it('fetches and displays clients served chart data', async () => {
    render(<ReportsModule />);
    await waitFor(() => {
      expect(dashboardService.getClientsServedLastWeek).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Clientes Atendidos (Semana)')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument(); // Mocked chart
    });
  });

  it('fetches and displays product category distribution chart data', async () => {
    render(<ReportsModule />);
    await waitFor(() => {
      expect(dashboardService.getProductCategoryDistribution).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Distribuição de Produtos por Categoria')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument(); // Mocked chart
    });
  });

  it('fetches and displays campaign report data', async () => {
    render(<ReportsModule />);
    await waitFor(() => {
      expect(dashboardService.getCampaignReportData).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Relatório de Campanhas')).toBeInTheDocument();
      expect(screen.getByText(mockCampaignReport[0].name)).toBeInTheDocument();
      expect(screen.getByText(`${mockCampaignReport[0].sent} enviadas, ${mockCampaignReport[0].responses} respostas`)).toBeInTheDocument();
      expect(screen.getByText(mockCampaignReport[0].rate)).toBeInTheDocument();
    });
  });
  
  it('displays error message if fetching data fails', async () => {
    const errorMessage = "Falha ao carregar dados dos relatórios. Verifique o console para mais detalhes.";
    (dashboardService.getReportStats as jest.Mock).mockRejectedValue(new Error("API Error"));
    // Other service calls can also be mocked to reject for a more complete test

    render(<ReportsModule />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();
    });
  });
  
  it('handles CSV export for campaign data', async () => {
    render(<ReportsModule />);
    await waitFor(() => expect(dashboardService.getCampaignReportData).toHaveBeenCalled());

    // Mock window.URL.createObjectURL and link.click for jsdom
    global.URL.createObjectURL = jest.fn(() => 'mock_url');
    const linkMock = { click: jest.fn(), setAttribute: jest.fn(), style: { visibility: '' } };
    jest.spyOn(document, 'createElement').mockReturnValue(linkMock as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    fireEvent.click(screen.getByText('Exportar')); // Open dropdown
    fireEvent.click(screen.getByText('Top Campanhas')); // Click specific export

    await waitFor(() => {
      expect(linkMock.setAttribute).toHaveBeenCalledWith('download', 'top_campanhas.csv');
      expect(linkMock.click).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Relatório top_campanhas.csv exportado com sucesso!');
    });
  });
});
