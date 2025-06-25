import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
}

interface FormFieldConfig {
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
}

interface FormResponse {
  [key: string]: string;
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

  const handleInputChange = (fieldKey: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form || !id) return;

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
      ? { label: fieldValue, type: 'text' }
      : fieldValue;

    const label = fieldConfig.label || fieldKey;
    const type = fieldConfig.type || 'text';
    const placeholder = fieldConfig.placeholder || `Digite ${label.toLowerCase()}`;
    const required = fieldConfig.required !== false; // Default para true

    if (type === 'textarea') {
      return (
        <div key={fieldKey} className="space-y-2">
          <Label htmlFor={fieldKey} className="text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id={fieldKey}
            value={value}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            placeholder={placeholder}
            required={required}
            className="bg-white border-gray-300"
            rows={4}
          />
        </div>
      );
    }

    return (
      <div key={fieldKey} className="space-y-2">
        <Label htmlFor={fieldKey} className="text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id={fieldKey}
          type={type}
          value={value}
          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          required={required}
          className="bg-white border-gray-300"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-gray-900">{form.title}</CardTitle>
            <p className="text-gray-600 mt-2">
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
                  className="w-full bg-pharmacy-accent hover:bg-pharmacy-accent/90"
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