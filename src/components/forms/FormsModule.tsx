import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, FileText, Plus, Copy, Eye, Edit, Trash } from 'lucide-react';

const FormsModule = () => {
  const mockForms = [
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
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Formulários</h1>
        <Button className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Novo Formulário
        </Button>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar formulários..."
            className="pl-8 bg-white border-gray-300 focus:border-pharmacy-accent"
          />
        </div>
        <Button variant="outline" className="text-pharmacy-accent border-gray-300">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>
      
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 text-gray-600 font-medium">
          <div className="col-span-4">Nome</div>
          <div className="col-span-1">Perguntas</div>
          <div className="col-span-2">Respostas</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Ações</div>
        </div>
        
        {mockForms.map((form) => (
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
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Exibindo 5 de 15 formulários
      </div>
    </div>
  );
};

export default FormsModule;
