import React from 'react';
import Navigation from '@/components/layout/Navigation';
import EventsMonitor from '@/components/dashboard/EventsMonitor';

const Dashboard: React.FC = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-pharmacy-text1">Dashboard - Monitor de Eventos</h1>
              <p className="text-pharmacy-text2 mt-1">
                Monitoramento em tempo real dos eventos da Evolution API
              </p>
            </div>
            
            <EventsMonitor />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 