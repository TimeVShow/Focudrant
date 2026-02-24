import { useEffect, useState, useMemo } from 'react';
import { Task } from '../types';

interface FocusModeProps {
  isActive: boolean;
  task: Task | null;
  onExit: () => void;
}

export default function FocusMode({ isActive, task, onExit }: FocusModeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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
    
    if (diff < 0) return { text: '已过期', isOverdue: true, urgency: 'critical' as const };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    let urgency: 'critical' | 'warning' | 'normal' = 'normal';
    if (days === 0 && hours < 6) urgency = 'critical';
    else if (days < 2) urgency = 'warning';
    
    return { days, hours, minutes, seconds, isOverdue: false, urgency };
  }, [task, currentTime]);

  if (!isActive || !task) return null;

  const urgencyColors = {
    critical: 'from-red-500 to-orange-500',
    warning: 'from-orange-400 to-yellow-500',
    normal: 'from-blue-500 to-indigo-500',
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onExit}
    >
      {/* 背景 - 优雅的渐变模糊 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${urgencyColors[timeRemaining?.urgency || 'normal']} opacity-90`} />
      <div className="absolute inset-0 backdrop-blur-xl" />
      
      {/* 装饰性元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* 主内容 */}
      <div className={`relative z-10 text-center px-6 transform transition-all duration-700 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* 专注模式标签 */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white/90 text-sm font-medium">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            专注模式
          </span>
        </div>
        
        {/* 任务标题 */}
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
          {task.title}
        </h1>
        
        {/* 倒计时显示 */}
        {timeRemaining && (
          <div className="mb-8">
            {timeRemaining.isOverdue ? (
              <div className="text-2xl sm:text-3xl font-medium text-white/90">
                <span className="text-yellow-200">⚠️ 已过期</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                {timeRemaining.days > 0 && (
                  <div className="text-center">
                    <div className="text-5xl sm:text-7xl font-bold text-white tabular-nums">
                      {timeRemaining.days}
                    </div>
                    <div className="text-sm sm:text-base text-white/70 mt-1">天</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-5xl sm:text-7xl font-bold text-white tabular-nums">
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </div>
                  <div className="text-sm sm:text-base text-white/70 mt-1">小时</div>
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-white/50">:</div>
                <div className="text-center">
                  <div className="text-5xl sm:text-7xl font-bold text-white tabular-nums">
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-sm sm:text-base text-white/70 mt-1">分钟</div>
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-white/50">:</div>
                <div className="text-center">
                  <div className="text-5xl sm:text-7xl font-bold text-white tabular-nums">
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-sm sm:text-base text-white/70 mt-1">秒</div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 备注信息 */}
        {task.notes && (
          <p className="text-lg text-white/80 max-w-md mx-auto mb-8">
            {task.notes}
          </p>
        )}
        
        {/* 退出提示 */}
        <div className="mt-12">
          <p className="text-white/60 text-sm">点击任意位置退出专注模式</p>
        </div>
      </div>
    </div>
  );
}
