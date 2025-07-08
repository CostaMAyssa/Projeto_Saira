import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
// import { supabase } from '@/lib/supabase'; // Não mais necessário
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Removida a interface Tag, pois não interagimos com uma tabela 'tags' separada.
// interface Tag {
//   id: string;
//   name: string;
//   color: string;
// }

interface TagOption {
  value: string; // O nome da tag será o valor e o label
  label: string;
  // color: string; // Cor será gerada dinamicamente ou fixada para exibição
  __isNew__?: boolean;
}

interface CampaignTagsSelectorProps {
  selectedTags: TagOption[];
  onTagsChange: (tags: TagOption[]) => void;
  allClientTags: string[]; // Nova prop para receber todas as tags dos clientes
  onNewTagAdded: (tagName: string) => void; // Callback para quando uma nova tag é adicionada
}

const CampaignTagsSelector: React.FC<CampaignTagsSelectorProps> = ({
  selectedTags,
  onTagsChange,
  allClientTags, // Desestruturar a nova prop
  onNewTagAdded // Desestruturar a nova prop
}) => {
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Manter o estado de loading para a criação de tags locais

  useEffect(() => {
    // Mapear as tags de clientes existentes para o formato TagOption
    const mappedTags: TagOption[] = allClientTags.map(tag => ({
      value: tag,
      label: tag,
      // color: '#D1D5DB' // Cor padrão para tags existentes
    }));
    setAvailableTags(mappedTags);
  }, [allClientTags]); // Re-executar quando allClientTags mudar

  // Função removida, pois não buscamos mais do Supabase
  // const fetchCampaignTags = async () => { ... };

  // Simplificada a criação de tags: agora apenas notifica o pai
  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return;
    
    setIsLoading(true);
    try {
      const newTagValue = newTagName.trim();
      const newTagOption: TagOption = { value: newTagValue, label: newTagValue, __isNew__: true };

      // Notifica o componente pai sobre a nova tag para que ele a persista ou gerencie globalmente.
      onNewTagAdded(newTagValue);

      // Adiciona a nova tag à lista de tags disponíveis localmente para seleção imediata
      setAvailableTags(prev => [...prev, newTagOption]);

      // Adiciona a nova tag às tags selecionadas imediatamente
      const updatedSelectedTags = [...selectedTags, newTagOption];
      onTagsChange(updatedSelectedTags);

      toast.success(`Tag "${newTagValue}" adicionada!`);
      setNewTagName('');
      setShowInput(false);
    } catch (error) {
      console.error('Erro ao adicionar nova tag localmente:', error);
      toast.error('Erro ao adicionar nova tag');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: TagOption) => {
    const isSelected = selectedTags.some(selected => selected.value === tag.value);
    
    if (isSelected) {
      const updatedTags = selectedTags.filter(selected => selected.value !== tag.value);
      onTagsChange(updatedTags);
    } else {
      const updatedTags = [...selectedTags, tag];
      onTagsChange(updatedTags);
    }
  };

  const removeTag = (tagToRemove: TagOption) => {
    const updatedTags = selectedTags.filter(tag => tag.value !== tagToRemove.value);
    onTagsChange(updatedTags);
  };

  return (
    <div className="space-y-3">
      <Label className="text-pharmacy-text1">Segmentar por Tags</Label>
      
      {/* Tags selecionadas */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.value}
              variant="secondary"
              className="px-2 py-1 text-sm"
              // Remover estilo de cor dinâmica, usar uma cor padrão para tags
              // style={{ backgroundColor: tag.color + '20', color: tag.color === '#FFD700' ? '#000' : '#333' }}
            >
              {tag.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tags disponíveis */}
      <div className="space-y-2">
        <div className="text-sm text-pharmacy-text2">Tags disponíveis:</div>
        <div className="flex flex-wrap gap-2">
          {availableTags
            .filter(tag => !selectedTags.some(selected => selected.value === tag.value))
            .map((tag) => (
              <Button
                key={tag.value}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => toggleTag(tag)}
              >
                {/* Remover círculo de cor dinâmica */}
                {/* <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: tag.color }}
                /> */}
                {tag.label}
              </Button>
            ))}
        </div>
      </div>

      {/* Criar nova tag */}
      <div className="space-y-2">
        {!showInput ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInput(true)}
            className="h-8"
          >
            <Plus className="h-3 w-3 mr-1" />
            Criar nova tag
          </Button>
        ) : (
          <div className="flex gap-2 items-center">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nome da nova tag"
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateNewTag();
                }
              }}
            />
            <Button onClick={handleCreateNewTag} disabled={isLoading || !newTagName.trim()}>
              Criar
            </Button>
            <Button variant="outline" onClick={() => setShowInput(false)}>Cancelar</Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Selecione tags existentes ou crie novas. As tags ajudam a segmentar e organizar suas campanhas.</p>
      </div>
    </div>
  );
};

export default CampaignTagsSelector; 