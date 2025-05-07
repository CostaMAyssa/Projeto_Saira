import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddTagDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAddTag: (tag: string) => void;
}

const AddTagDialog: React.FC<AddTagDialogProps> = ({ open, setOpen, onAddTag }) => {
  const [newTag, setNewTag] = useState('');
  
  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
      setOpen(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white text-pharmacy-text1 border-pharmacy-border1">
        <DialogHeader>
          <DialogTitle className="text-pharmacy-text1">Adicionar Nova Tag</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="tag" className="text-pharmacy-text1 block mb-2">Nome da Tag</Label>
          <Input 
            id="tag" 
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="bg-white border-pharmacy-border1 text-pharmacy-text1 focus-visible:ring-pharmacy-whatsapp-primary"
            placeholder="Ex: hipertenso, idoso, etc."
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="text-pharmacy-text2 border-pharmacy-border1 hover:bg-pharmacy-light2"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="bg-pharmacy-whatsapp-primary hover:bg-pharmacy-whatsapp-primary/90 text-white"
          >
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTagDialog;
