import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CampaignsModule from './CampaignsModule'; // Adjust path
import { dashboardService, CampaignUIData } from '../../services/dashboardService'; // Import service and type
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

// Mock dashboardService
jest.mock('../../services/dashboardService', () => ({
  dashboardService: {
    getAllCampaignsDetails: jest.fn(),
  },
}));

// Mock hooks
jest.mock('@/hooks/use-is-mobile', () => ({ // Corrected path for useIsMobile
  useIsMobile: jest.fn(() => false), // Default to not mobile
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(), // Added error mock for completeness
  },
}));

// Mock child components
jest.mock('./modals/NewCampaignModal', () => (props: any) => props.open ? <div data-testid="new-campaign-modal">New Campaign Modal</div> : null);


const mockCampaignsData: CampaignUIData[] = [
  {
    id: 'camp1',
    name: 'Super Sale Anual',
    type: 'Manual',
    audience: 'Todos os Clientes',
    status: 'active',
    schedule: 'Imediato',
    lastRun: '01/07/2024 10:00',
  },
  {
    id: 'camp2',
    name: 'Lembrete Aniversário Julho',
    type: 'Aniversário',
    audience: 'Clientes VIP',
    status: 'scheduled',
    schedule: 'Agendado para 15/07/2024 09:00',
    lastRun: 'Nunca executado',
  },
  {
    id: 'camp3',
    name: 'Pós Compra Produto X',
    type: 'Pós-venda',
    audience: 'Compradores Produto X',
    status: 'paused',
    schedule: 'Diário, 14:00',
    lastRun: '30/06/2024 14:00',
  },
];

