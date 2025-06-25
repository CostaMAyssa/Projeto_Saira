import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FormData {
  id: string;
  title: string;
  fields: Record<string, FormFieldConfig>;
  redirect_url?: string;
  status: string;
  // Campos de personalização visual
  logo_url?: string;
  background_color?: string;
  accent_color?: string;
  text_color?: string;
}

interface FormFieldConfig {
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Para select, radio e checkbox
}

interface FormResponse {
  [key: string]: string | string[]; // Permitir arrays para checkbox
}

const PublicForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<FormResponse>({});

  useEffect(() => {
    const fetchForm = async () => {
      if (!id) {
        setError('ID do formulário não fornecido');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Buscando formulário público:', id);
        
        const { data, error: fetchError } = await supabase
          .from('forms')
          .select('*')
          .eq('id', id)
          .eq('status', 'ativo') // Só formulários ativos podem ser acessados publicamente
          .single();

        if (fetchError) {
          console.error('❌ Erro ao buscar formulário:', fetchError);
          setError('Formulário não encontrado ou inativo');
          return;
        }

        if (!data) {
          setError('Formulário não encontrado');
          return;
        }

        console.log('✅ Formulário encontrado:', data);
        setForm(data);

        // Inicializar respostas com campos vazios
        const initialResponses: FormResponse = {};
        if (data.fields && typeof data.fields === 'object') {
          Object.keys(data.fields).forEach(key => {
            initialResponses[key] = '';
          });
        }
        setResponses(initialResponses);

      } catch (err) {
        console.error('❌ Erro crítico ao buscar formulário:', err);
        setError('Erro ao carregar formulário. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  const handleInputChange = (fieldKey: string, value: string | string[]) => {
    setResponses(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleCheckboxChange = (fieldKey: string, option: string, checked: boolean) => {
    setResponses(prev => {
      const currentValues = Array.isArray(prev[fieldKey]) ? prev[fieldKey] as string[] : [];
      
      if (checked) {
        return {
          ...prev,
          [fieldKey]: [...currentValues, option]
        };
      } else {
        return {
          ...prev,
          [fieldKey]: currentValues.filter(val => val !== option)
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form || !id) return;

    // Validação personalizada para campos obrigatórios
    const requiredFields = Object.entries(form.fields).filter(([_, fieldConfig]) => {
      const config = typeof fieldConfig === 'string' 
        ? { required: true } 
        : fieldConfig;
      return config.required !== false;
    });

    for (const [fieldKey, fieldConfig] of requiredFields) {
      const config = typeof fieldConfig === 'string' 
        ? { type: 'text', required: true, label: fieldConfig } 
        : fieldConfig as FormFieldConfig;
      
      const value = responses[fieldKey];
      
      // Validar campos vazios
      if (!value || 
          (typeof value === 'string' && value.trim() === '') ||
          (Array.isArray(value) && value.length === 0)) {
        
        const label = config.label || fieldKey;
        toast.error(`O campo "${label}" é obrigatório.`);
        return;
      }
    }

    setSubmitting(true);
    
    try {
      console.log('📤 Enviando resposta do formulário:', responses);
      
      const { error: submitError } = await supabase
        .from('form_responses')
        .insert([{
          form_id: id,
          response: responses,
          submitted_at: new Date().toISOString()
        }]);

      if (submitError) {
        console.error('❌ Erro ao enviar resposta:', submitError);
        toast.error('Erro ao enviar formulário. Tente novamente.');
        return;
      }

      console.log('✅ Resposta enviada com sucesso!');
      setSubmitted(true);
      toast.success('Formulário enviado com sucesso!');

      // Redirecionar se houver URL de redirecionamento
      if (form.redirect_url) {
        setTimeout(() => {
          window.location.href = form.redirect_url!;
        }, 2000);
      }

    } catch (err) {
      console.error('❌ Erro crítico ao enviar formulário:', err);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pharmacy-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Formulário não encontrado</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-pharmacy-accent hover:bg-pharmacy-accent/90"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Obrigado!</h2>
            <p className="text-gray-600 mb-4">Seu formulário foi enviado com sucesso.</p>
            {form?.redirect_url && (
              <p className="text-sm text-gray-500">
                Você será redirecionado automaticamente em alguns segundos...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  const renderField = (fieldKey: string, fieldValue: FormFieldConfig | string) => {
    const value = responses[fieldKey] || '';
    
    // Se fieldValue é uma string, usar como label
    // Se é um objeto, pode ter type, label, placeholder, etc.
    const fieldConfig = typeof fieldValue === 'string' 
      ? { label: fieldValue, type: 'text', placeholder: '', required: true }
      : { ...fieldValue, placeholder: fieldValue.placeholder || '', required: fieldValue.required !== false };

    const label = fieldConfig.label || fieldKey;
    const type = fieldConfig.type || 'text';
    const placeholder = fieldConfig.placeholder || `Digite ${label.toLowerCase()}`;
    const required = fieldConfig.required !== false; // Default para true
    const options = fieldConfig.options || [];

    // Campo de data
    if (type === 'date') {
      return (
        <div key={fieldKey} className="space-y-2">
          <Label htmlFor={fieldKey} className="text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={fieldKey}
            type="date"
            value={value as string}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            required={required}
            className="bg-white border-gray-300"
          />
        </div>
      );
    }

    // Campo de seleção (dropdown)
    if (type === 'select') {
      return (
        <div key={fieldKey} className="space-y-2">
          <Label htmlFor={fieldKey} className="text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Select value={value as string} onValueChange={(val) => handleInputChange(fieldKey, val)} required={required}>
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder={`Selecione ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Campo de múltipla escolha (radio)
    if (type === 'radio') {
      return (
        <div key={fieldKey} className="space-y-2">
          <Label className="text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <RadioGroup 
            value={value as string} 
            onValueChange={(val) => handleInputChange(fieldKey, val)}
            className="space-y-2"
            required={required}
          >
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${fieldKey}-${index}`} />
                <Label htmlFor={`${fieldKey}-${index}`} className="text-gray-700 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }

    // Campo de checkbox (múltiplas seleções)
    if (type === 'checkbox') {
      const selectedValues = Array.isArray(value) ? value : [];
      
      return (
        <div key={fieldKey} className="space-y-2">
          <Label className="text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${fieldKey}-${index}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(fieldKey, option, !!checked)}
                />
                <Label htmlFor={`${fieldKey}-${index}`} className="text-gray-700 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Campo de texto longo
    if (type === 'textarea') {
      return (
        <div key={fieldKey} className="space-y-2">
          <Label htmlFor={fieldKey} className="text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id={fieldKey}
            value={value as string}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            placeholder={placeholder}
            required={required}
            className="bg-white border-gray-300"
            rows={4}
          />
        </div>
      );
    }

    // Campos de texto padrão (text, email, phone)
    return (
      <div key={fieldKey} className="space-y-2">
        <Label htmlFor={fieldKey} className="text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id={fieldKey}
          type={type === 'email' ? 'email' : type === 'phone' ? 'tel' : 'text'}
          value={value as string}
          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          required={required}
          className="bg-white border-gray-300"
        />
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ 
        backgroundColor: form.background_color || '#f9fafb',
        color: form.text_color || '#111827'
      }}
    >
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0" style={{ backgroundColor: 'white' }}>
          <CardHeader className="text-center pb-6">
            {/* Logo personalizado */}
            {form.logo_url && (
              <div className="mb-4">
                <img 
                  src={form.logo_url} 
                  alt="Logo" 
                  className="h-16 mx-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <CardTitle 
              className="text-2xl"
              style={{ color: form.text_color || '#111827' }}
            >
              {form.title}
            </CardTitle>
            <p 
              className="mt-2"
              style={{ color: form.text_color ? `${form.text_color}99` : '#6b7280' }}
            >
              Preencha os campos abaixo e envie suas informações.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields && typeof form.fields === 'object' && Object.keys(form.fields).length > 0 ? (
                Object.entries(form.fields).map(([key, value]) => renderField(key, value))
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Este formulário não possui campos configurados. Entre em contato com o administrador.
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={submitting || Object.keys(form.fields || {}).length === 0}
                  className="w-full text-white font-medium"
                  style={{ 
                    backgroundColor: form.accent_color || '#10b981',
                    borderColor: form.accent_color || '#10b981'
                  }}
                >
                  {submitting ? 'Enviando...' : 'Enviar Formulário'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicForm; 