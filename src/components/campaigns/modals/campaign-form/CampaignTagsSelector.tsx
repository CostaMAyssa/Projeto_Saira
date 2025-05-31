import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'sonner';
import { StylesConfig, OptionProps, MultiValueProps } from 'react-select';
import '../../../../styles/react-select.css';

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

  const handleCreate = async (inputValue: string) => {
    try {
      const newTag = await createNewTag(inputValue);
      const updatedTags = [...selectedTags, newTag];
      onTagsChange(updatedTags);
    } catch (error) {
      // Error already handled in createNewTag
    }
  };

  const handleChange = (newValue: TagOption[] | null) => {
    onTagsChange(newValue || []);
  };

  const customStyles: StylesConfig<TagOption, true> = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'white',
      borderColor: '#e2e8f0',
      minHeight: '40px',
      '&:hover': {
        borderColor: '#e2e8f0'
      }
    }),
    multiValue: (provided, state) => ({
      ...provided,
      backgroundColor: state.data.color + '20',
      borderRadius: '6px'
    }),
    multiValueLabel: (provided, state) => ({
      ...provided,
      color: state.data.color === '#FFD700' ? '#000' : '#333',
      fontWeight: '500'
    }),
    multiValueRemove: (provided, state) => ({
      ...provided,
      color: state.data.color === '#FFD700' ? '#000' : '#666',
      ':hover': {
        backgroundColor: state.data.color + '40',
        color: state.data.color === '#FFD700' ? '#000' : '#333'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? state.data.color + '40'
        : state.isFocused 
          ? state.data.color + '20'
          : 'white',
      color: '#333'
    })
  };

  return (
    <div className="space-y-2">
      <Label className="text-pharmacy-text1">Segmentar por Tags</Label>
      <CreatableSelect
        isMulti
        value={selectedTags}
        onChange={handleChange}
        onCreateOption={handleCreate}
        options={availableTags}
        styles={customStyles}
        placeholder="Selecione ou crie tags para segmentação..."
        noOptionsMessage={() => "Nenhuma tag encontrada"}
        formatCreateLabel={(inputValue) => `Criar tag "${inputValue}"`}
        isDisabled={isLoading}
        isLoading={isLoading}
        className="react-select-container"
        classNamePrefix="react-select"
      />
      <p className="text-xs text-pharmacy-text2">
        Selecione tags existentes ou digite para criar novas. As tags ajudam a segmentar e organizar suas campanhas.
      </p>
    </div>
  );
};

export default CampaignTagsSelector; 