
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, FileText, Plus, Copy, Eye, Edit, Trash, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import NewFormModal from './modals/NewFormModal';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { getForms } from '../../services/dashboardService'; // Import getForms
// The Form interface from dashboardService is for DB structure. We'll adapt it to FormData for UI.

interface FormData { // This interface remains for the component's internal use
  id: string;
  name: string; // maps from title
  questions: number; // maps from question_count
  responses: number; // maps from form_responses (count)
  status: 'active' | 'inactive'; // maps from status ('ativo'/'inativo')
  createdAt: string; // maps from created_at (formatted)
  lastResponse: string; // Placeholder for now
}

const FormsModule = () => {
  const [isNewFormModalOpen, setIsNewFormModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const [forms, setForms] = useState<FormData[]>([]); // Initialize with empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      try {
        const dbForms = await getForms(); // Fetches data from Supabase
        if (dbForms) {
          const transformedForms: FormData[] = dbForms.map((form: any) => {
            let responseCount = 0;
            // Supabase returns joined table data as an array.
            // If form_responses is an array and has an object with count:
            if (Array.isArray(form.form_responses) && form.form_responses.length > 0 && form.form_responses[0].count !== undefined) {
              responseCount = form.form_responses[0].count;
            } 
            // If form_responses is an object with count (less likely for Supabase joins but good to check):
            else if (form.form_responses && typeof form.form_responses === 'object' && form.form_responses.count !== undefined) {
                 responseCount = form.form_responses.count;
            }


            return {
              id: form.id,
              name: form.title,
              questions: form.question_count || 0,
              responses: responseCount,
              status: form.status === 'ativo' ? 'active' : 'inactive',
              createdAt: new Date(form.created_at).toLocaleDateString('pt-BR'),
              lastResponse: 'N/A', // Placeholder as per requirements
            };
          });
          setForms(transformedForms);
        }
      } catch (err) {
        console.error("Failed to fetch forms:", err);
        setError("Falha ao carregar formulários. Tente novamente mais tarde.");
        toast.error("Erro ao carregar formulários.");
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  const handleAddForm = (newFormUI: Omit<FormData, 'id' | 'responses' | 'lastResponse' | 'createdAt'> & { name: string, questions: number, status: 'active' | 'inactive' }) => {
    // This function is for local state update as per instructions
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('pt-BR');
    
    const newFormWithId: FormData = {
      id: `local-${Date.now()}`, // Simple local ID
      name: newFormUI.name,
      questions: newFormUI.questions,
      status: newFormUI.status,
      responses: 0, // Default for new local form
      lastResponse: 'N/A', // Default for new local form
      createdAt: formattedDate,
    };
    
    setForms(prevForms => [newFormWithId, ...prevForms]);
    toast.success('Formulário adicionado localmente!');
  };

  const filteredForms = forms.filter(form => 
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (form.status === 'active' && 'ativo'.includes(searchTerm.toLowerCase())) ||
    (form.status === 'inactive' && 'inativo'.includes(searchTerm.toLowerCase()))
  );

  const renderMobileFormCard = (form: FormData) => (
    <div 
      key={form.id}
      className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 p-4"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-gray-900">{form.name}</div>
        <Badge 
          className={form.status === 'active' ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-700 border border-gray-200"}
        >
          {form.status === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>
      
      <div className="text-xs text-gray-500 mb-3">
        <div>Criado em: {form.createdAt}</div>
        <div>Última resposta: {form.lastResponse}</div>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm">
          <span className="font-medium">{form.questions}</span> perguntas
        </div>
        <div className="text-sm">
          <span className="font-medium">{form.responses}</span> respostas
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" className="text-pharmacy-accent hover:bg-gray-100 text-xs px-2 py-1 h-8">
          <Eye className="h-3 w-3 mr-1" />
          Ver
        </Button>
        <Button variant="ghost" size="sm" className="text-pharmacy-accent hover:bg-gray-100 text-xs px-2 py-1 h-8">
          <Edit className="h-3 w-3 mr-1" />
          Editar
        </Button>
        <Button variant="ghost" size="sm" className="text-pharmacy-accent hover:bg-gray-100 text-xs px-2 py-1 h-8">
          <Copy className="h-3 w-3 mr-1" />
          Link
        </Button>
        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-gray-100 text-xs px-2 py-1 h-8">
          <Trash className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  const renderDesktopFormList = () => (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 text-gray-600 font-medium">
        <div className="col-span-4">Nome</div>
        <div className="col-span-1">Perguntas</div>
        <div className="col-span-2">Respostas</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-3">Ações</div>
      </div>
        
      {filteredForms.map((form) => (
        <div 
          key={form.id} 
          className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
        >
          <div className="col-span-4">
            <div className="text-gray-900 font-medium">{form.name}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span>Criado em: {form.createdAt}</span>
              <span className="mx-2">•</span>
              <span>Última resposta: {form.lastResponse}</span>
            </div>
          </div>
          <div className="col-span-1 text-gray-500 flex items-center">
            {form.questions}
          </div>
          <div className="col-span-2 text-gray-900 flex items-center">
            {form.responses} respostas
          </div>
          <div className="col-span-2 flex items-center">
            <Badge 
              className={form.status === 'active' ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-700 border border-gray-200"}
            >
              {form.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <div className="col-span-3 flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-pharmacy-accent hover:bg-gray-100">
              <Copy className="h-4 w-4 mr-1" />
              Link
            </Button>
            <Button variant="ghost" size="sm" className="text-pharmacy-accent hover:bg-gray-100">
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button variant="ghost" size="sm" className="text-pharmacy-accent hover:bg-gray-100">
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-gray-100">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div className="flex-1 p-6 flex justify-center items-center text-gray-500">Carregando formulários...</div>;
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
    <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-white no-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3 md:gap-0">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Formulários</h1>
        <Button 
          className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white w-full md:w-auto"
          onClick={() => setIsNewFormModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Formulário
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 mb-4 md:mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar formulários por nome ou status (ativo/inativo)..."
            className="pl-8 bg-white border-gray-300 focus:border-pharmacy-accent w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="text-pharmacy-accent border-gray-300 w-full md:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>
      
      {filteredForms.length === 0 && !loading && (
         <div className="p-4 text-center text-gray-500">Nenhum formulário encontrado.</div>
      )}
      {isMobile ? (
        <div className="space-y-4">
          {filteredForms.map(renderMobileFormCard)}
        </div>
      ) : (
        renderDesktopFormList()
      )}
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Exibindo {filteredForms.length} formulário(s)
      </div>

      <NewFormModal 
        open={isNewFormModalOpen} 
        onOpenChange={setIsNewFormModalOpen}
        onSubmit={handleAddForm}
      />
    </div>
  );
};

export default FormsModule;
