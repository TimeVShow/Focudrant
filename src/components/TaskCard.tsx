import { Task } from '../types';
import { useMemo, useState, useRef } from 'react';
import { useLocale } from '../hooks/useLocale';

type QuadrantType = 'important' | 'urgent' | 'delegate' | 'later';

interface TaskCardProps {
  task: Task;
  index: number;
  totalTasks: number;
  quadrant: QuadrantType;
  isLeftQuadrant: boolean;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onTouchDragStart: (taskId: string) => void;
  onTouchDragEnd: (taskId: string, x: number, y: number) => void;
  onDelete: () => void;
  onComplete: () => void;
  onClick: () => void;
}

export default function TaskCard({ 
  task, 
  index,
  totalTasks,
  quadrant,
  isLeftQuadrant,
  onDragStart,
  onTouchDragStart,
  onTouchDragEnd,
  onDelete,
  onComplete,
  onClick
}: TaskCardProps) {
  const { t } = useLocale();
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 根据位置确定所在象限颜色
  const quadrantColor = useMemo(() => {
    switch (quadrant) {
      case 'important': return { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-600' };
      case 'urgent': return { border: 'border-red-300', bg: 'bg-red-50', text: 'text-red-600' };
      case 'delegate': return { border: 'border-orange-300', bg: 'bg-orange-50', text: 'text-orange-600' };
      default: return { border: 'border-gray-300', bg: 'bg-gray-50', text: 'text-gray-600' };
    }
  }, [quadrant]);

  // 计算剩余时间
  const timeRemaining = useMemo(() => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const diff = deadline.getTime() - now.getTime();
    
    if (diff < 0) return { text: t('task.overdue'), isOverdue: true, urgency: 'critical' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let urgency: 'critical' | 'warning' | 'normal' = 'normal';
    if (days === 0 && hours < 6) urgency = 'critical';
    else if (days < 2) urgency = 'warning';
    
    if (days > 0) return { text: t('task.dh', { d: days, h: hours }), isOverdue: false, urgency };
    if (hours > 0) return { text: t('task.hm', { h: hours, m: minutes }), isOverdue: false, urgency };
    return { text: t('task.m', { m: minutes }), isOverdue: false, urgency };
  }, [task.deadline, t]);

  const importanceLabel: Record<string, { text: string; className: string }> = {
    low: { text: t('task.low'), className: 'bg-gray-100 text-gray-600' },
    medium: { text: t('task.medium'), className: 'bg-yellow-100 text-yellow-700' },
    high: { text: t('task.high'), className: 'bg-red-100 text-red-600' },
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, task.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    
    // 长按启动拖拽
    longPressTimerRef.current = setTimeout(() => {
      setIsDragging(true);
      onTouchDragStart(task.id);
    }, 200);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !touchStartRef.current) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    if (isDragging && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      onTouchDragEnd(task.id, touch.clientX, touch.clientY);
    }
    
    setIsDragging(false);
    touchStartRef.current = null;
  };

  // 格式化截止时间显示
  const formattedDeadline = useMemo(() => {
    const date = new Date(task.deadline);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${mins}`;
  }, [task.deadline]);

  // 基于 ID 生成轻微的旋转角度（保持视觉趣味性）
  const rotation = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < task.id.length; i++) {
      hash = ((hash << 3) + task.id.charCodeAt(i)) & 0xFFFF;
    }
    return ((hash % 10) - 5) / 10; // -0.5 到 0.5 度，更轻微
  }, [task.id]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`
        relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg overflow-hidden
        ${quadrantColor.bg} ${quadrantColor.border} border
        cursor-grab select-none
        transition-all duration-150 ease-out
        ${isDragging ? 'opacity-50 scale-95 cursor-grabbing' : 'hover:shadow-md hover:-translate-y-0.5'}
        min-w-[200px] sm:min-w-[260px] max-w-[95%]
      `}
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'slideIn 0.2s ease-out forwards',
        transform: isDragging ? 'scale(0.95)' : `rotate(${rotation}deg)`,
      }}
    >
      {/* 单行布局：标题 + 时间 + 重要度 | 复选框固定右端 */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 可变内容区 */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 overflow-hidden">
          {/* 任务标题 */}
          <h3 className={`task-title font-medium text-xs sm:text-sm ${quadrantColor.text} truncate shrink min-w-[3em]`}>
            {task.title}
          </h3>
          
          {/* 截止时间 */}
          <span className={`
            text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 font-default whitespace-nowrap shrink-0
            ${timeRemaining.isOverdue 
              ? 'bg-red-100 text-red-600 font-medium' 
              : timeRemaining.urgency === 'critical'
                ? 'bg-red-50 text-red-500'
                : timeRemaining.urgency === 'warning'
                  ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-white/80 text-gray-500'}
          `}>
            <span className="text-[8px]">{timeRemaining.isOverdue ? '⚠' : '⏰'}</span>
            <span>{timeRemaining.text}</span>
            <span className="opacity-60 hidden sm:inline">({formattedDeadline})</span>
          </span>
          
          {/* 重要程度 */}
          {task.importance && (
            <span className={`text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-default whitespace-nowrap shrink-0 ${importanceLabel[task.importance].className}`}>
              {importanceLabel[task.importance].text}
            </span>
          )}
        </div>
        
        {/* 选择复选框 - 固定在右端 */}
        <input
          type="checkbox"
          onChange={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      {/* 删除按钮 - 保持在右上角 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white
                   flex items-center justify-center text-xs font-bold
                   opacity-0 hover:opacity-100 transition-opacity duration-150
                   hover:bg-red-600 shadow-sm z-10"
        onMouseDown={(e) => e.stopPropagation()}
      >
        ×
      </button>
    </div>
  );
}
