import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';
import { useUndo, UndoOperation } from '../hooks/useUndo';

interface BatchDeleteManagerProps {
  tasks: Task[];
  onDelete: (ids: string[], addUndoOp: (op: UndoOperation) => void) => void;
  onUndo: (operation: UndoOperation) => void;
  canUndo: boolean;
  className?: string;
}

export default function BatchDeleteManager({ 
  tasks, 
  onDelete, 
  onUndo,
  canUndo,
  className = '' 
}: BatchDeleteManagerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSelection, setShowSelection] = useState(false);
  
  // 处理键盘事件 - Ctrl+Z 撤销
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (canUndo) {
          handleUndo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo]);
  
  const toggleTaskSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(taskId => taskId !== id) 
        : [...prev, id]
    );
  };
  
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    
    // 保存要删除的任务副本用于撤销
    const deletedTasks = tasks.filter(task => selectedIds.includes(task.id));
    
    // 执行删除（通过回调函数传递撤销操作）
    onDelete(selectedIds, (op) => {
      // 这里我们可以添加撤销操作到栈中，但实际上由父组件管理
    });
    
    // 清除选择
    setSelectedIds([]);
    setShowSelection(false);
  };
  
  const handleUndo = () => {
    if (canUndo) {
      // 创建一个虚拟的撤销操作对象
      const mockOperation: UndoOperation = {
        type: 'delete',
        ids: [], // 实际的ID由父组件管理
        tasks: [] // 实际的任务由父组件管理
      };
      onUndo(mockOperation);
    }
  };
  
  const clearSelection = () => {
    setSelectedIds([]);
    setShowSelection(false);
  };
  
  return (
    <div className={`absolute bottom-4 right-4 z-30 ${className}`}>
      <div className={`bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px] transition-all duration-200 ${
        showSelection ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-foreground">批量操作</h3>
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
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className="flex-1 btn-destructive text-xs py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            删除选中
          </button>
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="btn-secondary text-xs py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            撤销
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