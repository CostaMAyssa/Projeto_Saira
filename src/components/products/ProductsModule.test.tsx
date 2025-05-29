import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductsModule from './ProductsModule'; // Adjust path
import { supabase } from '@/lib/supabaseClient'; // Will be mocked
import { Product } from './types'; // Adjust path
import { useToast } from '@/hooks/use-toast'; // Mock this hook

import ProductsModule from './ProductsModule'; // Adjust path
import { supabase } from '@/lib/supabase'; // For direct fetch used in module
import { dashboardService, ProductData } from '../../services/dashboardService'; // For CRUD
import { Product } from './types'; // Adjust path
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';


// Mock Supabase client (for direct list fetching in ProductsModule)
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  },
}));

// Mock dashboardService for CRUD operations
jest.mock('../../services/dashboardService', () => ({
  dashboardService: {
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    // deleteProduct: jest.fn(), // Not implementing delete tests for products
  },
}));


// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}));

// Mock child components
jest.mock('./ProductsHeader', () => (props: { onAddProduct: () => void }) => (
  <div>
    <button data-testid="add-product-btn" onClick={props.onAddProduct}>Add Product</button>
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

// Updated ProductCard mock to include onEdit call simulation
jest.mock('./ProductCard', () => (props: { product: Product; onEdit: (id: string) => void; }) => (
  <div data-testid={`product-card-${props.product.id}`}>
    <h3>{props.product.name}</h3>
    <p>Category: {props.product.category}</p>
    <p>Stock: {props.product.stock}</p>
    {props.product.needsPrescription && <span>Needs Prescription</span>}
    <button data-testid={`edit-btn-${props.product.id}`} onClick={() => props.onEdit(props.product.id)}>Edit</button>
  </div>
));

// Mock Modals - make them call their onSave prop when a simulated action occurs
const mockProductCreateForm = jest.fn();
jest.mock('./ProductCreateForm', () => (props: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; }) => {
  mockProductCreateForm.mockImplementation((internalProps) => { // Store the onSave prop
    if (!internalProps.isOpen) return null;
    return (
      <div data-testid="product-create-modal">
        Create Form
        <button data-testid="create-form-save-btn" onClick={() => internalProps.onSave({ name: 'New Mock Product', category: 'Mock Cat', stock: 10, needsPrescription: false })}>
          Save New Product
        </button>
      </div>
    );
  });
  return mockProductCreateForm;
});


const mockProductEditForm = jest.fn();
jest.mock('./ProductEditForm', () => (props: { isOpen: boolean; onClose: () => void; product: Product | null; onSave: (data: any) => void; }) => {
  mockProductEditForm.mockImplementation((internalProps) => {
    if (!internalProps.isOpen) return null;
    return (
      <div data-testid="product-edit-modal">
        Edit Form for {internalProps.product?.name}
        <button data-testid="edit-form-save-btn" onClick={() => internalProps.onSave({ ...internalProps.product, name: `${internalProps.product?.name} Updated` })}>
          Save Changes
        </button>
      </div>
    );
  });
  return mockProductEditForm;
});

jest.mock('./ProductDetails', () => (props: any) => props.isOpen ? <div data-testid="product-details-modal">Details for {props.product?.name}</div> : null);


const mockDbProducts: any[] = [ // Use any for mock flexibility
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

    // Initial fetch for products list
    (supabase.from('products').select as jest.Mock).mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: mockDbProducts, error: null })
    });
  });

  it('fetches products and displays them', async () => {
    render(<ProductsModule />);
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument();
      expect(screen.getByText('Amoxicilina 250mg')).toBeInTheDocument();
    });
  });

  it('handleCreateProduct calls createProduct service and refreshes list', async () => {
    const newProductData = { name: 'New Mock Product', category: 'Mock Cat', stock: 10, needsPrescription: false };
    (dashboardService.createProduct as jest.Mock).mockResolvedValue({ ...newProductData, id: 'prod-new' });
    
    // Mock for fetchProductsData refresh
    const refreshedProducts = [...mockDbProducts, { ...newProductData, id: 'prod-new', created_at: new Date().toISOString() }];
    (supabase.from('products').select().order as jest.Mock)
      .mockResolvedValueOnce({data: mockDbProducts, error: null}) // Initial
      .mockResolvedValueOnce({data: refreshedProducts, error: null}); // After refresh

    render(<ProductsModule />);
    await waitFor(() => expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('add-product-btn')); // Opens create modal
    await waitFor(() => expect(screen.getByTestId('product-create-modal')).toBeInTheDocument());
    
    fireEvent.click(screen.getByTestId('create-form-save-btn')); // Simulate save from modal

    await waitFor(() => {
      expect(dashboardService.createProduct).toHaveBeenCalledWith(expect.objectContaining(newProductData));
      expect(mockToast).toHaveBeenCalledWith({ title: "Sucesso", description: `Produto ${newProductData.name} criado com sucesso.` });
      expect(supabase.from).toHaveBeenCalledTimes(2); // Initial + refresh
    });
    expect(screen.getByText('New Mock Product')).toBeInTheDocument();
  });

  it('handleSaveProductEdit calls updateProduct service and refreshes list', async () => {
    const productToEdit = mockDbProducts[0]; // Paracetamol 500mg
    const updatedName = `${productToEdit.name} Updated`;
    (dashboardService.updateProduct as jest.Mock).mockResolvedValue({ ...productToEdit, name: updatedName });

    const refreshedProductsAfterEdit = mockDbProducts.map(p => p.id === productToEdit.id ? { ...p, name: updatedName } : p);
    (supabase.from('products').select().order as jest.Mock)
      .mockResolvedValueOnce({data: mockDbProducts, error: null}) // Initial
      .mockResolvedValueOnce({data: refreshedProductsAfterEdit, error: null}); // After refresh

    render(<ProductsModule />);
    await waitFor(() => expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId(`edit-btn-${productToEdit.id}`)); // Opens edit modal
    await waitFor(() => expect(screen.getByTestId('product-edit-modal')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('edit-form-save-btn')); // Simulate save from modal

    await waitFor(() => {
      expect(dashboardService.updateProduct).toHaveBeenCalledWith(productToEdit.id, expect.objectContaining({ name: updatedName }));
      expect(mockToast).toHaveBeenCalledWith({ title: "Sucesso", description: `Produto ${updatedName} atualizado com sucesso.` });
      expect(supabase.from).toHaveBeenCalledTimes(2); // Initial + refresh
    });
    expect(screen.getByText(updatedName)).toBeInTheDocument();
  });
  
  // Test for error during create
  it('shows error toast if createProduct service fails', async () => {
    (dashboardService.createProduct as jest.Mock).mockRejectedValue(new Error("Create failed"));
    render(<ProductsModule />);
    await waitFor(() => expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('add-product-btn'));
    await waitFor(() => expect(screen.getByTestId('product-create-modal')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('create-form-save-btn'));

    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({ title: "Erro", description: "Falha ao criar produto.", variant: "destructive" });
    });
  });

  // Test for error during update
  it('shows error toast if updateProduct service fails', async () => {
    const productToEdit = mockDbProducts[0];
    (dashboardService.updateProduct as jest.Mock).mockRejectedValue(new Error("Update failed"));
    render(<ProductsModule />);
    await waitFor(() => expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId(`edit-btn-${productToEdit.id}`));
    await waitFor(() => expect(screen.getByTestId('product-edit-modal')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('edit-form-save-btn'));

    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({ title: "Erro", description: "Falha ao atualizar produto.", variant: "destructive" });
    });
  });
});
