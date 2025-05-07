
import React, { useState, useEffect } from 'react';
import CustomerHeader from './customer-details/CustomerHeader';
import CustomerContactInfo from './customer-details/CustomerContactInfo';
import CustomerTags from './customer-details/CustomerTags';
import CustomerProducts from './customer-details/CustomerProducts';
import CustomerAutomations from './customer-details/CustomerAutomations';
import CustomerNotes from './customer-details/CustomerNotes';
import { mockCustomerDetails } from './customer-details/mockData';
import { CustomerDetails as CustomerDetailsType, Product } from './customer-details/types';
import { toast } from 'sonner';

interface CustomerDetailsProps {
  activeConversation: string | null;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ activeConversation }) => {
  const [customerData, setCustomerData] = useState<CustomerDetailsType | null>(null);
  
  // Initialize customer data when active conversation changes
  useEffect(() => {
    if (activeConversation && mockCustomerDetails[activeConversation]) {
      setCustomerData(mockCustomerDetails[activeConversation]);
    } else {
      setCustomerData(null);
    }
  }, [activeConversation]);
  
  if (!activeConversation || !customerData) {
    return (
      <div className="h-full flex items-center justify-center bg-pharmacy-dark1">
        <div className="text-center text-muted-foreground">
          <p>Selecione uma conversa para</p>
          <p>ver detalhes do cliente</p>
        </div>
      </div>
    );
  }
  
  const handleUpdateCustomer = (updatedCustomer: CustomerDetailsType) => {
    setCustomerData(updatedCustomer);
    toast.success('Dados do cliente atualizados com sucesso!');
  };
  
  const handleAddTag = (tag: string) => {
    if (customerData.tags.includes(tag)) {
      toast.error('Esta tag já existe para este cliente.');
      return;
    }
    
    setCustomerData({
      ...customerData,
      tags: [...customerData.tags, tag]
    });
    
    toast.success('Tag adicionada com sucesso!');
  };
  
  const handleAddProduct = (product: Product) => {
    setCustomerData({
      ...customerData,
      products: [...customerData.products, product]
    });
    
    toast.success('Produto adicionado com sucesso!');
  };
  
  const handleSaveNotes = (notes: string) => {
    setCustomerData({
      ...customerData,
      notes
    });
    
    toast.success('Observações atualizadas com sucesso!');
  };
  
  return (
    <div className="h-full bg-pharmacy-dark1 border-l border-pharmacy-dark2 overflow-y-auto">
      <div className="p-4 border-b border-pharmacy-dark2">
        <CustomerHeader 
          customer={customerData} 
          onSave={handleUpdateCustomer} 
        />
        
        <CustomerContactInfo 
          phone={customerData.phone}
          email={customerData.email}
          address={customerData.address}
          birthdate={customerData.birthdate}
        />
        
        <CustomerTags 
          tags={customerData.tags} 
          onAddTag={handleAddTag} 
        />
      </div>
      
      <div className="p-4 border-b border-pharmacy-dark2">
        <CustomerProducts 
          products={customerData.products} 
          onAddProduct={handleAddProduct} 
        />
      </div>
      
      <div className="p-4 border-b border-pharmacy-dark2">
        <CustomerAutomations products={customerData.products} />
      </div>
      
      <div className="p-4">
        <CustomerNotes 
          notes={customerData.notes} 
          onSaveNotes={handleSaveNotes} 
        />
      </div>
    </div>
  );
};

export default CustomerDetails;
