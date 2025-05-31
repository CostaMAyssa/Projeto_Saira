
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea'; // Added Textarea import
import { FileText, Plus, Edit3 } from 'lucide-react'; // Added Edit3 for edit mode
import { useIsMobile } from '@/hooks/use-mobile';

interface NewFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: {
    id?: string; // Added id for editing
    name: string;
    questions: number;
    status: 'active' | 'inactive';
    fields?: any; // Added fields
    redirect_url?: string; // Added redirect_url
    createdAt?: string; // Kept createdAt as optional, might be needed by FormsModule
  }) => void;
  initialData?: { // Added initialData for editing
    id: string;
    name: string;
    questions: number;
    status: 'active' | 'inactive';
    fields?: any;
    redirect_url?: string;
    createdAt?: string;
  } | null;
}

interface FormTemplate {
  name: string;
  description: string;
  questions: number;
}

const NewFormModal: React.FC<NewFormModalProps> = ({ open, onOpenChange, onSubmit, initialData }) => {
  const [formName, setFormName] = useState('');
  const [templateType, setTemplateType] = useState(''); // This might need to be disabled/hidden in edit mode
  const [numQuestions, setNumQuestions] = useState(5);
  const [isActive, setIsActive] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [fieldsJsonString, setFieldsJsonString] = useState('');
  const isMobile = useIsMobile();

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormName(initialData.name);
      setNumQuestions(initialData.questions);
      setIsActive(initialData.status === 'active');
      setRedirectUrl(initialData.redirect_url || '');
      setFieldsJsonString(JSON.stringify(initialData.fields || {}, null, 2));
      // Template selection is disabled/hidden when editing
      setTemplateType('custom'); // Or some other way to signify template doesn't apply
    } else {
      // Reset for new form
      setFormName('');
      setTemplateType('');
      setNumQuestions(5);
      setIsActive(true);
      setRedirectUrl('');
      setFieldsJsonString('');
    }
  }, [initialData, open]); // Re-run if initialData or open status changes

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
      // Basic validation, consider adding more specific error messages (e.g., using a toast library)
      return;
    }

    let fieldsData = {};
    if (fieldsJsonString.trim()) {
      try {
        fieldsData = JSON.parse(fieldsJsonString);
      } catch (e) {
        console.error("Invalid JSON for fields", e);
        // alert('JSON dos campos do formulário é inválido.'); // Simple feedback, replace with better UX
        // Consider adding a state for JSON validation error and displaying it near the textarea
        return; // Prevent submission
      }
    }

    const dataToSubmit: {
      id?: string;
      name: string;
      questions: number;
      status: 'active' | 'inactive';
      fields?: any;
      redirect_url?: string;
      createdAt?: string;
    } = {
      name: formName,
      questions: numQuestions,
      status: isActive ? 'active' : 'inactive',
      redirect_url: redirectUrl.trim() || undefined, // Send undefined if empty to potentially clear it
      fields: fieldsData,
    };

    if (isEditing && initialData?.id) {
      dataToSubmit.id = initialData.id;
      // If backend expects createdAt on update, and it was part of initialData
      // if (initialData.createdAt) {
      //   dataToSubmit.createdAt = initialData.createdAt;
      // }
    } else {
      // For new forms, if your onSubmit prop still strictly requires createdAt (even if backend generates it)
      // const currentDate = new Date();
      // dataToSubmit.createdAt = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
      // However, the prompt implies FormsModule handles createdAt, so it might not be needed here for new forms either.
      // Let's assume onSubmit is flexible or FormsModule handles it.
    }

    onSubmit(dataToSubmit);

    if (!isEditing) { // Reset form only if it's a new form submission
      setFormName('');
      setTemplateType('');
      setNumQuestions(5);
      setIsActive(true);
      setRedirectUrl('');
      setFieldsJsonString('');
    }
    onOpenChange(false); // Close modal in both cases
  };

  const handleTemplateChange = (value: string) => {
    if (isEditing) return; // Don't change things if editing
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

  // Helper for JSON validation feedback (optional)
  // const isJsonValid = (str: string) => {
  //   if (!str.trim()) return true; // Empty is fine, will default to {}
  //   try {
  //     JSON.parse(str);
  //   } catch (e) {
  //     return false;
  //   }
  //   return true;
  // };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[550px] p-4 md:p-6 max-w-[95vw] md:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
            {isEditing ? <Edit3 className="h-5 w-5 text-pharmacy-accent" /> : <FileText className="h-5 w-5 text-pharmacy-accent" />}
            {isEditing ? 'Editar Formulário' : 'Novo Formulário'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 md:py-4 space-y-4">
          {!isEditing && ( // Hide template selection when editing
            <div className="space-y-2">
              <Label htmlFor="template" className="text-gray-700">Tipo de Formulário</Label>
              <Select value={templateType} onValueChange={handleTemplateChange} disabled={isEditing}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent className={isMobile ? "max-w-[90vw]" : ""}>
                  <SelectItem value="satisfaction">Pesquisa de Satisfação</SelectItem>
                  <SelectItem value="registration">Cadastro de Cliente</SelectItem>
                  <SelectItem value="medical">Histórico Médico</SelectItem>
                  <SelectItem value="feedback">Feedback de Atendimento</SelectItem>
                  <SelectItem value="custom">Formulário Personalizado</SelectItem>
                </SelectContent>
              </Select>
              {templateType && templates[templateType] && (
                <p className="text-xs text-gray-500 mt-1">
                  {templates[templateType].description}
                </p>
              )}
            </div>
          )}

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
              disabled={isEditing} // Number of questions might be derived from fields in edit mode
            />
          </div>

          {isEditing && ( // Show these fields only in edit mode
            <>
              <div className="space-y-2">
                <Label htmlFor="redirectUrl" className="text-gray-700">URL de Redirecionamento (Opcional)</Label>
                <Input
                  id="redirectUrl"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="Ex: https://meusite.com/obrigado"
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fieldsJson" className="text-gray-700">Campos do Formulário (JSON)</Label>
                <Textarea
                  id="fieldsJson"
                  value={fieldsJsonString}
                  onChange={(e) => setFieldsJsonString(e.target.value)}
                  placeholder='Ex: { "question1": "Qual seu nome?", "question2": "Qual seu email?" }'
                  className="bg-white border-gray-300 min-h-[100px]"
                />
                {/* Example of basic JSON validation feedback - you might want a helper 'isJsonValid' */}
                {/* {!isJsonValid(fieldsJsonString) && fieldsJsonString.trim() && <p className="text-xs text-red-500">JSON inválido.</p>} */}
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive" className="text-gray-700">Ativar Formulário</Label>
              <p className="text-xs text-gray-500">
                {isEditing ? "Define se o formulário está ativo ou inativo." : "Tornar o formulário disponível imediatamente"}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <DialogFooter className={isMobile ? "flex-col space-y-2 sm:space-y-0" : ""}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={`border-gray-300 text-gray-700 ${isMobile ? "w-full" : ""}`}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formName.trim()} // Consider adding !isJsonValid(fieldsJsonString) if using validation feedback
            className={`bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white ${isMobile ? "w-full" : ""}`}
          >
            {isEditing ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {isEditing ? 'Salvar Alterações' : 'Criar Formulário'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewFormModal;
