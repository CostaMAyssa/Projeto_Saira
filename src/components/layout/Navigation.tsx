import React from 'react';
import { Home } from 'lucide-react';

const Navigation: React.FC = () => {
  return (
    <nav className="bg-white border-b border-pharmacy-border1 px-4 py-3">
      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-pharmacy-accent" />
          <h1 className="text-xl font-bold text-pharmacy-text1">Green Pharmacy Chat</h1>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 