import React, { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import ModuleManager from '@/components/modules/ModuleManager';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

const Index = () => {
  const [activePage, setActivePage] = useState('dashboard');
  
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        
        <div className="flex-1 flex flex-col">
          <TopBar />
          <div className="flex-1 flex overflow-hidden">
            <ModuleManager activePage={activePage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
