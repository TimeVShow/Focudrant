import { CompletedTask } from '../types';
import { useLocale } from '../hooks/useLocale';

interface CompletedTasksListProps {
  tasks: CompletedTask[];
  isOpen: boolean;
  onClose: () => void;
  onRestore: (id: string) => void;
}

export default function CompletedTasksList({ tasks, isOpen, onClose, onRestore }: CompletedTasksListProps) {
  const { t } = useLocale();

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('done.today');
    if (diffDays === 1) return t('done.yesterday');
    if (diffDays < 7) return t('done.daysAgo', { d: diffDays });
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in" />
      
      <div 
        className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-hidden flex flex-col animate-scale-in"
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

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <span>✅</span> {t('done.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t('done.subtitle')}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-3">📝</div>
              <p>{t('done.empty')}</p>
              <p className="text-sm mt-1">{t('done.emptyHint')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-muted/50 rounded-xl border border-border/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground line-through opacity-70">
                        {task.title}
                      </h3>
                      {task.notes && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {task.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(task.completedAt)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestore(task.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs bg-primary/10 text-primary rounded-lg
                                   hover:bg-primary/20 transition-all duration-150 whitespace-nowrap"
                        title={t('done.undo')}
                      >
                        {t('done.undo')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
