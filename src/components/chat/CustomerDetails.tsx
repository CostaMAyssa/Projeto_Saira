
import React from 'react';
import CustomerHeader from './customer-details/CustomerHeader';
import CustomerContactInfo from './customer-details/CustomerContactInfo';
import CustomerTags from './customer-details/CustomerTags';
import CustomerProducts from './customer-details/CustomerProducts';
import CustomerAutomations from './customer-details/CustomerAutomations';
import CustomerNotes from './customer-details/CustomerNotes';
import { mockCustomerDetails } from './customer-details/mockData';

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
        <CustomerHeader name={customer.name} />
        
        <CustomerContactInfo 
          phone={customer.phone}
          email={customer.email}
          address={customer.address}
          birthdate={customer.birthdate}
        />
        
        <CustomerTags tags={customer.tags} />
      </div>
      
      <div className="p-4 border-b border-pharmacy-dark2">
        <CustomerProducts products={customer.products} />
      </div>
      
      <div className="p-4 border-b border-pharmacy-dark2">
        <CustomerAutomations />
      </div>
      
      <div className="p-4">
        <CustomerNotes notes={customer.notes} />
      </div>
    </div>
  );
};

export default CustomerDetails;
