import { useState, useRef, useCallback } from 'react';
import { Task } from '../types';
import { useLocale } from '../hooks/useLocale';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tasks: Omit<Task, 'id' | 'createdAt'>[]) => void;
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const { t } = useLocale();
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseRelativeTime = (text: string, now: Date): string => {
    const result = new Date(now);
    
    if (text.includes('明天')) {
      result.setDate(result.getDate() + 1);
    } else if (text.includes('后天')) {
      result.setDate(result.getDate() + 2);
    } else if (text.includes('下周')) {
      result.setDate(result.getDate() + 7);
    } else {
      const dayMatch = text.match(/(\d+)\s*天/);
      if (dayMatch) {
        result.setDate(result.getDate() + parseInt(dayMatch[1]));
      }
    }
    
    result.setHours(18, 0, 0, 0);
    return result.toISOString().slice(0, 16);
  };

  const parseFileContent = useCallback((content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const tasks: Omit<Task, 'id' | 'createdAt'>[] = [];
    const now = new Date();
    let failedCount = 0;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      
      try {
        const parts = trimmed.split('|').map(p => p.trim());
        
        let title = parts[0];
        if (!title) {
          failedCount++;
          return;
        }
        
        let deadline: string;
        let importance: 'low' | 'medium' | 'high' | undefined;
        let notes: string | undefined;
        
        if (parts.length >= 2 && parts[1]) {
          const deadlineDate = new Date(parts[1]);
          if (!isNaN(deadlineDate.getTime())) {
            deadline = deadlineDate.toISOString().slice(0, 16);
          } else {
            deadline = parseRelativeTime(parts[1], now);
          }
        } else {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(18, 0, 0, 0);
          deadline = tomorrow.toISOString().slice(0, 16);
        }
        
        if (parts.length >= 3 && ['low', 'medium', 'high', '低', '中', '高'].includes(parts[2])) {
          const impMap: Record<string, 'low' | 'medium' | 'high'> = {
            'low': 'low', '低': 'low',
            'medium': 'medium', '中': 'medium',
            'high': 'high', '高': 'high',
          };
          importance = impMap[parts[2]];
        }
        
        if (parts.length >= 4) {
          notes = parts[3];
        }
        
        tasks.push({
          title,
          deadline,
          importance,
          notes,
          x: -50 + (index % 2) * 100,
          y: 50,
        });
      } catch {
        failedCount++;
      }
    });
    
    return { tasks, failedCount };
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.txt')) {
      alert('Please select a .txt file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const { tasks, failedCount } = parseFileContent(content);
      
      if (tasks.length > 0) {
        onImport(tasks);
        setImportStatus({ success: tasks.length, failed: failedCount });
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 2000);
      } else {
        alert('No valid tasks found. Please check file format.');
      }
    };
    reader.readAsText(file);
  }, [parseFileContent, onImport, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in" />
      
      <div 
        className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted
                     flex items-center justify-center text-muted-foreground
                     hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <span>📥</span> {t('imp.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t('imp.subtitle')}</p>
        </div>

        {importStatus ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-lg font-medium text-foreground">{t('imp.success')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('imp.successCount', { n: importStatus.success })}
              {importStatus.failed > 0 && t('imp.failCount', { n: importStatus.failed })}
            </p>
          </div>
        ) : (
          <>
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-200
                ${isDragging 
                  ? 'border-primary bg-primary/10 scale-[1.02]' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              <div className="text-4xl mb-3">
                {isDragging ? '📂' : '📄'}
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragging ? t('imp.release') : t('imp.drop')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('imp.format')}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mt-6 p-4 bg-muted/50 rounded-xl">
              <p className="text-sm font-medium text-foreground mb-3">📋 {t('imp.guideTitle')}</p>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>{t('imp.guideDesc')} <code className="bg-muted px-1.5 py-0.5 rounded">|</code></p>
                <div className="bg-card p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <p className="text-foreground">{t('imp.guideExample')}</p>
                  <p className="text-muted-foreground">{t('imp.guideComment')}</p>
                  <p>完成报告|2026-02-10|高|需要提交给领导</p>
                  <p>买菜|明天|低|</p>
                  <p>开会|3天后|中|线上会议</p>
                  <p>简单任务</p>
                </div>
                <ul className="mt-3 space-y-1 list-disc list-inside">
                  <li><strong>{t('imp.fTitle')}</strong>：{t('imp.fTitleD')}</li>
                  <li><strong>{t('imp.fDeadline')}</strong>：{t('imp.fDeadlineD')}</li>
                  <li><strong>{t('imp.fImp')}</strong>：{t('imp.fImpD')}</li>
                  <li><strong>{t('imp.fNotes')}</strong>：{t('imp.fNotesD')}</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
