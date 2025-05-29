import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductsModule from './ProductsModule'; // Adjust path
import { supabase } from '@/lib/supabaseClient'; // Will be mocked
import { Product } from './types'; // Adjust path
import { useToast } from '@/hooks/use-toast'; // Mock this hook

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
  },
}));

// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false), // Default to not mobile
}));

// Mock child components
jest.mock('./ProductsHeader', () => (props: any) => (
  <div>
    <button onClick={props.onAddProduct}>Add Product</button>
  </div>
));
jest.mock('./ProductFilters', () => (props: any) => (
  <div>
    <input 
      data-testid="product-search-input" 
      placeholder="Search products"
      onChange={(e) => props.onSearch(e.target.value)}
    />
    <button onClick={() => props.setActiveFilter('TestCategory')}>Filter by TestCategory</button>
    <button onClick={() => props.setActiveFilter(null)}>Clear Filters</button>
  </div>
));
jest.mock('./ProductCard', () => (props: { product: Product }) => (
  <div data-testid={`product-card-${props.product.id}`}>
    <h3>{props.product.name}</h3>
    <p>Category: {props.product.category}</p>
    <p>Stock: {props.product.stock}</p>
    {props.product.needsPrescription && <span>Needs Prescription</span>}
  </div>
));
// Modals are not directly tested for opening/closing here, focus on data display
jest.mock('./ProductDetails', () => (props: any) => props.isOpen ? <div data-testid="product-details-modal">Details</div> : null);
jest.mock('./ProductEditForm', () => (props: any) => props.isOpen ? <div data-testid="product-edit-modal">Edit Form</div> : null);
jest.mock('./ProductCreateForm', () => (props: any) => props.isOpen ? <div data-testid="product-create-modal">Create Form</div> : null);


const mockDbProducts = [
  {
    id: 'prod1',
    name: 'Paracetamol 500mg',
    category: 'Analgésico',
    stock: 150,
    interval: null,
    tags: ['Febre', 'Dor'],
    needs_prescription: false, // DB schema: snake_case
    controlled: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod2',
    name: 'Amoxicilina 250mg',
    category: 'Antibiótico',
    stock: 75,
    interval: 7,
    tags: ['Infecção', 'Prescrito'],
    needs_prescription: true, // DB schema: snake_case
    controlled: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod3',
    name: 'Vitamina C',
    category: 'TestCategory', // For filter testing
    stock: 200,
    interval: null,
    tags: ['Suplemento'],
    needs_prescription: false,
    controlled: false,
    created_at: new Date().toISOString(),
  }
];

// Expected transformed product data structure (matches Product type in types.ts)
// Note: needsPrescription is mapped from needs_prescription
const expectedTransformedProducts: Partial<Product>[] = [
  { id: 'prod1', name: 'Paracetamol 500mg', needsPrescription: false },
  { id: 'prod2', name: 'Amoxicilina 250mg', needsPrescription: true },
  { id: 'prod3', name: 'Vitamina C', category: 'TestCategory', needsPrescription: false },
];

describe('ProductsModule', () => {
  let mockToast: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    
    (supabase.from('products').select as jest.Mock).mockResolvedValue({
      data: mockDbProducts,
      error: null,
    });
  });

  it('fetches products, transforms data, and displays them', async () => {
    render(<ProductsModule />);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(supabase.from('products').select).toHaveBeenCalledWith('*');
    });

    await waitFor(() => {
      expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument();
      expect(screen.getByText('Amoxicilina 250mg')).toBeInTheDocument();
      // Check transformation for needsPrescription
      const amoxicilinaCard = screen.getByTestId('product-card-prod2');
      expect(amoxicilinaCard).toHaveTextContent('Needs Prescription');
      
      const paracetamolCard = screen.getByTestId('product-card-prod1');
      expect(paracetamolCard).not.toHaveTextContent('Needs Prescription');
    });
  });

  it('filters products by search query (name)', async () => {
    render(<ProductsModule />);
    await waitFor(() => expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument());

    const searchInput = screen.getByTestId('product-search-input');
    fireEvent.change(searchInput, { target: { value: 'Amox' } });

    await waitFor(() => {
      expect(screen.queryByText('Paracetamol 500mg')).not.toBeInTheDocument();
      expect(screen.getByText('Amoxicilina 250mg')).toBeInTheDocument();
    });
  });
  
  it('filters products by category using ProductFilters', async () => {
    render(<ProductsModule />);
    await waitFor(() => expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument());

    // Simulate clicking a category filter button in the mocked ProductFilters
    fireEvent.click(screen.getByText('Filter by TestCategory'));

    await waitFor(() => {
      expect(screen.queryByText('Paracetamol 500mg')).not.toBeInTheDocument();
      expect(screen.queryByText('Amoxicilina 250mg')).not.toBeInTheDocument();
      expect(screen.getByText('Vitamina C')).toBeInTheDocument(); // Belongs to TestCategory
    });

    // Clear filter
    fireEvent.click(screen.getByText('Clear Filters'));
    await waitFor(() => {
       expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument();
       expect(screen.getByText('Amoxicilina 250mg')).toBeInTheDocument();
       expect(screen.getByText('Vitamina C')).toBeInTheDocument();
    });
  });

  it('handles error when fetching products and shows toast', async () => {
    (supabase.from('products').select as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to fetch products' },
    });

    render(<ProductsModule />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Erro ao buscar produtos",
        description: "Não foi possível carregar os produtos do banco de dados.",
        variant: "destructive",
      });
      // Check for empty state message
      expect(screen.getByText('Nenhum produto encontrado')).toBeInTheDocument();
    });
  });
  
  it('displays empty state when no products match filters', async () => {
    render(<ProductsModule />);
    await waitFor(() => expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument());

    const searchInput = screen.getByTestId('product-search-input');
    fireEvent.change(searchInput, { target: { value: 'NonExistentProduct123' } });

    await waitFor(() => {
      expect(screen.queryByText('Paracetamol 500mg')).not.toBeInTheDocument();
      expect(screen.getByText('Nenhum produto encontrado')).toBeInTheDocument();
    });
  });
});
