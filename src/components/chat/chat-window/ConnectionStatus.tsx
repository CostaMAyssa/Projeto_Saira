import React from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

interface ConnectionStatusProps {
  websocketStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  realtimeStatus: 'connected' | 'disconnected';
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  websocketStatus, 
  realtimeStatus 
}) => {
  const getStatusIcon = () => {
    if (websocketStatus === 'connected' && realtimeStatus === 'connected') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (websocketStatus === 'connecting') {
      return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
    } else if (realtimeStatus === 'connected') {
      return <Wifi className="h-4 w-4 text-blue-500" />;
    } else {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    if (websocketStatus === 'connected' && realtimeStatus === 'connected') {
      return 'Tempo real ativo (WebSocket + Realtime)';
    } else if (websocketStatus === 'connected') {
      return 'WebSocket conectado';
    } else if (realtimeStatus === 'connected') {
      return 'Realtime ativo (Fallback)';
    } else if (websocketStatus === 'connecting') {
      return 'Conectando...';
    } else {
      return 'Desconectado';
    }
  };

  const getStatusColor = () => {
    if (websocketStatus === 'connected' && realtimeStatus === 'connected') {
      return 'text-green-600';
    } else if (websocketStatus === 'connected' || realtimeStatus === 'connected') {
      return 'text-blue-600';
    } else if (websocketStatus === 'connecting') {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-full">
      {getStatusIcon()}
      <span className={`text-xs font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </div>
  );
};

export default ConnectionStatus; 