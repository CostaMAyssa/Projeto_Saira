
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Bell, Plus, Play, Pause, Calendar, Clock, BarChart, RefreshCcw, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import NewCampaignModal from './modals/NewCampaignModal';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { dashboardService, CampaignUIData } from '../../services/dashboardService'; // Import service and type
import { useEffect } from 'react'; // Import useEffect

// Local Campaign interface removed, using CampaignUIData from service

const CampaignsModule = () => {
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const [campaigns, setCampaigns] = useState<CampaignUIData[]>([]); // Initialize with empty array
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoadingCampaigns(true);
      try {
        const data = await dashboardService.getAllCampaignsDetails();
        setCampaigns(data);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
        setError("Falha ao carregar campanhas. Tente novamente mais tarde.");
        toast.error("Erro ao carregar campanhas.");
      } finally {
        setLoadingCampaigns(false);
      }
    };
    fetchCampaigns();
  }, []);

  // handleAddCampaign and handleToggleCampaignStatus remain for local state manipulation for now
  // as per task instructions (backend integration out of scope for this subtask).
  const handleAddCampaign = (newCampaignData: Omit<CampaignUIData, 'id' | 'lastRun' | 'audience'> & { audienceCriteria?: any }) => {
    // This function needs to be adapted if NewCampaignModal provides data in a different format
    // For now, creating a mock CampaignUIData structure.
    const mockAudience = newCampaignData.audienceCriteria ? JSON.stringify(newCampaignData.audienceCriteria) : "Critérios definidos";
    const newCampaignWithId: CampaignUIData = {
      ...newCampaignData,
      id: `local-${Date.now()}`, // Simple local ID
      audience: mockAudience,
      lastRun: 'Nunca executado', // Default for new local campaign
      // Ensure all fields of CampaignUIData are present if needed by the UI immediately
      // type, status, schedule might come from newCampaignData
    };
    
    setCampaigns(prev => [newCampaignWithId, ...prev]);
    toast.success('Campanha adicionada localmente!');
  };

  const handleToggleCampaignStatus = (id: string) => {
    setCampaigns(prevCampaigns => prevCampaigns.map(campaign => {
      if (campaign.id === id) {
        let newStatus: CampaignUIData['status'] = 'active';
        if (campaign.status === 'active') newStatus = 'paused';
        else if (campaign.status === 'paused') newStatus = 'active';
        // Scheduled campaigns might not be toggleable this way, or might become active/paused.
        // This simple toggle is a placeholder.
        
        return {
          ...campaign,
          status: newStatus,
          lastRun: newStatus === 'active' && campaign.status === 'paused' ? 'Agora (local)' : campaign.lastRun 
        };
      }
      return campaign;
    }));

    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      const action = campaign.status === 'active' ? 'pausada localmente' : 'ativada localmente';
      toast.success(`Campanha ${action}!`);
    }
  };
  
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    // Ensure these cases match the mapped types from mapCampaignTriggerToType in the service
    switch (type) {
      case 'Lembrete de Recompra':
        return <RefreshCcw className="h-4 w-4 mr-1 text-pharmacy-accent" />; // Changed from Bell for consistency
      case 'Aniversário':
        return <Calendar className="h-4 w-4 mr-1 text-pharmacy-accent" />;
      case 'Pós-venda':
        return <BarChart className="h-4 w-4 mr-1 text-pharmacy-accent" />;
      case 'Manual':
        return <Play className="h-4 w-4 mr-1 text-pharmacy-accent" />; // Example for Manual
      // 'Reativação' was in mock, might need a mapping in service or a new icon here
      // Defaulting to Clock for 'Outro' or unmapped types
      default:
        return <Clock className="h-4 w-4 mr-1 text-pharmacy-accent" />;
    }
  };

  if (loadingCampaigns) {
    return <div className="flex-1 p-6 flex justify-center items-center">Carregando campanhas...</div>;
  }

  if (error) {
    return (
      <div className="flex-1 p-6 flex flex-col justify-center items-center text-red-600">
        <AlertTriangle className="h-10 w-10 mb-4" />
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Tentar Novamente</Button>
      </div>
    );
  }

  return (
    };
    
    setCampaigns([newCampaignWithId, ...campaigns]);
    toast.success('Campanha criada com sucesso!');
  };

  const handleToggleCampaignStatus = (id: string) => {
    <div className="flex-1 p-3 sm:p-6 overflow-y-auto bg-white">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-pharmacy-text1">Campanhas e Automações</h1>
        <Button 
          className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
          size={isMobile ? "sm" : "default"}
          onClick={() => setIsNewCampaignModalOpen(true)}
        >
          <Plus className="mr-1 sm:mr-2 h-4 w-4" />
          {isMobile ? "Nova" : "Nova Campanha"}
        </Button>
      </div>
      
      <div className="mb-4 sm:mb-6">
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar campanhas por nome, tipo ou status..."
            className="pl-8 bg-white border-gray-300 text-pharmacy-text1 focus:border-pharmacy-accent w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-xl overflow-hidden border border-pharmacy-border1 shadow-sm no-scrollbar">
        {!isMobile ? (
          // Desktop view with table layout
          <>
            <div className="grid grid-cols-12 gap-2 sm:gap-4 p-3 sm:p-4 border-b border-pharmacy-border1 text-pharmacy-text1 font-medium bg-pharmacy-light2">
              <div className="col-span-4">Nome</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-2">Audiência</div>
              <div className="col-span-2">Agendamento</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Ações</div>
            </div>
            
            {filteredCampaigns.length === 0 && !loadingCampaigns && (
              <div className="p-4 text-center text-gray-500">Nenhuma campanha encontrada.</div>
            )}
            {filteredCampaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                className="grid grid-cols-12 gap-2 sm:gap-4 p-3 sm:p-4 border-b border-pharmacy-border1 hover:bg-pharmacy-light2 cursor-pointer"
              >
                <div className="col-span-4">
                  <div className="text-pharmacy-text1 font-medium">{campaign.name}</div>
                  <div className="text-xs text-pharmacy-text2">Última execução: {campaign.lastRun}</div>
                </div>
                <div className="col-span-2 text-pharmacy-text2 flex items-center">
                  {getTypeIcon(campaign.type)}
                  {campaign.type}
                </div>
                <div className="col-span-2 text-pharmacy-text2 truncate" title={campaign.audience}>{campaign.audience}</div>
                <div className="col-span-2 text-pharmacy-text2">{campaign.schedule}</div>
                <div className="col-span-1">
                  {campaign.status === 'active' ? (
                    <Badge className="bg-green-100 text-green-700 border border-green-200 font-medium">
                      Ativa
                    </Badge>
                  ) : campaign.status === 'paused' ? (
                    <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200 font-medium">
                      Pausada
                    </Badge>
                  ) : campaign.status === 'scheduled' ? (
                    <Badge className="bg-blue-100 text-blue-700 border border-blue-200 font-medium">
                      Agendada
                    </Badge>
                  ) : (
                     <Badge className="bg-gray-100 text-gray-700 border border-gray-200 font-medium">
                      Desconhecido
                    </Badge>
                  )}
                </div>
                <div className="col-span-1 flex justify-center">
                  {campaign.status !== 'scheduled' && ( // Assuming 'scheduled' campaigns cannot be paused/played directly from here
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-pharmacy-text2 hover:text-pharmacy-accent"
                      onClick={(e) => { e.stopPropagation(); handleToggleCampaignStatus(campaign.id); }}
                    >
                      {campaign.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          // Mobile view with card layout
          <>
            {filteredCampaigns.length === 0 && !loadingCampaigns && (
              <div className="p-4 text-center text-gray-500">Nenhuma campanha encontrada.</div>
            )}
            {filteredCampaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                className="p-3 border-b border-pharmacy-border1 hover:bg-pharmacy-light2"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-pharmacy-text1">{campaign.name}</div>
                  {campaign.status !== 'scheduled' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-pharmacy-text2 hover:text-pharmacy-accent p-1 h-auto"
                      onClick={(e) => { e.stopPropagation(); handleToggleCampaignStatus(campaign.id);}}
                    >
                      {campaign.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center text-xs text-pharmacy-text2">
                    {getTypeIcon(campaign.type)}
                    <span>{campaign.type}</span>
                  </div>
                  <div>
                    {campaign.status === 'active' ? (
                      <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs font-medium">
                        Ativa
                      </Badge>
                    ) : campaign.status === 'paused' ? (
                      <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200 text-xs font-medium">
                        Pausada
                      </Badge>
                    ) : campaign.status === 'scheduled' ? (
                      <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium">
                        Agendada
                      </Badge>
                    ) : (
                       <Badge className="bg-gray-100 text-gray-700 border border-gray-200 text-xs font-medium">
                        Desconhecido
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-1 text-xs text-pharmacy-text2">
                  <div className="truncate" title={campaign.audience}>
                    <span className="font-medium">Audiência:</span> {campaign.audience}
                  </div>
                  <div>
                    <span className="font-medium">Agenda:</span> {campaign.schedule}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Última execução:</span> {campaign.lastRun}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      
      <div className="mt-4 text-center text-sm text-pharmacy-text2">
        Exibindo {filteredCampaigns.length} campanha(s)
      </div>

      <NewCampaignModal 
        open={isNewCampaignModalOpen}
        onOpenChange={setIsNewCampaignModalOpen}
        onSubmit={handleAddCampaign}
      />
    </div>
  );
};

export default CampaignsModule;
