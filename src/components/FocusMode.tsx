import { useEffect, useState, useMemo } from 'react';
import { Task } from '../types';
import { useLocale } from '../hooks/useLocale';

interface FocusModeProps {
  isActive: boolean;
  tasks: Task[];
  onExit: () => void;
}

// 获取最紧急的任务
function getMostUrgentTask(tasks: Task[]): Task | null {
  if (tasks.length === 0) return null;

  const now = new Date().getTime();
  
  // 过滤掉已过期的任务
  const futureTasks = tasks.filter(task => new Date(task.deadline).getTime() > now);
  
  // 如果没有未来任务，返回最近过期的任务
  const tasksToSort = futureTasks.length > 0 ? futureTasks : tasks;

  // 排序：先按截止时间（越近越紧急），再按重要程度（high > medium > low/undefined）
  const importanceOrder: Record<string, number> = {
    high: 3,
    medium: 2,
    low: 1,
    undefined: 0,
  };

  const sorted = [...tasksToSort].sort((a, b) => {
    const timeA = new Date(a.deadline).getTime();
    const timeB = new Date(b.deadline).getTime();
    
    // 先按截止时间排序
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    
    // 截止时间相同时，按重要程度排序
    const impA = importanceOrder[a.importance || 'undefined'];
    const impB = importanceOrder[b.importance || 'undefined'];
    return impB - impA; // 重要程度高的排前面
  });

  return sorted[0] || null;
}

export default function FocusMode({ isActive, tasks, onExit }: FocusModeProps) {
  const { t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 获取最紧急的任务
  const task = useMemo(() => getMostUrgentTask(tasks), [tasks]);

  // 控制动画状态
  useEffect(() => {
    if (isActive) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isActive]);

  // 实时更新时间
  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isActive]);

  // 计算剩余时间
  const timeRemaining = useMemo(() => {
    if (!task) return null;
    
    const deadline = new Date(task.deadline);
    const diff = deadline.getTime() - currentTime.getTime();
    
    if (diff < 0) return { text: t('focus.overdue'), isOverdue: true, urgency: 'critical' as const };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    let urgency: 'critical' | 'warning' | 'normal' = 'normal';
    if (days === 0 && hours < 6) urgency = 'critical';
    else if (days < 2) urgency = 'warning';
    
    return { days, hours, minutes, seconds, isOverdue: false, urgency };
  }, [task, currentTime, t]);

  if (!isActive || !task) return null;

  // 根据紧急程度选择强调色
  const accentColors = {
    critical: 'text-red-500',
    warning: 'text-orange-500',
    normal: 'text-blue-500',
  };

  const accentBgColors = {
    critical: 'bg-red-50',
    warning: 'bg-orange-50',
    normal: 'bg-blue-50',
  };

  const urgency = timeRemaining?.urgency || 'normal';

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 cursor-pointer ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onExit}
      style={{
        background: 'rgba(248, 250, 252, 0.78)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* 装饰性元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full transition-all duration-1000 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
          style={{
            background: urgency === 'critical'
              ? 'radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%)'
              : urgency === 'warning'
                ? 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          }}
        />
      </div>
      
      {/* 主内容 */}
      <div className={`relative z-10 text-center px-6 max-w-2xl transform transition-all duration-700 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* 专注模式标签 */}
        <div className="mb-8">
          <span className={`inline-flex items-center gap-2 px-4 py-2 ${accentBgColors[urgency]} rounded-full text-slate-600 text-sm font-medium`}>
            <span className={`w-2 h-2 ${accentColors[urgency].replace('text-', 'bg-')} rounded-full animate-pulse`} />
            {t('focus.title')}
          </span>
        </div>
        
        {/* 任务标题 */}
        <h1 className={`text-3xl sm:text-5xl md:text-6xl font-bold mb-6 drop-shadow-sm leading-tight ${
          timeRemaining?.isOverdue ? 'text-red-600' : 'text-slate-800'
        }`}>
          {task.title}
        </h1>

        {/* 重要程度标签 */}
        {task.importance && (
          <div className="mb-6">
            <span 
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                task.importance === 'high' 
                  ? 'bg-red-100 text-red-700' 
                  : task.importance === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              {task.importance === 'high' ? t('task.high') : task.importance === 'medium' ? t('task.medium') : t('task.low')}
            </span>
          </div>
        )}
        
        {/* 倒计时显示 */}
        {timeRemaining && (
          <div className="mb-8">
            {timeRemaining.isOverdue ? (
              <div className="text-2xl sm:text-3xl font-medium">
                <p className="text-slate-500 text-lg mb-3">{t('focus.overdue')}</p>
                <span className="text-red-500">⚠️ {t('task.overdue')}</span>
              </div>
            ) : (
              <div>
                <p className="text-slate-500 text-lg mb-4">{t('focus.remaining')}</p>
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  {(timeRemaining.days ?? 0) > 0 && (
                    <>
                      <div className="text-center">
                        <div className="text-4xl sm:text-6xl md:text-7xl font-bold text-slate-800 tabular-nums font-mono">
                          {timeRemaining.days}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-400 mt-1">{t('focus.days')}</div>
                      </div>
                      <div className="text-3xl sm:text-4xl text-slate-300 font-light self-start mt-3">:</div>
                    </>
                  )}
                  <div className="text-center">
                    <div className="text-4xl sm:text-6xl md:text-7xl font-bold text-slate-800 tabular-nums font-mono">
                      {String(timeRemaining.hours).padStart(2, '0')}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400 mt-1">{t('focus.hours')}</div>
                  </div>
                  <div className="text-3xl sm:text-4xl text-slate-300 font-light self-start mt-3 animate-pulse">:</div>
                  <div className="text-center">
                    <div className="text-4xl sm:text-6xl md:text-7xl font-bold text-slate-800 tabular-nums font-mono">
                      {String(timeRemaining.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400 mt-1">{t('focus.minutes')}</div>
                  </div>
                  <div className="text-3xl sm:text-4xl text-slate-300 font-light self-start mt-3 animate-pulse">:</div>
                  <div className="text-center">
                    <div className={`text-4xl sm:text-6xl md:text-7xl font-bold tabular-nums font-mono ${accentColors[urgency]}`}>
                      {String(timeRemaining.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400 mt-1">{t('focus.seconds')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 截止时间 */}
        <p className="text-slate-400 text-sm mb-4">
          {t('focus.deadline')}: {new Date(task.deadline).toLocaleString()}
        </p>
        
        {/* 备注信息 */}
        {task.notes && (
          <p className="text-base text-slate-500 max-w-md mx-auto mb-8 bg-slate-50 px-4 py-3 rounded-lg">
            {task.notes}
          </p>
        )}
        
        {/* 退出提示 */}
        <div className={`mt-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-slate-400 text-sm animate-pulse">{t('focus.exit')}</p>
        </div>
      </div>
    </div>
  );
}
