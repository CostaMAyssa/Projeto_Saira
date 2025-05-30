
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, FileText, Plus, Copy, Eye, Edit, Trash, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import NewFormModal from './modals/NewFormModal';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
// Removed initial getForms import, will use the consolidated one.
import { getForms, createForm, updateForm, deleteForm, Form as DbForm } from '../../services/dashboardService'; // MOVED TO TOP & CONSOLIDATED

// FormData interface for UI state - Using the more detailed version
interface FormData {
  id: string;
  name: string; // maps from title
  questions: number; // maps from question_count
  responses: number; // maps from form_responses (count)
  status: 'active' | 'inactive'; // maps from status ('ativo'/'inativo')
  createdAt: string; // maps from created_at (formatted)
  lastResponse: string; // Placeholder
  // Include original DB fields if needed for editing, e.g. to pass back to updateForm
  fields?: any; // from DbForm.fields
  redirect_url?: string; // from DbForm.redirect_url
}

// Single, consolidated FormsModule component definition
const FormsModule = () => {
  const [isNewFormModalOpen, setIsNewFormModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [selectedFormToEdit, setSelectedFormToEdit] = useState<FormData | null>(null); 
  const isMobile = useIsMobile();
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFormsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // setError(null); // Ensure error is cleared at the beginning of a fetch attempt - already done by fetchFormsData
      const dbForms = await getForms();
      if (dbForms) {
        const transformedForms: FormData[] = dbForms.map((form: any) => {
          let responseCount = 0;
          if (Array.isArray(form.form_responses) && form.form_responses.length > 0 && form.form_responses[0].count !== undefined) {
            responseCount = form.form_responses[0].count;
          } else if (form.form_responses && typeof form.form_responses === 'object' && form.form_responses.count !== undefined) {
            responseCount = form.form_responses.count;
          }
          return {
            id: form.id,
            name: form.title,
            questions: form.question_count || 0,
            responses: responseCount,
            status: form.status === 'ativo' ? 'active' : 'inactive',
            createdAt: new Date(form.created_at).toLocaleDateString('pt-BR'),
            lastResponse: 'N/A', // Placeholder
            // Store original DB fields needed for editing
            fields: form.fields,
            redirect_url: form.redirect_url,
          };
        });
        setForms(transformedForms);
      }
    } catch (err) {
      // The existing logic assumes any error caught here is a "real request failure".
      // More specific error checking (e.g., for network errors or 5xx status codes)
      // could be implemented if the `getForms` service provided typed errors or status codes.
      // For now, any exception leads to an error message.
      console.error("Failed to fetch forms:", err);
      const errorMessage = "Falha ao carregar formulários. Tente novamente mais tarde.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormsData();
  }, []);

  // Type for data coming from NewFormModal (UI representation)
  type NewFormModalData = {
    name: string; // UI field: name
    questions: number;
    status: 'active' | 'inactive'; // UI field: status
    fields?: any; // Optional: if modal collects this
    redirect_url?: string; // Optional: if modal collects this
  };

  const handleAddForm = async (modalData: NewFormModalData) => {
    // Map UI data to DB structure (Omit<DbForm, 'id' | 'created_at'>)
    const formDataToSave: Omit<DbForm, 'id' | 'created_at' | 'created_by'> & { created_by?: string } = {
      title: modalData.name,
      question_count: modalData.questions,
      status: modalData.status === 'active' ? 'ativo' : 'inativo',
      fields: modalData.fields || {}, // Default to empty object if not provided
      redirect_url: modalData.redirect_url || '', // Default to empty string
      // created_by: 'user_placeholder_uuid', // Placeholder or get from auth context
    };

    try {
      await createForm(formDataToSave as Omit<DbForm, 'id' | 'created_at'>); // Assert type if created_by is truly optional in DB or handled by policy
      toast.success('Formulário criado com sucesso!');
      fetchFormsData(); // Refresh list
      setIsNewFormModalOpen(false);
    } catch (err) {
      console.error("Error creating form:", err);
      toast.error('Erro ao criar formulário.');
    }
  };

  const handleEditForm = (form: FormData) => {
    setSelectedFormToEdit(form);
    setIsEditModalOpen(true); 
    // Assuming NewFormModal is reused for editing. If not, a different modal state would be set.
    // setIsNewFormModalOpen(true); // If reusing NewFormModal for edit
  };
  
  // Type for data coming from an Edit Modal (UI representation)
  type EditFormModalData = {
    name: string;
    questions: number;
    status: 'active' | 'inactive';
    fields?: any;
    redirect_url?: string;
  };

  const handleSaveFormUpdate = async (formId: string, modalData: EditFormModalData) => {
    const updatesForDb: Partial<DbForm> = {
      title: modalData.name,
      question_count: modalData.questions,
      status: modalData.status === 'active' ? 'ativo' : 'inativo',
      fields: modalData.fields,
      redirect_url: modalData.redirect_url,
    };

    try {
      await updateForm(formId, updatesForDb);
      toast.success('Formulário atualizado com sucesso!');
      fetchFormsData(); // Refresh list
      setIsEditModalOpen(false);
      setSelectedFormToEdit(null);
    } catch (err) {
      console.error(`Error updating form ${formId}:`, err);
      toast.error('Erro ao atualizar formulário.');
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este formulário? Esta ação não pode ser desfeita.")) {
      try {
        await deleteForm(formId);
        toast.success('Formulário excluído com sucesso!');
        fetchFormsData(); // Refresh list
      } catch (err) {
        console.error(`Error deleting form ${formId}:`, err);
        toast.error('Erro ao excluir formulário.');
      }
    }
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
          className={form.status === 'active' ? "bg-green-100 text-green-700 border border-green-200 text-xs" : "bg-gray-100 text-gray-700 border border-gray-200 text-xs"}
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
        <Button variant="ghost" size="sm" className="text-pharmacy-accent hover:bg-gray-100 text-xs px-2 py-1 h-8" onClick={() => handleEditForm(form)}>
          <Edit className="h-3 w-3 mr-1" />
          Editar
        </Button>
        <Button variant="ghost" size="sm" className="text-pharmacy-accent hover:bg-gray-100 text-xs px-2 py-1 h-8" onClick={() => toast.info("Funcionalidade de link em breve.")}>
          <Copy className="h-3 w-3 mr-1" />
          Link
        </Button>
        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-gray-100 text-xs px-2 py-1 h-8" onClick={(e) => { e.stopPropagation(); handleDeleteForm(form.id); }}>
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
            <Button variant="ghost" size="sm" className="text-pharmacy-accent hover:bg-gray-100" onClick={() => handleEditForm(form)}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); handleDeleteForm(form.id); }}>
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

  // The error display is now part of the main return block.

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

      {/* Display error message here if it exists, instead of blocking the whole page */}
      {error && (
        <div className="mb-4 p-4 flex flex-col justify-center items-center text-red-600 border border-red-300 bg-red-50 rounded-md">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p className="text-center">{error}</p>
          <Button 
            onClick={() => {
              // setError(null); // fetchFormsData already sets error to null at the beginning
              fetchFormsData(); // Attempt to refetch
            }} 
            className="mt-3 bg-red-600 hover:bg-red-700 text-white"
          >
            Tentar Novamente
          </Button>
        </div>
      )}
      
      {/* Show "No forms registered yet" if there's no error, not loading, and no forms */}
      {!loading && !error && filteredForms.length === 0 && (
         <div className="p-4 text-center text-gray-500">Nenhum formulário cadastrado ainda.</div>
      )}

      {/* Render forms only if there is no error, not loading, and there are forms to display */}
      {!loading && !error && filteredForms.length > 0 && (
        isMobile ? (
          <div className="space-y-4">
            {filteredForms.map(renderMobileFormCard)}
          </div>
        ) : (
          renderDesktopFormList()
        )
      )}
      
      {/* Show form count only if not loading, no error, and there are forms */}
      {!loading && !error && filteredForms.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Exibindo {filteredForms.length} formulário(s)
        </div>
      )}

      <NewFormModal 
        open={isNewFormModalOpen} 
        onOpenChange={setIsNewFormModalOpen}
        onSubmit={selectedFormToEdit ? (data => handleSaveFormUpdate(selectedFormToEdit.id, data as EditFormModalData)) : handleAddForm}
        initialData={selectedFormToEdit} 
        key={selectedFormToEdit ? selectedFormToEdit.id : 'new-form-modal'} 
      />
      {/* If using a separate Edit Modal:
      {selectedFormToEdit && isEditModalOpen && (
        <EditFormModal // Assuming an EditFormModal component exists or NewFormModal is adapted
          open={isEditModalOpen}
          onOpenChange={(isOpen) => {
            setIsEditModalOpen(isOpen);
            if (!isOpen) setSelectedFormToEdit(null);
          }}
          initialData={selectedFormToEdit}
          onSubmit={(updatedData) => handleSaveFormUpdate(selectedFormToEdit.id, updatedData)}
        />
      )}
      */}
    </div>
  );
};

export default FormsModule;
