import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileText, Plus } from 'lucide-react';

interface NewFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: {
    name: string;
    questions: number;
    status: 'active' | 'inactive';
    createdAt: string;
  }) => void;
}

interface FormTemplate {
  name: string;
  description: string;
  questions: number;
}

const NewFormModal: React.FC<NewFormModalProps> = ({ open, onOpenChange, onSubmit }) => {
  const [formName, setFormName] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isActive, setIsActive] = useState(true);

  const templates: Record<string, FormTemplate> = {
    satisfaction: {
      name: 'Pesquisa de Satisfação',
      description: 'Modelo para avaliar a satisfação dos clientes com os serviços da farmácia.',
      questions: 8
    },
    registration: {
      name: 'Cadastro de Cliente',
      description: 'Formulário para registrar novos clientes com informações básicas e de saúde.',
      questions: 12
    },
    medical: {
      name: 'Histórico Médico',
      description: 'Coleta de informações médicas relevantes para acompanhamento farmacêutico.',
      questions: 15
    },
    feedback: {
      name: 'Feedback de Atendimento',
      description: 'Avaliação do atendimento recebido na farmácia.',
      questions: 6
    },
    custom: {
      name: 'Personalizado',
      description: 'Crie um formulário do zero com suas próprias perguntas.',
      questions: 5
    }
  };

  const handleSubmit = () => {
    if (!formName.trim()) {
      return;
    }

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;

    onSubmit({
      name: formName,
      questions: numQuestions,
      status: isActive ? 'active' : 'inactive',
      createdAt: formattedDate
    });

    // Reset form
    setFormName('');
    setTemplateType('');
    setNumQuestions(5);
    setIsActive(true);
    onOpenChange(false);
  };

  const handleTemplateChange = (value: string) => {
    setTemplateType(value);
    if (value !== 'custom') {
      const template = templates[value];
      setFormName(template.name);
      setNumQuestions(template.questions);
    } else {
      setFormName('');
      setNumQuestions(5);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-pharmacy-accent" />
            Novo Formulário
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template" className="text-gray-700">Tipo de Formulário</Label>
            <Select value={templateType} onValueChange={handleTemplateChange}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="satisfaction">Pesquisa de Satisfação</SelectItem>
                <SelectItem value="registration">Cadastro de Cliente</SelectItem>
                <SelectItem value="medical">Histórico Médico</SelectItem>
                <SelectItem value="feedback">Feedback de Atendimento</SelectItem>
                <SelectItem value="custom">Formulário Personalizado</SelectItem>
              </SelectContent>
            </Select>
            {templateType && (
              <p className="text-xs text-gray-500 mt-1">
                {templates[templateType].description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="formName" className="text-gray-700">Nome do Formulário</Label>
            <Input
              id="formName"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ex: Pesquisa de Satisfação do Cliente"
              className="bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numQuestions" className="text-gray-700">Número de Perguntas</Label>
            <Input
              id="numQuestions"
              type="number"
              min={1}
              max={50}
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
              className="bg-white border-gray-300"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive" className="text-gray-700">Ativar Formulário</Label>
              <p className="text-xs text-gray-500">Tornar o formulário disponível imediatamente</p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300 text-gray-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formName.trim()}
            className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Formulário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewFormModal; 