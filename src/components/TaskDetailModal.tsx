import { useState, useEffect } from 'react';
import { Task } from '../types';
import { useLocale } from '../hooks/useLocale';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

export default function TaskDetailModal({ task, isOpen, onClose, onUpdate }: TaskDetailModalProps) {
  const { t } = useLocale();
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setDeadline(task.deadline);
      setNotes(task.notes || '');
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [task, isOpen]);

  const handleSave = () => {
    if (task) {
      onUpdate(task.id, { deadline, notes });
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const renderNotes = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!isOpen || !task) return null;

  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className={`absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} 
      />
      
      <div 
        className={`relative w-full max-w-md bg-card rounded-2xl shadow-2xl p-6 transition-all duration-200 transform ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted
                     flex items-center justify-center text-muted-foreground
                     hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">{task.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('detail.subtitle')}</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('detail.deadline')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={deadline.split('T')[0] || ''}
                onChange={(e) => {
                  const time = deadline.split('T')[1] || '23:59';
                  setDeadline(e.target.value ? `${e.target.value}T${time}` : '');
                }}
                min={minDateTime.split('T')[0]}
                className="input-base"
              />
              <input
                type="time"
                value={deadline.split('T')[1] || ''}
                onChange={(e) => {
                  const date = deadline.split('T')[0] || minDateTime.split('T')[0];
                  setDeadline(e.target.value ? `${date}T${e.target.value}` : deadline);
                }}
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('detail.notes')} <span className="text-muted-foreground text-xs">{t('detail.notesHint')}</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('detail.notesPH')}
              className="input-base min-h-[100px] resize-none"
              rows={4}
            />
            {notes && (
              <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                <span className="text-muted-foreground text-xs block mb-1">{t('detail.preview')}</span>
                <div className="text-foreground whitespace-pre-wrap">
                  {renderNotes(notes)}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
            >
              {t('detail.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex-1"
            >
              {t('detail.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
