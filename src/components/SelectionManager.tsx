import { useState, useEffect } from 'react';
import { Task } from '../types';

interface SelectionManagerProps {
  tasks: Task[];
  selectedIds: string[];
  onSelectTask: (id: string) => void;
  onDeleteSelected: () => void;
  className?: string;
}

export default function SelectionManager({ 
  tasks, 
  selectedIds, 
  onSelectTask, 
  onDeleteSelected,
  className = '' 
}: SelectionManagerProps) {
  const [showSelection, setShowSelection] = useState(false);
  
  // 键盘快捷键：Ctrl+Shift+S 切换选择模式
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowSelection(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const clearSelection = () => {
    setShowSelection(false);
  };
  
  return (
    <div className={`absolute bottom-4 right-4 z-30 ${className}`}>
      <div className={`bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px] transition-all duration-200 ${
        showSelection ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-foreground">选择模式</h3>
          <button 
            onClick={clearSelection}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            取消
          </button>
        </div>
        
        <div className="text-xs text-muted-foreground mb-3">
          已选择 {selectedIds.length} 个事件
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onDeleteSelected}
            disabled={selectedIds.length === 0}
            className="flex-1 btn-destructive text-xs py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            删除选中
          </button>
        </div>
      </div>
      
      <button
        onClick={() => setShowSelection(!showSelection)}
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-button transition-all ${
          showSelection 
            ? 'bg-destructive text-white' 
            : 'bg-primary text-white hover:scale-110'
        }`}
        title={showSelection ? "退出选择模式" : "批量选择模式"}
      >
        {showSelection ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
    </div>
  );
}