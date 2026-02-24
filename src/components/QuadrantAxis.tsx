import { useState, useMemo, useRef, useCallback, ReactNode } from 'react';
import { Task } from '../types';
import { useLocale } from '../hooks/useLocale';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import TaskDetailModal from './TaskDetailModal';

interface QuadrantAxisProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onDeleteTask: (id: string) => void;
  onCompleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  menuSlot?: ReactNode;
}

type QuadrantType = 'important' | 'urgent' | 'delegate' | 'later';

export default function QuadrantAxis({ 
  tasks, 
  onAddTask, 
  onUpdatePosition,
  onDeleteTask,
  onCompleteTask,
  onUpdateTask,
  menuSlot
}: QuadrantAxisProps) {
  const { t } = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<QuadrantType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingTaskIdRef = useRef<string | null>(null);

  // 计算任务的紧急度分数（越小越紧急）
  const getUrgencyScore = useCallback((task: Task) => {
    const now = new Date().getTime();
    const deadline = new Date(task.deadline).getTime();
    return deadline - now; // 毫秒数，越小表示越紧急
  }, []);

  // 根据象限和截止时间对任务进行分组和排序，计算动态位置
  const sortedTasksByQuadrant = useMemo(() => {
    const quadrants: Record<QuadrantType, (Task & { positionX: number; positionY: number })[]> = {
      important: [], // 左上 - 重要不紧急
      urgent: [],    // 右上 - 重要紧急
      later: [],     // 左下 - 不重要不紧急
      delegate: [],  // 右下 - 紧急不重要
    };

    tasks.forEach(task => {
      if (task.y >= 0 && task.x < 0) quadrants.important.push({ ...task, positionX: 0, positionY: 0 });
      else if (task.y >= 0 && task.x >= 0) quadrants.urgent.push({ ...task, positionX: 0, positionY: 0 });
      else if (task.y < 0 && task.x < 0) quadrants.later.push({ ...task, positionX: 0, positionY: 0 });
      else quadrants.delegate.push({ ...task, positionX: 0, positionY: 0 });
    });

    // 对每个象限的任务按截止时间排序并计算位置
    Object.keys(quadrants).forEach(key => {
      const quadrant = key as QuadrantType;
      const quadrantTasks = quadrants[quadrant];
      
      // 按截止时间排序（越早越靠前）
      quadrantTasks.sort((a, b) => 
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );

      // 获取紧急度分数用于Y轴定位
      const urgencyScores = quadrantTasks.map(t => getUrgencyScore(t));
      const minUrgency = Math.min(...urgencyScores);
      const maxUrgency = Math.max(...urgencyScores);
      const urgencyRange = maxUrgency - minUrgency || 1;

      // 计算每个任务的位置
      const isRightQuadrant = quadrant === 'urgent' || quadrant === 'delegate';
      const isTopQuadrant = quadrant === 'important' || quadrant === 'urgent';

      quadrantTasks.forEach((task, index) => {
        // X轴位置：截止日期越近越靠近Y轴（中心）
        // 使用index（已按截止日期排序）来计算X偏移
        // 左侧象限(important/later)：index越小，right值越小（更靠右，即靠近Y轴）
        // 右侧象限(urgent/delegate)：index越小，left值越小（更靠左，即靠近Y轴）
        const xOffset = index * 8; // 每个任务错开8px
        task.positionX = xOffset;

        // Y轴位置：紧急度越高（分数越小）越靠近X轴（中心）
        const urgency = getUrgencyScore(task);
        const normalizedUrgency = (urgency - minUrgency) / urgencyRange; // 0-1，0表示最紧急
        
        // 上方象限(important/urgent)：最紧急的bottom值最小（靠近X轴）
        // 下方象限(later/delegate)：最紧急的top值最小（靠近X轴）
        // 同时考虑错开，防止完全重叠
        const baseYOffset = normalizedUrgency * 60; // 基于紧急度的Y偏移（0-60%）
        const stackOffset = index * 56; // 每个任务堆叠偏移（卡片高度约52px + 间距）
        task.positionY = baseYOffset + stackOffset;
      });
    });

    return quadrants;
  }, [tasks, getUrgencyScore]);

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 处理拖拽经过
  const handleDragOver = (e: React.DragEvent, quadrant: QuadrantType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverQuadrant(quadrant);
  };

  // 处理拖拽离开
  const handleDragLeave = () => {
    setDragOverQuadrant(null);
  };

  // 处理放置
  const handleDrop = (e: React.DragEvent, quadrant: QuadrantType) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    // 根据象限设置新的 x, y 值
    let newX: number, newY: number;
    switch (quadrant) {
      case 'important': // 左上
        newX = -50;
        newY = 50;
        break;
      case 'urgent': // 右上
        newX = 50;
        newY = 50;
        break;
      case 'later': // 左下
        newX = -50;
        newY = -50;
        break;
      case 'delegate': // 右下
        newX = 50;
        newY = -50;
        break;
    }
    
    onUpdatePosition(taskId, newX, newY);
    setDragOverQuadrant(null);
  };

  // 触摸拖拽处理
  const handleTouchDragStart = useCallback((taskId: string) => {
    draggingTaskIdRef.current = taskId;
  }, []);

  const handleTouchDragEnd = useCallback((taskId: string, clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 根据触摸结束位置确定象限
    const isRight = clientX >= centerX;
    const isTop = clientY <= centerY;
    
    let newX: number, newY: number;
    
    if (isTop && !isRight) {
      // 左上 - important
      newX = -50;
      newY = 50;
    } else if (isTop && isRight) {
      // 右上 - urgent
      newX = 50;
      newY = 50;
    } else if (!isTop && !isRight) {
      // 左下 - later
      newX = -50;
      newY = -50;
    } else {
      // 右下 - delegate
      newX = 50;
      newY = -50;
    }
    
    onUpdatePosition(taskId, newX, newY);
    draggingTaskIdRef.current = null;
  }, [onUpdatePosition]);

  // 渲染象限内容 - 实现坐标轴对称布局
  // Q1(右上)与Q4(右下)关于X轴对称
  // Q1(右上)与Q2(左上)关于Y轴对称
  // 所有事件起始位置靠近原点
  // 只有同一象限内的事务才需要错开，错开距离根据截止时间差计算
  const renderQuadrantTasks = (quadrant: QuadrantType) => {
    const quadrantTasks = sortedTasksByQuadrant[quadrant];
    
    const isRightQuadrant = quadrant === 'urgent' || quadrant === 'delegate';
    const isTopQuadrant = quadrant === 'important' || quadrant === 'urgent';
    const isLeftQuadrant = quadrant === 'important' || quadrant === 'later';
    
    // 对称布局规则：
    // Q1(右上/urgent): 任务靠左下角（原点方向）-> flex-col-reverse items-start
    // Q2(左上/important): 任务靠右下角（原点方向）-> flex-col-reverse items-end  
    // Q3(左下/later): 任务靠右上角（原点方向）-> flex-col items-end
    // Q4(右下/delegate): 任务靠左上角（原点方向）-> flex-col items-start
    
    // X方向对齐：左侧象限靠右(items-end)，右侧象限靠左(items-start)
    const alignClass = isLeftQuadrant ? 'items-end' : 'items-start';
    // Y方向对齐：上方象限从下往上(flex-col-reverse)，下方象限从上往下(flex-col)
    const flexDirection = isTopQuadrant ? 'flex-col-reverse' : 'flex-col';
    
    // 计算累积偏移量（基于截止时间差）
    const calculateCumulativeOffset = (index: number): number => {
      if (index === 0) return 0;
      
      let totalOffset = 0;
      const MIN_OFFSET = 24; // 最小错开距离24px
      const MAX_OFFSET = 80; // 最大错开距离80px
      const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 一天的毫秒数
      
      for (let i = 1; i <= index; i++) {
        const prevTask = quadrantTasks[i - 1];
        const currTask = quadrantTasks[i];
        const prevDeadline = new Date(prevTask.deadline).getTime();
        const currDeadline = new Date(currTask.deadline).getTime();
        const timeDiff = Math.abs(currDeadline - prevDeadline);
        
        // 根据时间差计算错开距离：每天差距增加8px，最小24px，最大80px
        const daysDiff = timeDiff / ONE_DAY_MS;
        const offset = Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, MIN_OFFSET + daysDiff * 8));
        totalOffset += offset;
      }
      
      return totalOffset;
    };
    
    return (
      <div className={`flex ${flexDirection} ${alignClass} gap-2 h-full w-full overflow-y-auto p-2 sm:p-3`}>
        {quadrantTasks.map((task, index) => {
          // 根据截止时间差计算累积偏移量
          const xOffset = calculateCumulativeOffset(index);
          
          const style: React.CSSProperties = {
            // 左侧象限用marginRight（右边缘靠近Y轴），右侧象限用marginLeft（左边缘靠近Y轴）
            marginLeft: isRightQuadrant && xOffset > 0 ? `${xOffset}px` : undefined,
            marginRight: isLeftQuadrant && xOffset > 0 ? `${xOffset}px` : undefined,
          };
          
          return (
            <div key={task.id} style={style}>
              <TaskCard
                task={task}
                index={index}
                totalTasks={quadrantTasks.length}
                quadrant={quadrant}
                isLeftQuadrant={isLeftQuadrant}
                onDragStart={handleDragStart}
                onTouchDragStart={handleTouchDragStart}
                onTouchDragEnd={handleTouchDragEnd}
                onDelete={() => onDeleteTask(task.id)}
                onComplete={() => onCompleteTask(task.id)}
                onClick={() => {
                  setSelectedTask(task);
                  setIsDetailModalOpen(true);
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const quadrantConfig = {
    important: {
      label: t('q.important.label'),
      sublabel: t('q.important.sub'),
      colorClass: 'text-quadrant-important',
      bgClass: 'bg-quadrant-important/5',
      labelBg: 'bg-quadrant-important/10',
      hoverBg: 'bg-quadrant-important/15',
    },
    urgent: {
      label: t('q.urgent.label'),
      sublabel: t('q.urgent.sub'),
      colorClass: 'text-quadrant-urgent',
      bgClass: 'bg-quadrant-urgent/5',
      labelBg: 'bg-quadrant-urgent/10',
      hoverBg: 'bg-quadrant-urgent/15',
    },
    later: {
      label: t('q.later.label'),
      sublabel: t('q.later.sub'),
      colorClass: 'text-quadrant-later',
      bgClass: 'bg-quadrant-later/5',
      labelBg: 'bg-quadrant-later/10',
      hoverBg: 'bg-quadrant-later/15',
    },
    delegate: {
      label: t('q.delegate.label'),
      sublabel: t('q.delegate.sub'),
      colorClass: 'text-quadrant-delegate',
      bgClass: 'bg-quadrant-delegate/5',
      labelBg: 'bg-quadrant-delegate/10',
      hoverBg: 'bg-quadrant-delegate/15',
    },
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full"
    >
      {/* 四象限网格 */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        {/* 第二象限 - 重要不紧急 (左上) */}
        <div 
          className={`relative flex flex-col border-r-2 border-b-2 border-dashed border-[hsl(var(--axis-color))] transition-colors duration-200 ${
            dragOverQuadrant === 'important' ? quadrantConfig.important.hoverBg : quadrantConfig.important.bgClass
          }`}
          onDragOver={(e) => handleDragOver(e, 'important')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'important')}
        >
          <div className={`p-2 sm:p-3 ${quadrantConfig.important.colorClass}/70 text-xs sm:text-sm font-medium shrink-0`}>
            <div className="flex items-center gap-2">
              <span className={`${quadrantConfig.important.labelBg} px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg`}>
                {quadrantConfig.important.label}
              </span>
              {menuSlot}
            </div>
            <p className="mt-1 text-[10px] sm:text-xs opacity-70 hidden sm:block">{quadrantConfig.important.sublabel}</p>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderQuadrantTasks('important')}
          </div>
        </div>

        {/* 第一象限 - 重要紧急 (右上) */}
        <div 
          className={`relative flex flex-col border-b-2 border-dashed border-[hsl(var(--axis-color))] transition-colors duration-200 ${
            dragOverQuadrant === 'urgent' ? quadrantConfig.urgent.hoverBg : quadrantConfig.urgent.bgClass
          }`}
          onDragOver={(e) => handleDragOver(e, 'urgent')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'urgent')}
        >
          <div className={`p-2 sm:p-3 text-right ${quadrantConfig.urgent.colorClass}/70 text-xs sm:text-sm font-medium shrink-0`}>
            <span className={`${quadrantConfig.urgent.labelBg} px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg`}>
              {quadrantConfig.urgent.label}
            </span>
            <p className="mt-1 text-[10px] sm:text-xs opacity-70 hidden sm:block">{quadrantConfig.urgent.sublabel}</p>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderQuadrantTasks('urgent')}
          </div>
        </div>

        {/* 第三象限 - 不重要不紧急 (左下) */}
        <div 
          className={`relative flex flex-col border-r-2 border-dashed border-[hsl(var(--axis-color))] transition-colors duration-200 ${
            dragOverQuadrant === 'later' ? quadrantConfig.later.hoverBg : quadrantConfig.later.bgClass
          }`}
          onDragOver={(e) => handleDragOver(e, 'later')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'later')}
        >
          <div className="flex-1 overflow-hidden">
            {renderQuadrantTasks('later')}
          </div>
          <div className={`p-2 sm:p-3 ${quadrantConfig.later.colorClass}/70 text-xs sm:text-sm font-medium shrink-0`}>
            <span className={`${quadrantConfig.later.labelBg} px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg`}>
              {quadrantConfig.later.label}
            </span>
            <p className="mt-1 text-[10px] sm:text-xs opacity-70 hidden sm:block">{quadrantConfig.later.sublabel}</p>
          </div>
        </div>

        {/* 第四象限 - 紧急不重要 (右下) */}
        <div 
          className={`relative flex flex-col transition-colors duration-200 ${
            dragOverQuadrant === 'delegate' ? quadrantConfig.delegate.hoverBg : quadrantConfig.delegate.bgClass
          }`}
          onDragOver={(e) => handleDragOver(e, 'delegate')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'delegate')}
        >
          <div className="flex-1 overflow-hidden">
            {renderQuadrantTasks('delegate')}
          </div>
          <div className={`p-2 sm:p-3 text-right ${quadrantConfig.delegate.colorClass}/70 text-xs sm:text-sm font-medium shrink-0`}>
            <span className={`${quadrantConfig.delegate.labelBg} px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg`}>
              {quadrantConfig.delegate.label}
            </span>
            <p className="mt-1 text-[10px] sm:text-xs opacity-70 hidden sm:block">{quadrantConfig.delegate.sublabel}</p>
          </div>
        </div>
      </div>

      {/* 坐标轴标签 */}
      <div className="absolute left-1/2 top-1 sm:top-2 -translate-x-1/2 text-[10px] sm:text-xs text-muted-foreground font-medium">
        {t('axis.up')}
      </div>
      <div className="absolute left-1/2 bottom-1 sm:bottom-2 -translate-x-1/2 text-[10px] sm:text-xs text-muted-foreground font-medium">
        {t('axis.down')}
      </div>
      <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground font-medium">
        {t('axis.right')}
      </div>
      <div className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground font-medium">
        {t('axis.left')}
      </div>

      {/* 原点添加按钮 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20
                   w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-white shadow-button
                   flex items-center justify-center
                   hover:scale-110 hover:shadow-lg active:scale-95
                   transition-all duration-150 group"
      >
        <svg 
          className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-150 group-hover:rotate-90" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 添加任务弹窗 */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={onAddTask}
      />

      {/* 任务详情弹窗 */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
        onUpdate={onUpdateTask}
      />
    </div>
  );
}
