
import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import ModuleManager from '@/components/modules/ModuleManager';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

const Index = () => {
  const [activePage, setActivePage] = useState('dashboard');
  
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          <ModuleManager activePage={activePage} />
        </div>
      </div>
    </div>
  );
};

export default Index;
