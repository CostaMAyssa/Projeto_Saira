import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagOption {
  value: string;
  label: string;
  color: string;
  __isNew__?: boolean;
}

interface CampaignTagsSelectorProps {
  selectedTags: TagOption[];
  onTagsChange: (tags: TagOption[]) => void;
}

const CampaignTagsSelector: React.FC<CampaignTagsSelectorProps> = ({
  selectedTags,
  onTagsChange
}) => {
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    fetchCampaignTags();
  }, []);

  const fetchCampaignTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, color')
        .eq('type', 'campaign')
        .order('name');

      if (error) throw error;

      if (data) {
        const tagOptions: TagOption[] = data.map((tag: Tag) => ({
          value: tag.id,
          label: tag.name,
          color: tag.color
        }));
        setAvailableTags(tagOptions);
      }
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      toast.error('Erro ao carregar tags disponíveis');
    }
  };

  const createNewTag = async (inputValue: string): Promise<TagOption> => {
    try {
      setIsLoading(true);
      
      // Gerar cor aleatória ou usar cor padrão
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#FF5722'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const { data, error } = await supabase
        .from('tags')
        .insert({
          name: inputValue,
          type: 'campaign',
          color: randomColor
        })
        .select()
        .single();

      if (error) throw error;

      const newTag: TagOption = {
        value: data.id,
        label: data.name,
        color: data.color
      };

      // Atualizar lista de tags disponíveis
      setAvailableTags(prev => [...prev, newTag]);
      
      toast.success(`Tag "${inputValue}" criada com sucesso!`);
      return newTag;
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      toast.error('Erro ao criar nova tag');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const newTag = await createNewTag(newTagName);
      const updatedTags = [...selectedTags, newTag];
      onTagsChange(updatedTags);
      setNewTagName('');
      setShowInput(false);
    } catch (error) {
      // Error already handled in createNewTag
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
              style={{ backgroundColor: tag.color + '20', color: tag.color === '#FFD700' ? '#000' : '#333' }}
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
                <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: tag.color }}
                />
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
          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nome da nova tag"
              className="h-8"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateNewTag();
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleCreateNewTag}
              disabled={!newTagName.trim() || isLoading}
              className="h-8"
            >
              {isLoading ? 'Criando...' : 'Criar'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowInput(false);
                setNewTagName('');
              }}
              className="h-8"
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-pharmacy-text2">
        Selecione tags existentes ou crie novas. As tags ajudam a segmentar e organizar suas campanhas.
      </p>
    </div>
  );
};

export default CampaignTagsSelector; 