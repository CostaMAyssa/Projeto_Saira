
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, FileText, Plus, Copy, Eye, Edit, Trash } from 'lucide-react';
import NewFormModal from './modals/NewFormModal';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface FormData {
  id: string;
  name: string;
  questions: number;
  responses: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastResponse: string;
}

const FormsModule = () => {
  const [isNewFormModalOpen, setIsNewFormModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const [forms, setForms] = useState<FormData[]>([
    {
      id: '1',
      name: 'Pesquisa de Satisfação',
      questions: 8,
      responses: 42,
      status: 'active',
      createdAt: '10/04/2023',
      lastResponse: '2 horas atrás',
    },
    {
      id: '2',
      name: 'Cadastro de Novos Clientes',
      questions: 12,
      responses: 87,
      status: 'active',
      createdAt: '15/03/2023',
      lastResponse: '5 horas atrás',
    },
    {
      id: '3',
      name: 'Avaliação de Atendimento',
      questions: 6,
      responses: 35,
      status: 'inactive',
      createdAt: '22/02/2023',
      lastResponse: '5 dias atrás',
    },
    {
      id: '4',
      name: 'Histórico Médico',
      questions: 15,
      responses: 65,
      status: 'active',
      createdAt: '08/01/2023',
      lastResponse: '1 dia atrás',
    },
    {
      id: '5',
      name: 'Preferências de Comunicação',
      questions: 5,
      responses: 28,
      status: 'inactive',
      createdAt: '30/12/2022',
      lastResponse: '1 semana atrás',
    },
  ]);

  const handleAddForm = (newForm: Omit<FormData, 'id' | 'responses' | 'lastResponse'>) => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    
    const newFormWithId: FormData = {
      ...newForm,
      id: (forms.length + 1).toString(),
      responses: 0,
      lastResponse: 'Sem respostas',
      createdAt: formattedDate,
    };
    
    setForms([newFormWithId, ...forms]);
    toast.success('Formulário criado com sucesso!');
  };

  const renderMobileFormCard = (form: FormData) => (
    <div 
      key={form.id}
      className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 p-4"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-gray-900">{form.name}</div>
        <Badge 
          className={form.status === 'active' ? "bg-green-600 text-white text-xs" : "bg-gray-500 text-white text-xs"}
        >
          {form.status === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>
      
      <div className="text-xs text-gray-500 mb-3">
        <div>Criado em {form.createdAt}</div>
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
        
      {forms.map((form) => (
        <div 
          key={form.id} 
          className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
        >
          <div className="col-span-4">
            <div className="text-gray-900 font-medium">{form.name}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span>Criado em {form.createdAt}</span>
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
              className={form.status === 'active' ? "bg-green-600 text-white" : "bg-gray-500 text-white"}
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
            placeholder="Buscar formulários..."
            className="pl-8 bg-white border-gray-300 focus:border-pharmacy-accent w-full"
          />
        </div>
        <Button variant="outline" className="text-pharmacy-accent border-gray-300 w-full md:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>
      
      {isMobile ? (
        <div className="space-y-4">
          {forms.map(renderMobileFormCard)}
        </div>
      ) : (
        renderDesktopFormList()
      )}
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Exibindo {forms.length} de 15 formulários
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
