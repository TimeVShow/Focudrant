import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';

export interface UndoOperation {
  type: 'delete';
  ids: string[];
  tasks: Task[];
}

export function useUndo() {
  const [undoStack, setUndoStack] = useState<UndoOperation[]>([]);
  
  const addToUndoStack = (operation: UndoOperation) => {
    setUndoStack(prev => [...prev, operation]);
  };
  
  const canUndo = undoStack.length > 0;
  
  const performUndo = useCallback(() => {
    if (undoStack.length === 0) return null;
    
    const lastOperation = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    return lastOperation;
  }, [undoStack]);
  
  const clearUndoStack = () => {
    setUndoStack([]);
  };
  
  // 处理键盘事件 - Ctrl+Z 撤销
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return {
    addToUndoStack,
    canUndo,
    performUndo,
    clearUndoStack,
    undoStackSize: undoStack.length
  };
}