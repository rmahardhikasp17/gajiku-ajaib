import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const GOAL_ICONS = ['🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '🏥', '👶', '🎯', '💰', '🛒'];

interface AddSavingsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; targetAmount: number; deadline: string; icon: string }) => void;
}

const AddSavingsModal = ({ open, onClose, onSave }: AddSavingsModalProps) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('🎯');

  const handleSubmit = () => {
    if (!name || !target || !deadline) return;
    onSave({
      name,
      targetAmount: parseFloat(target),
      deadline: new Date(deadline).toISOString(),
      icon,
    });
    setName('');
    setTarget('');
    setDeadline('');
    setIcon('🎯');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Tambah Target Tabungan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Icon picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Ikon</Label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map(e => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`h-10 w-10 rounded-xl text-xl flex items-center justify-center transition-all border-2 ${icon === e ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/50 hover:bg-muted'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Nama Target</Label>
            <Input placeholder="Contoh: Dana Darurat" value={name} onChange={e => setName(e.target.value)} className="h-11" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Target (Rp)</Label>
            <Input type="number" placeholder="0" value={target} onChange={e => setTarget(e.target.value)} className="text-xl font-bold h-12" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Deadline</Label>
            <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="h-11" />
          </div>

          <Button onClick={handleSubmit} disabled={!name || !target || !deadline} className="w-full h-12 text-base font-semibold rounded-xl">
            Tambah Target
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSavingsModal;
