import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormsModule from './FormsModule'; // Adjust path
import { getForms } from '../../services/dashboardService'; // Import the specific function
import { FormData as DbFormData } from '../../services/dashboardService'; // Assuming Form type from service might be different from local
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

// Mock dashboardService.getForms
jest.mock('../../services/dashboardService', () => ({
  getForms: jest.fn(),
}));

// Mock hooks
jest.mock('@/hooks/use-is-mobile', () => ({
  useIsMobile: jest.fn(() => false), // Default to not mobile
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock child components
jest.mock('./modals/NewFormModal', () => (props: any) => props.open ? <div data-testid="new-form-modal">New Form Modal</div> : null);

// Sample data that getForms would return from the database
const mockDbFormsData: Partial<DbFormData>[] = [ // Using Partial as form_responses structure is specific
  {
    id: 'form1',
    title: 'Pesquisa de Satisfação Global',
    question_count: 10,
    status: 'ativo',
    created_at: new Date(2024, 0, 15, 10, 0, 0).toISOString(), // Jan 15, 2024
    form_responses: [{ count: 120 }], // Example structure from Supabase join
  },
  {
    id: 'form2',
    title: 'Feedback Produto Novo',
    question_count: 5,
    status: 'inativo',
    created_at: new Date(2024, 1, 20, 14, 30, 0).toISOString(), // Feb 20, 2024
    form_responses: [{ count: 30 }],
  },
];

describe('FormsModule Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getForms as jest.Mock).mockResolvedValue([...mockDbFormsData]);
    (useIsMobile as jest.Mock).mockReturnValue(false); // Default to desktop
  });

  it('displays loading state initially', () => {
    (getForms as jest.Mock).mockImplementation(() => new Promise(() => {})); // Keep promise pending
    render(<FormsModule />);
    expect(screen.getByText('Carregando formulários...')).toBeInTheDocument();
  });

  it('fetches and displays forms correctly in desktop view', async () => {
    render(<FormsModule />);
    
    await waitFor(() => {
      expect(getForms).toHaveBeenCalledTimes(1);
      // Check for first form
      expect(screen.getByText('Pesquisa de Satisfação Global')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Questions
      expect(screen.getByText('120 respostas')).toBeInTheDocument(); // Responses
      expect(screen.getByText('Ativo')).toBeInTheDocument(); // Status
      expect(screen.getByText('Criado em: 15/01/2024')).toBeInTheDocument(); // CreatedAt
      expect(screen.getAllByText('Última resposta: N/A')[0]).toBeInTheDocument(); // LastResponse placeholder

      // Check for second form
      expect(screen.getByText('Feedback Produto Novo')).toBeInTheDocument();
      expect(screen.getByText('Inativo')).toBeInTheDocument();
    });
    expect(screen.getByText(`Exibindo ${mockDbFormsData.length} formulário(s)`)).toBeInTheDocument();
  });
  
  it('fetches and displays forms correctly in mobile view', async () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);
    render(<FormsModule />);
    
    await waitFor(() => {
      expect(screen.getByText('Pesquisa de Satisfação Global')).toBeInTheDocument();
      // Example checks for mobile (structure might differ slightly but data should be present)
      expect(screen.getByText('10 perguntas')).toBeInTheDocument();
      expect(screen.getByText('120 respostas')).toBeInTheDocument();
      expect(screen.getByText('Ativo')).toBeInTheDocument();
      expect(screen.getByText('Criado em: 15/01/2024')).toBeInTheDocument();
    });
  });

  it('filters forms based on search term (name)', async () => {
    render(<FormsModule />);
    await waitFor(() => expect(screen.getByText('Pesquisa de Satisfação Global')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('Buscar formulários por nome ou status (ativo/inativo)...');
    fireEvent.change(searchInput, { target: { value: 'Feedback' } });

    await waitFor(() => {
      expect(screen.queryByText('Pesquisa de Satisfação Global')).not.toBeInTheDocument();
      expect(screen.getByText('Feedback Produto Novo')).toBeInTheDocument();
      expect(screen.getByText(`Exibindo 1 formulário(s)`)).toBeInTheDocument();
    });
  });
  
  it('filters forms based on search term (status "ativo")', async () => {
    render(<FormsModule />);
    await waitFor(() => expect(screen.getByText('Pesquisa de Satisfação Global')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('Buscar formulários por nome ou status (ativo/inativo)...');
    fireEvent.change(searchInput, { target: { value: 'ativo' } });

    await waitFor(() => {
      expect(screen.getByText('Pesquisa de Satisfação Global')).toBeInTheDocument(); // active
      expect(screen.queryByText('Feedback Produto Novo')).not.toBeInTheDocument(); // inactive
      expect(screen.getByText(`Exibindo 1 formulário(s)`)).toBeInTheDocument();
    });
  });

  it('displays empty message when no forms match search', async () => {
    render(<FormsModule />);
    await waitFor(() => expect(screen.getByText('Pesquisa de Satisfação Global')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('Buscar formulários por nome ou status (ativo/inativo)...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentFormXYZ' } });

    await waitFor(() => {
      expect(screen.getByText('Nenhum formulário encontrado.')).toBeInTheDocument();
      expect(screen.getByText(`Exibindo 0 formulário(s)`)).toBeInTheDocument();
    });
  });

  it('displays error message if fetching forms fails', async () => {
    const errorMessage = "Falha ao carregar formulários. Tente novamente mais tarde.";
    (getForms as jest.Mock).mockRejectedValue(new Error("API Error"));
    render(<FormsModule />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Erro ao carregar formulários.");
    });
  });
  
  it('opens NewFormModal when "Novo Formulário" button is clicked', async () => {
    render(<FormsModule />);
    await waitFor(() => expect(screen.getByText('Pesquisa de Satisfação Global')).toBeInTheDocument());

    const newFormButton = screen.getByText('Novo Formulário');
    fireEvent.click(newFormButton);

    await waitFor(() => {
      expect(screen.getByTestId('new-form-modal')).toBeInTheDocument();
    });
  });
});
