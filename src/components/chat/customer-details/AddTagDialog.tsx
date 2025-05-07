
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
      <DialogContent className="bg-pharmacy-dark2 text-white border-pharmacy-dark1">
        <DialogHeader>
          <DialogTitle className="text-pharmacy-green2">Adicionar Nova Tag</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="tag" className="text-white block mb-2">Nome da Tag</Label>
          <Input 
            id="tag" 
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="bg-pharmacy-dark1 border-pharmacy-green1 text-white"
            placeholder="Ex: hipertenso, idoso, etc."
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="bg-pharmacy-accent hover:bg-pharmacy-green1"
          >
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTagDialog;
