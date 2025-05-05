
import React from 'react';
import { Clock, Tag, Package, Bell, Phone, Mail, Home, Calendar, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type CustomerDetails = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  birthdate: string;
  tags: string[];
  products: Array<{
    id: string;
    name: string;
    category: string;
    lastPurchase: string;
    continuous: boolean;
  }>;
  notes: string;
};

const mockCustomerDetails: Record<string, CustomerDetails> = {
  '1': {
    id: '1',
    name: 'João Silva',
    phone: '+55 11 98765-4321',
    email: 'joao.silva@email.com',
    address: 'Rua das Flores, 123 - São Paulo',
    birthdate: '15/05/1975',
    tags: ['hipertenso', 'uso contínuo', 'cliente fiel'],
    products: [
      {
        id: 'p1',
        name: 'Losartana 50mg',
        category: 'Anti-hipertensivo',
        lastPurchase: '30/04/2023',
        continuous: true,
      },
      {
        id: 'p2',
        name: 'Aspirina 100mg',
        category: 'Analgésico',
        lastPurchase: '15/04/2023',
        continuous: true,
      }
    ],
    notes: 'Cliente prefere ser atendido no período da manhã. Geralmente retira medicamentos entre os dias 1 e 5 de cada mês.',
  },
  '2': {
    id: '2',
    name: 'Maria Oliveira',
    phone: '+55 11 91234-5678',
    email: 'maria.oliveira@email.com',
    address: 'Av. Paulista, 1000 - São Paulo',
    birthdate: '22/09/1982',
    tags: ['diabético', 'uso contínuo'],
    products: [
      {
        id: 'p3',
        name: 'Insulina Lantus',
        category: 'Antidiabético',
        lastPurchase: '02/05/2023',
        continuous: true,
      }
    ],
    notes: 'Cliente sensível a preços, sempre pergunta por genéricos ou opções mais econômicas.',
  },
};

interface CustomerDetailsProps {
  activeConversation: string | null;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ activeConversation }) => {
  if (!activeConversation || !mockCustomerDetails[activeConversation]) {
    return (
      <div className="h-full flex items-center justify-center bg-pharmacy-dark1">
        <div className="text-center text-muted-foreground">
          <p>Selecione uma conversa para</p>
          <p>ver detalhes do cliente</p>
        </div>
      </div>
    );
  }
  
  const customer = mockCustomerDetails[activeConversation];
  
  return (
    <div className="h-full bg-pharmacy-dark1 border-l border-pharmacy-dark2 overflow-y-auto">
      <div className="p-4 border-b border-pharmacy-dark2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-white">Detalhes do Cliente</h3>
          <Button variant="outline" size="sm" className="text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white">
            Editar
          </Button>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="h-4 w-4 text-pharmacy-green2" />
            <span className="text-sm text-muted-foreground">{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-4 w-4 text-pharmacy-green2" />
            <span className="text-sm text-muted-foreground">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Home className="h-4 w-4 text-pharmacy-green2" />
            <span className="text-sm text-muted-foreground">{customer.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-pharmacy-green2" />
            <span className="text-sm text-muted-foreground">Nascimento: {customer.birthdate}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-pharmacy-green2" />
            <span className="text-sm text-white">Tags</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {customer.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="bg-pharmacy-dark2 border-pharmacy-green1 text-xs text-pharmacy-green2"
              >
                {tag}
              </Badge>
            ))}
            <Badge 
              variant="outline" 
              className="bg-pharmacy-dark2 border-pharmacy-green1 text-xs text-pharmacy-green2 cursor-pointer"
            >
              <Plus className="h-3 w-3 mr-1" />
              Nova tag
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-b border-pharmacy-dark2">
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-pharmacy-green2" />
          <h3 className="font-medium text-white">Produtos Adquiridos</h3>
        </div>
        
        {customer.products.map((product) => (
          <div key={product.id} className="mb-3 p-2 bg-pharmacy-dark2 rounded-xl">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-white">{product.name}</span>
              {product.continuous && (
                <Badge className="bg-pharmacy-accent text-white text-xs">Uso Contínuo</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-pharmacy-green2">{product.category}</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Compra: {product.lastPurchase}</span>
              </div>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>
      
      <div className="p-4 border-b border-pharmacy-dark2">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-pharmacy-green2" />
          <h3 className="font-medium text-white">Automações Ativas</h3>
        </div>
        
        <div className="mb-2 p-2 bg-pharmacy-dark2 rounded-xl">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-white">Lembrete de Recompra</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Losartana 50mg - Próximo lembrete: 25/05/2023
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Automação
        </Button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-pharmacy-green2" />
          <h3 className="font-medium text-white">Observações</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">{customer.notes}</p>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white mt-3"
        >
          Editar Observações
        </Button>
      </div>
    </div>
  );
};

export default CustomerDetails;
