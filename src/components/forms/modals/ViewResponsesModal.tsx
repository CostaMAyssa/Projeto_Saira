import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, FileText, Calendar, User } from 'lucide-react';
import { getFormResponses } from '@/services/dashboardService';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface FormResponse {
  id: string;
  form_id: string;
  client_id?: string;
  phone?: string;
  email?: string;
  response: Record<string, any>;
  submitted_at: string;
  client?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

interface ViewResponsesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any | null;
}

const ViewResponsesModal: React.FC<ViewResponsesModalProps> = ({ open, onOpenChange, form }) => {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && form) {
      fetchResponses();
    }
  }, [open, form]);

  const fetchResponses = async () => {
    if (!form) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select(`
          *,
          client:clients(id, name, phone, email)
        `)
        .eq('form_id', form.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar respostas:', error);
        toast.error('Erro ao carregar respostas');
        return;
      }

      setResponses(data || []);
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
      toast.error('Erro ao carregar respostas');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!form || responses.length === 0) return;

    // Criar cabeçalho CSV
    const headers = Object.keys(responses[0].response).join(',');
    const rows = responses.map(response => {
      const values = Object.values(response.response).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      );
      return values.join(',');
    });

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${form.name}_respostas.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV exportado com sucesso!');
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Respostas do Formulário: {form.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Badge className="bg-pharmacy-accent text-white">
              {responses.length} respostas
            </Badge>
            {form.status === 'active' && (
              <Badge className="bg-green-100 text-green-700 border border-green-200">
                Ativo
              </Badge>
            )}
          </div>
          
          {responses.length > 0 && (
            <Button onClick={handleExportCSV} size="sm" className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pharmacy-accent"></div>
              <span className="ml-2">Carregando respostas...</span>
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma resposta encontrada para este formulário.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response, index) => (
                <div key={response.id} className="border border-pharmacy-border1 rounded-lg p-4 bg-pharmacy-light2">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-pharmacy-accent" />
                      <span className="text-sm font-medium text-pharmacy-text1">
                        Resposta #{index + 1}
                      </span>
                      {response.client && (
                        <Badge className="bg-pharmacy-accent text-white text-xs">
                          Cliente: {response.client.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-pharmacy-text2">
                      <Calendar className="h-3 w-3" />
                      {new Date(response.submitted_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  
                  {/* Informações de identificação */}
                  {(response.phone || response.email) && (
                    <div className="mb-3 p-3 bg-pharmacy-light2 rounded border border-pharmacy-border1">
                      <div className="text-xs font-medium text-pharmacy-text1 mb-2">
                        Identificação fornecida:
                      </div>
                      <div className="text-xs text-pharmacy-text2 space-y-1">
                        {response.phone && (
                          <div className="flex items-center gap-2">
                            <span>Telefone: {response.phone}</span>
                          </div>
                        )}
                        {response.email && (
                          <div className="flex items-center gap-2">
                            <span>Email: {response.email}</span>
                          </div>
                        )}
                        {response.client ? (
                          <div className="flex items-center gap-2 text-pharmacy-accent font-medium">
                            <span>Cliente identificado: {response.client.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-orange-600">
                            <span>Cliente não encontrado no sistema</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {Object.entries(response.response).map(([field, value]) => (
                      <div key={field} className="bg-white p-3 rounded border">
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          {field}
                        </div>
                        <div className="text-sm text-gray-900">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ViewResponsesModal; 