describe('CampaignsModule Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (dashboardService.getAllCampaignsDetails as jest.Mock).mockResolvedValue([...mockCampaignsData]); // Return a copy
    (useIsMobile as jest.Mock).mockReturnValue(false); // Default to desktop
  });

  it('displays loading state initially', () => {
    (dashboardService.getAllCampaignsDetails as jest.Mock).mockImplementation(() => new Promise(() => {})); // Keep promise pending
    render(<CampaignsModule />);
    expect(screen.getByText('Carregando campanhas...')).toBeInTheDocument();
  });

  it('fetches and displays campaigns correctly in desktop view', async () => {
    render(<CampaignsModule />);
    
    await waitFor(() => {
      expect(dashboardService.getAllCampaignsDetails).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Super Sale Anual')).toBeInTheDocument();
      expect(screen.getByText('Manual')).toBeInTheDocument(); // Type
      expect(screen.getByText('Todos os Clientes')).toBeInTheDocument(); // Audience
      expect(screen.getByText('Imediato')).toBeInTheDocument(); // Schedule
      expect(screen.getByText('01/07/2024 10:00')).toBeInTheDocument(); // Last Run
      expect(screen.getByText('Ativa')).toBeInTheDocument(); // Status Badge

      expect(screen.getByText('Lembrete Aniversário Julho')).toBeInTheDocument();
      expect(screen.getByText('Agendada')).toBeInTheDocument();
      
      expect(screen.getByText('Pós Compra Produto X')).toBeInTheDocument();
      expect(screen.getByText('Pausada')).toBeInTheDocument();
    });
    expect(screen.getByText(`Exibindo ${mockCampaignsData.length} campanha(s)`)).toBeInTheDocument();
  });
  
  it('fetches and displays campaigns correctly in mobile view', async () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);
    render(<CampaignsModule />);
    
    await waitFor(() => {
      expect(screen.getByText('Super Sale Anual')).toBeInTheDocument();
      // In mobile, details might be structured differently, but key data should be there.
      // Example check for one campaign
      expect(screen.getByText('Manual')).toBeInTheDocument();
      expect(screen.getByText('Todos os Clientes')).toBeInTheDocument();
      expect(screen.getByText('Imediato')).toBeInTheDocument();
      expect(screen.getByText('01/07/2024 10:00')).toBeInTheDocument();
      expect(screen.getByText('Ativa')).toBeInTheDocument();
    });
  });

  it('filters campaigns based on search term', async () => {
    render(<CampaignsModule />);
    await waitFor(() => expect(screen.getByText('Super Sale Anual')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('Buscar campanhas por nome, tipo ou status...');
    fireEvent.change(searchInput, { target: { value: 'Aniversário' } });

    await waitFor(() => {
      expect(screen.queryByText('Super Sale Anual')).not.toBeInTheDocument();
      expect(screen.getByText('Lembrete Aniversário Julho')).toBeInTheDocument();
      expect(screen.queryByText('Pós Compra Produto X')).not.toBeInTheDocument();
      expect(screen.getByText(`Exibindo 1 campanha(s)`)).toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: 'ativa' } }); // Search by status
     await waitFor(() => {
      expect(screen.getByText('Super Sale Anual')).toBeInTheDocument(); // Active
      expect(screen.queryByText('Lembrete Aniversário Julho')).not.toBeInTheDocument(); // Scheduled
      expect(screen.queryByText('Pós Compra Produto X')).not.toBeInTheDocument(); // Paused
      expect(screen.getByText(`Exibindo 1 campanha(s)`)).toBeInTheDocument();
    });
  });
  
  it('displays empty message when no campaigns match search', async () => {
    render(<CampaignsModule />);
    await waitFor(() => expect(screen.getByText('Super Sale Anual')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('Buscar campanhas por nome, tipo ou status...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentCampaignXYZ' } });

    await waitFor(() => {
      expect(screen.getByText('Nenhuma campanha encontrada.')).toBeInTheDocument();
      expect(screen.getByText(`Exibindo 0 campanha(s)`)).toBeInTheDocument();
    });
  });

  it('displays error message if fetching campaigns fails', async () => {
    const errorMessage = "Falha ao carregar campanhas. Tente novamente mais tarde.";
    (dashboardService.getAllCampaignsDetails as jest.Mock).mockRejectedValue(new Error("API Error"));
    render(<CampaignsModule />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Erro ao carregar campanhas.");
    });
  });
  
  it('opens NewCampaignModal when "Nova Campanha" button is clicked', async () => {
    render(<CampaignsModule />);
    await waitFor(() => expect(screen.getByText('Super Sale Anual')).toBeInTheDocument()); // Ensure page loaded

    const newCampaignButton = screen.getByText(/Nova Campanha|Nova/); // Handles mobile/desktop text
    fireEvent.click(newCampaignButton);

    await waitFor(() => {
      expect(screen.getByTestId('new-campaign-modal')).toBeInTheDocument();
    });
  });
  
  // Test for handleToggleCampaignStatus (local state update)
  it('toggles campaign status locally', async () => {
    render(<CampaignsModule />);
    await waitFor(() => expect(screen.getByText('Super Sale Anual')).toBeInTheDocument());

    // Find the toggle button for the first campaign ('Super Sale Anual', which is 'active')
    // Assuming the pause icon is rendered for active campaigns
    const pauseButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg > path[d*="M6 19h4V5H6v14zm8-14v14h4V5h-4z"]')); // SVG path for Pause icon
    expect(pauseButtons.length).toBeGreaterThan(0);
    fireEvent.click(pauseButtons[0]); // Click the first pause button

    await waitFor(() => {
      // Check if the status badge changed to 'Pausada' and toast was called
      expect(screen.getAllByText('Pausada').length).toBeGreaterThan(0);
      expect(toast.success).toHaveBeenCalledWith('Campanha pausada localmente!');
    });

    // Find the play button for the now paused campaign
    const playButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg > path[d*="M8 5v14l11-7z"]')); // SVG path for Play icon
    expect(playButtons.length).toBeGreaterThan(0);
    fireEvent.click(playButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByText('Ativa').length).toBeGreaterThan(0);
      expect(toast.success).toHaveBeenCalledWith('Campanha ativada localmente!');
    });
  });
});
