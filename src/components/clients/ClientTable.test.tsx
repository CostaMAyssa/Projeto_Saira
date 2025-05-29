import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientTable from './ClientTable';
import { Client } from './types';

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Alice Wonderland',
    phone: '123-456-7890',
    email: 'alice@example.com',
    status: 'active',
    tags: ['VIP'],
    lastPurchase: '01/01/2023',
    isVip: true,
    isRegular: false,
    isOccasional: false,
  },
  {
    id: '2',
    name: 'Bob The Builder',
    phone: '987-654-3210',
    email: 'bob@example.com',
    status: 'inactive',
    tags: ['Regular'],
    lastPurchase: '02/01/2023',
    isVip: false,
    isRegular: true,
    isOccasional: false,
  },
];

const mockGetStatusBadge = (status: 'active' | 'inactive') => <span data-testid={`status-${status}`}>{status}</span>;
const mockGetTagBadge = (tag: string) => <span data-testid={`tag-${tag}`}>{tag}</span>;

describe('ClientTable Component', () => {
  let onOpenEditModalMock: jest.Mock;
  let onDeleteClientMock: jest.Mock;
  let onToggleStatusMock: jest.Mock;

  beforeEach(() => {
    onOpenEditModalMock = jest.fn();
    onDeleteClientMock = jest.fn();
    onToggleStatusMock = jest.fn();
  });

  const renderComponent = (clients: Client[] = mockClients) => {
    return render(
      <ClientTable
        clients={clients}
        getStatusBadge={mockGetStatusBadge}
        getTagBadge={mockGetTagBadge}
        onOpenEditModal={onOpenEditModalMock}
        onDeleteClient={onDeleteClientMock}
        onToggleStatus={onToggleStatusMock}
      />
    );
  };

  it('renders client data correctly', () => {
    renderComponent();
    expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('status-active')).toHaveTextContent('active');

    expect(screen.getByText('Bob The Builder')).toBeInTheDocument();
    expect(screen.getByTestId('status-inactive')).toHaveTextContent('inactive');
  });

  it('calls onOpenEditModal with correct client data when Edit button is clicked', () => {
    renderComponent();
    const editButtons = screen.getAllByRole('button', { name: /edit/i }); // Assuming Lucide Edit icon has 'edit' in accessible name
    fireEvent.click(editButtons[0]); // Click edit for Alice
    expect(onOpenEditModalMock).toHaveBeenCalledTimes(1);
    expect(onOpenEditModalMock).toHaveBeenCalledWith(mockClients[0]);
  });

  it('calls onDeleteClient with correct client ID when Delete action is clicked', () => {
    renderComponent();
    // Find the dropdown trigger for the first client
    const moreButtons = screen.getAllByRole('button', { name: /morehorizontal/i }); // Assuming Lucide MoreHorizontal icon
    fireEvent.click(moreButtons[0]); // Open dropdown for Alice

    // Find and click the "Excluir" item. Text might be wrapped in spans.
    const deleteMenuItem = screen.getByText((content, element) => {
        // Check if the element or its parent has the text "Excluir"
        const hasText = (node: Element | null): boolean => {
            if (!node) return false;
            return (node.textContent === "Excluir") || hasText(node.parentElement);
        }
        return hasText(element) && element?.tagName.toLowerCase() === 'span';
    });
    fireEvent.click(deleteMenuItem);

    expect(onDeleteClientMock).toHaveBeenCalledTimes(1);
    expect(onDeleteClientMock).toHaveBeenCalledWith(mockClients[0].id);
  });

  it('calls onToggleStatus with correct client data when Toggle Status action is clicked', () => {
    renderComponent();
    const moreButtons = screen.getAllByRole('button', { name: /morehorizontal/i });
    fireEvent.click(moreButtons[0]); // Open dropdown for Alice (status: active)
    
    // "Desativar" for active client
    const toggleStatusMenuItem = screen.getByText((content, element) => {
         const hasText = (node: Element | null): boolean => {
            if (!node) return false;
            return (node.textContent === "Desativar") || hasText(node.parentElement);
        }
        return hasText(element) && element?.tagName.toLowerCase() === 'span';
    });
    fireEvent.click(toggleStatusMenuItem);

    expect(onToggleStatusMock).toHaveBeenCalledTimes(1);
    expect(onToggleStatusMock).toHaveBeenCalledWith(mockClients[0]);
  });
});
