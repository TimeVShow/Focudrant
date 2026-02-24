import { useState, useEffect, useCallback } from 'react';
import { Task, CompletedTask } from '../types';

const STORAGE_KEY = 'quadrant-tasks';
const COMPLETED_STORAGE_KEY = 'quadrant-completed-tasks';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_TASKS = 100;

export function useLocalStorage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 清理超过7天的已完成任务
  const cleanOldCompletedTasks = useCallback((tasks: CompletedTask[]) => {
    const now = Date.now();
    return tasks.filter(task => {
      const completedTime = new Date(task.completedAt).getTime();
      return now - completedTime < SEVEN_DAYS_MS;
    });
  }, []);

  // 从 localStorage 加载数据
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTasks(parsed);
      }
      
      const completedStored = localStorage.getItem(COMPLETED_STORAGE_KEY);
      if (completedStored) {
        const parsed = JSON.parse(completedStored);
        const cleaned = cleanOldCompletedTasks(parsed);
        setCompletedTasks(cleaned);
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);
    }
    setIsLoaded(true);
  }, [cleanOldCompletedTasks]);

  // 保存到 localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks to localStorage:', error);
      }
    }
  }, [tasks, isLoaded]);

  // 保存已完成任务到 localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(completedTasks));
      } catch (error) {
        console.error('Failed to save completed tasks to localStorage:', error);
      }
    }
  }, [completedTasks, isLoaded]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>): { success: boolean; task?: Task } => {
    // 检查任务数量限制
    if (tasks.length >= MAX_TASKS) {
      return { success: false };
    }
    
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
    return { success: true, task: newTask };
  }, [tasks.length]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const clearExpiredTasks = useCallback(() => {
    const now = new Date().getTime();
    setTasks(prev => prev.filter(task => new Date(task.deadline).getTime() > now));
  }, []);

  const completeTask = useCallback((id: string) => {
    const taskToComplete = tasks.find(t => t.id === id);
    if (taskToComplete) {
      const completedTask: CompletedTask = {
        ...taskToComplete,
        completedAt: new Date().toISOString(),
      };
      setCompletedTasks(prev => [completedTask, ...prev]);
      setTasks(prev => prev.filter(task => task.id !== id));
      return completedTask;
    }
    return null;
  }, [tasks]);

  // 撤销完成任务（恢复到任务列表）
  const restoreTask = useCallback((id: string): { success: boolean; task?: Task } => {
    // 检查任务数量限制
    if (tasks.length >= MAX_TASKS) {
      return { success: false };
    }
    
    const taskToRestore = completedTasks.find(t => t.id === id);
    if (taskToRestore) {
      const { completedAt, ...restoredTask } = taskToRestore;
      setTasks(prev => [...prev, restoredTask]);
      setCompletedTasks(prev => prev.filter(task => task.id !== id));
      return { success: true, task: restoredTask };
    }
    return { success: false };
  }, [completedTasks, tasks.length]);

  // 批量添加任务（用于导入功能）
  const addTasks = useCallback((newTasks: Omit<Task, 'id' | 'createdAt'>[]): { success: boolean; added: number; exceeded: boolean } => {
    const currentCount = tasks.length;
    const remainingSlots = MAX_TASKS - currentCount;
    
    // 如果导入后会超过限制
    if (currentCount + newTasks.length > MAX_TASKS) {
      return { success: false, added: 0, exceeded: true };
    }
    
    const tasksWithIds = newTasks.map(task => ({
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }));
    setTasks(prev => [...prev, ...tasksWithIds]);
    return { success: true, added: tasksWithIds.length, exceeded: false };
  }, [tasks.length]);

  const updateTaskPosition = useCallback((id: string, x: number, y: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, x, y } : task
      )
    );
  }, []);

  return {
    tasks,
    completedTasks,
    isLoaded,
    addTask,
    addTasks,
    updateTask,
    deleteTask,
    clearExpiredTasks,
    completeTask,
    restoreTask,
    updateTaskPosition,
  };
}
