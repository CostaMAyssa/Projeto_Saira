import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Edit3, Trash2, GripVertical } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'date' | 'radio';
  placeholder?: string;
  required: boolean;
  options?: string[]; // Para select, radio e checkbox
}

interface NewFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: {
    id?: string;
    name: string;
    questions: number;
    status: 'active' | 'inactive';
    fields?: Record<string, FormFieldConfig>;
    redirect_url?: string;
    createdAt?: string;
  }) => void;
  initialData?: {
    id: string;
    name: string;
    questions: number;
    status: 'active' | 'inactive';
    fields?: Record<string, FormFieldConfig>;
    redirect_url?: string;
    createdAt?: string;
  } | null;
}

interface FormFieldConfig {
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Para select, radio e checkbox
}

const NewFormModal: React.FC<NewFormModalProps> = ({ open, onOpenChange, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  
  const isMobile = useIsMobile();
  const isEditing = Boolean(initialData);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Editing mode - populate with existing data
        setName(initialData.name || '');
        setIsActive(initialData.status === 'active');
        setRedirectUrl(initialData.redirect_url || '');
        
        // Parse existing fields
        if (initialData.fields && typeof initialData.fields === 'object' && Object.keys(initialData.fields).length > 0) {
          console.log('🔍 Parsing campos existentes:', initialData.fields);
          const parsedFields: FormField[] = Object.entries(initialData.fields).map(([key, value], index) => {
            if (typeof value === 'string') {
              return {
                id: `field_${index}`,
                label: value,
                type: 'text' as const,
                placeholder: '',
                required: true,
                options: []
              };
            } else if (typeof value === 'object' && value !== null) {
              const fieldConfig = value as FormFieldConfig;
              const validType = ['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'date', 'radio'].includes(fieldConfig.type) 
                ? fieldConfig.type as FormField['type']
                : 'text' as const;
              console.log(`📝 Campo ${key}: tipo=${fieldConfig.type} -> ${validType}, opções:`, fieldConfig.options);
              return {
                id: key,
                label: fieldConfig.label || key,
                type: validType,
                placeholder: fieldConfig.placeholder || '',
                required: fieldConfig.required !== false,
                options: fieldConfig.options || [] // Preservar as opções existentes
              };
            }
            return {
              id: key,
              label: key,
              type: 'text' as const,
              placeholder: '',
              required: true,
              options: []
            };
          });
          console.log('✅ Campos parseados:', parsedFields);
          setFields(parsedFields);
        } else {
          // Adicionar campos padrão se não houver campos
          setFields([
            { id: 'nome', label: 'Nome completo', type: 'text', placeholder: 'Digite seu nome completo', required: true },
            { id: 'email', label: 'E-mail', type: 'email', placeholder: 'Digite seu e-mail', required: true },
            { id: 'telefone', label: 'Telefone', type: 'phone', placeholder: 'Digite seu telefone', required: true }
          ]);
        }
      } else {
        // Creation mode - reset to defaults
        setName('');
        setIsActive(true);
        setRedirectUrl('');
        setFields([
          { id: 'nome', label: 'Nome completo', type: 'text', placeholder: 'Digite seu nome completo', required: true },
          { id: 'email', label: 'E-mail', type: 'email', placeholder: 'Digite seu e-mail', required: true },
          { id: 'telefone', label: 'Telefone', type: 'phone', placeholder: 'Digite seu telefone', required: true }
        ]);
      }
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert fields array to the format expected by the database
    const fieldsObject: Record<string, FormFieldConfig> = {};
    fields.forEach(field => {
      fieldsObject[field.id] = {
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        required: field.required,
        options: field.options
      };
    });

    const formData = {
      id: initialData?.id,
      name,
      questions: fields.length,
      status: isActive ? 'active' as const : 'inactive' as const,
      fields: fieldsObject,
      redirect_url: redirectUrl,
      createdAt: initialData?.createdAt,
    };

    onSubmit(formData);
  };

  const addField = () => {
    const newField: FormField = {
      id: `campo_${Date.now()}`,
      label: 'Novo campo',
      type: 'text',
      placeholder: '',
      required: true,
      options: [] // Inicializar com array vazio
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    
    // Se o tipo foi alterado para um que precisa de opções, garantir que tenha pelo menos 2
    if (updates.type && ['select', 'radio', 'checkbox'].includes(updates.type)) {
      if (!updatedFields[index].options || updatedFields[index].options!.length < 2) {
        updatedFields[index].options = ['Opção 1', 'Opção 2'];
      }
    }
    
    // Se o tipo foi alterado para um que não precisa de opções, limpar as opções
    if (updates.type && !['select', 'radio', 'checkbox'].includes(updates.type)) {
      updatedFields[index].options = [];
    }
    
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) { // Manter pelo menos um campo
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const renderField = (field: FormField, index: number) => (
    <Card key={field.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <CardTitle className="text-sm font-medium">Campo {index + 1}</CardTitle>
          </div>
          {fields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeField(index)}
              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Rótulo do campo</Label>
            <Input
              value={field.label}
              onChange={(e) => updateField(index, { label: e.target.value })}
              placeholder="Ex: Nome completo"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Tipo do campo</Label>
            <Select value={field.type} onValueChange={(value: FormField['type']) => updateField(index, { type: value })}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="textarea">Texto longo</SelectItem>
                <SelectItem value="select">Lista suspensa</SelectItem>
                <SelectItem value="radio">Múltipla escolha</SelectItem>
                <SelectItem value="checkbox">Caixas de seleção</SelectItem>
                <SelectItem value="date">Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {!['select', 'radio', 'checkbox', 'date'].includes(field.type) && (
          <div>
            <Label className="text-xs text-gray-600">Placeholder (texto de ajuda)</Label>
            <Input
              value={field.placeholder || ''}
              onChange={(e) => updateField(index, { placeholder: e.target.value })}
              placeholder="Ex: Digite seu nome completo"
              className="h-8 text-sm"
            />
          </div>
        )}

        {['select', 'radio', 'checkbox'].includes(field.type) && (
          <div>
            <Label className="text-xs text-gray-600 mb-2 block">Opções do campo</Label>
            <div className="space-y-2 mb-3">
              {(field.options || []).map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(field.options || [])];
                      newOptions[optionIndex] = e.target.value;
                      updateField(index, { options: newOptions });
                    }}
                    placeholder={`Opção ${optionIndex + 1}`}
                    className="flex-1 h-8 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOptions = (field.options || []).filter((_, i) => i !== optionIndex);
                      updateField(index, { options: newOptions });
                    }}
                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    disabled={(field.options || []).length <= 2}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newOptions = [...(field.options || []), ''];
                updateField(index, { options: newOptions });
              }}
              className="w-full h-8 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Adicionar Opção
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Mínimo 2 opções necessárias
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Campo obrigatório</Label>
          <Switch
            checked={field.required}
            onCheckedChange={(checked) => updateField(index, { required: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh]' : 'max-w-2xl max-h-[90vh]'} overflow-hidden flex flex-col`}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            {isEditing ? <Edit3 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            {isEditing ? 'Editar Formulário' : 'Novo Formulário'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4">
              {/* Informações básicas */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-gray-700">Nome do Formulário</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Cadastro de Cliente"
                    required
                    className="bg-white border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="redirectUrl" className="text-gray-700">URL de Redirecionamento (Opcional)</Label>
                  <Input
                    id="redirectUrl"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="Ex: https://meusite.com/obrigado"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive" className="text-gray-700">Ativar Formulário</Label>
                    <p className="text-xs text-gray-500">
                      Tornar o formulário disponível publicamente
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </div>

              {/* Configuração de campos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 font-medium">Campos do Formulário</Label>
                  <Button
                    type="button"
                    onClick={addField}
                    size="sm"
                    className="bg-pharmacy-accent hover:bg-pharmacy-accent/90"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Campo
                  </Button>
                </div>

                <div className="space-y-2">
                  {fields.map((field, index) => renderField(field, index))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-pharmacy-accent hover:bg-pharmacy-accent/90"
                disabled={!name.trim() || fields.length === 0}
              >
                {isEditing ? 'Atualizar' : 'Criar'} Formulário
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFormModal;
