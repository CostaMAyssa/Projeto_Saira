import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label'; // Added Label
import { ScrollArea } from '@/components/ui/scroll-area'; // For potentially long JSON

// Define the FormData type (can be imported or defined locally if simpler for the subtask)
// This should match or be compatible with FormData in FormsModule.tsx
interface FormData {
  id: string;
  name: string;
  questions: number;
  responses: number; // Assuming this is available, if not, adjust
  status: 'active' | 'inactive';
  createdAt: string;
  lastResponse?: string; // Optional, as per FormsModule's FormData
  fields?: any;
  redirect_url?: string;
}

interface ViewFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormData | null;
}

const ViewFormModal: React.FC<ViewFormModalProps> = ({ open, onOpenChange, form }) => {
  if (!form) {
    return null;
  }

  const getStatusClass = (status: 'active' | 'inactive') => {
    return status === 'active' 
      ? "bg-green-100 text-green-700 border border-green-200" 
      : "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const fieldsString = form.fields ? JSON.stringify(form.fields, null, 2) : 'Nenhum campo definido.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-lg p-4 md:p-6 max-w-[95vw] md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-semibold text-gray-900">
            Detalhes do Formulário
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-3"> {/* Added ScrollArea */}
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Nome</Label>
              <p className="text-gray-900 mt-1">{form.name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Badge className={`mt-1 ${getStatusClass(form.status)}`}>
                  {form.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Criado em</Label>
                <p className="text-gray-900 mt-1">{form.createdAt}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Nº de Perguntas</Label>
                <p className="text-gray-900 mt-1">{form.questions}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Respostas</Label>
                <p className="text-gray-900 mt-1">{form.responses}</p> {/* Ensure form.responses is available */}
              </div>
            </div>

            {form.redirect_url && (
              <div>
                <Label className="text-sm font-medium text-gray-700">URL de Redirecionamento</Label>
                <p className="text-gray-900 mt-1 break-all">{form.redirect_url}</p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-gray-700">Campos do Formulário (JSON)</Label>
              <pre className="mt-1 p-2 bg-gray-50 rounded-md text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
                {fieldsString}
              </pre>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300 text-gray-700"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFormModal;
