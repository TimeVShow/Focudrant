import { useState, useEffect } from 'react';
import { Task } from '../types';
import { useLocale } from '../hooks/useLocale';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

// 中文数字映射
const chineseNumMap: Record<string, number> = {
  '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
  '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '两': 2, '俩': 2,
};

// 将中文数字转换为阿拉伯数字
function parseChineseNum(str: string): number {
  if (str.startsWith('十')) {
    if (str.length === 1) return 10;
    return 10 + (chineseNumMap[str[1]] || 0);
  }
  if (str.includes('十')) {
    const parts = str.split('十');
    const tens = chineseNumMap[parts[0]] || 1;
    const ones = parts[1] ? (chineseNumMap[parts[1]] || 0) : 0;
    return tens * 10 + ones;
  }
  return chineseNumMap[str] || 0;
}

// 智能解析文本生成任务
function parseSmartText(text: string): { title: string; deadline: string } | null {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  let deadline: Date | null = null;
  let matchedPattern: string = '';
  
  // 1. 匹配纯数字日期格式
  const numDateMatch = text.match(/^(\d{3,4})(.*)$/);
  if (numDateMatch) {
    const numStr = numDateMatch[1];
    let month: number, day: number;
    
    if (numStr.length === 3) {
      month = parseInt(numStr[0]);
      day = parseInt(numStr.slice(1));
    } else {
      month = parseInt(numStr.slice(0, 2));
      day = parseInt(numStr.slice(2));
      if (month > 12) {
        month = parseInt(numStr[0]);
        day = parseInt(numStr.slice(1));
      }
    }
    
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      deadline = new Date(currentYear, month - 1, day, 18, 0, 0);
      if (deadline < now) {
        deadline.setFullYear(currentYear + 1);
      }
      matchedPattern = numStr;
    }
  }
  
  // 2. 匹配特殊节日
  if (!deadline) {
    const holidayPatterns = [
      { regex: /十一/, month: 10, day: 1 },
      { regex: /五一/, month: 5, day: 1 },
      { regex: /元旦/, month: 1, day: 1 },
      { regex: /圣诞/, month: 12, day: 25 },
    ];
    
    for (const pattern of holidayPatterns) {
      if (pattern.regex.test(text)) {
        deadline = new Date(currentYear, pattern.month - 1, pattern.day, 18, 0, 0);
        if (deadline < now) {
          deadline.setFullYear(currentYear + 1);
        }
        matchedPattern = text.match(pattern.regex)![0];
        break;
      }
    }
  }
  
  // 3. 匹配中文数字时间
  if (!deadline) {
    const chineseTimePatterns = [
      { regex: /([一二三四五六七八九十两俩]+)\s*分钟[后内]?/, unit: 'minutes' },
      { regex: /([一二三四五六七八九十两俩]+)\s*[个小]?时[后内]?/, unit: 'hours' },
      { regex: /([一二三四五六七八九十两俩]+)\s*天[后内]?/, unit: 'days' },
      { regex: /([一二三四五六七八九十两俩]+)\s*周[后内]?/, unit: 'weeks' },
    ];
    
    for (const pattern of chineseTimePatterns) {
      const match = text.match(pattern.regex);
      if (match) {
        matchedPattern = match[0];
        const value = parseChineseNum(match[1]);
        
        switch (pattern.unit) {
          case 'minutes':
            deadline = new Date(now.getTime() + value * 60 * 1000);
            break;
          case 'hours':
            deadline = new Date(now.getTime() + value * 60 * 60 * 1000);
            break;
          case 'days':
            deadline = new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
            break;
          case 'weeks':
            deadline = new Date(now.getTime() + value * 7 * 24 * 60 * 60 * 1000);
            break;
        }
        break;
      }
    }
  }
  
  // 4. 匹配阿拉伯数字时间模式
  if (!deadline) {
    const arabicTimePatterns = [
      { regex: /(\d+)\s*分钟[后内]?/, unit: 'minutes' },
      { regex: /(\d+)\s*[个小]?时[后内]?/, unit: 'hours' },
      { regex: /(\d+)\s*天[后内]?/, unit: 'days' },
      { regex: /(\d+)\s*周[后内]?/, unit: 'weeks' },
    ];
    
    for (const pattern of arabicTimePatterns) {
      const match = text.match(pattern.regex);
      if (match) {
        matchedPattern = match[0];
        const value = parseInt(match[1]);
        
        switch (pattern.unit) {
          case 'minutes':
            deadline = new Date(now.getTime() + value * 60 * 1000);
            break;
          case 'hours':
            deadline = new Date(now.getTime() + value * 60 * 60 * 1000);
            break;
          case 'days':
            deadline = new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
            break;
          case 'weeks':
            deadline = new Date(now.getTime() + value * 7 * 24 * 60 * 60 * 1000);
            break;
        }
        break;
      }
    }
  }
  
  // 5. 匹配中文日期词汇
  if (!deadline) {
    const dateKeywords = [
      { regex: /明天/, unit: 'tomorrow' },
      { regex: /后天/, unit: 'dayAfterTomorrow' },
      { regex: /大后天/, unit: 'threeDaysLater' },
      { regex: /下周/, unit: 'nextWeek' },
      { regex: /今晚/, unit: 'tonight' },
      { regex: /今天/, unit: 'today' },
    ];
    
    for (const pattern of dateKeywords) {
      const match = text.match(pattern.regex);
      if (match) {
        matchedPattern = match[0];
        
        switch (pattern.unit) {
          case 'today':
            deadline = new Date(now);
            deadline.setHours(23, 59, 0, 0);
            break;
          case 'tomorrow':
            deadline = new Date(now);
            deadline.setDate(deadline.getDate() + 1);
            deadline.setHours(18, 0, 0, 0);
            break;
          case 'dayAfterTomorrow':
            deadline = new Date(now);
            deadline.setDate(deadline.getDate() + 2);
            deadline.setHours(18, 0, 0, 0);
            break;
          case 'threeDaysLater':
            deadline = new Date(now);
            deadline.setDate(deadline.getDate() + 3);
            deadline.setHours(18, 0, 0, 0);
            break;
          case 'nextWeek':
            deadline = new Date(now);
            deadline.setDate(deadline.getDate() + 7);
            deadline.setHours(18, 0, 0, 0);
            break;
          case 'tonight':
            deadline = new Date(now);
            deadline.setHours(22, 0, 0, 0);
            break;
        }
        break;
      }
    }
  }
  
  // 6. 匹配时间段+具体时间
  if (!deadline) {
    const timeOfDayPatterns = [
      { regex: /晚上([一二三四五六七八九十两]+|\d+)[点时]/, period: 'evening' },
      { regex: /早上([一二三四五六七八九十两]+|\d+)[点时]/, period: 'morning' },
      { regex: /上午([一二三四五六七八九十两]+|\d+)[点时]/, period: 'morning' },
      { regex: /下午([一二三四五六七八九十两]+|\d+)[点时]/, period: 'afternoon' },
      { regex: /中午([一二三四五六七八九十两]+|\d+)[点时]/, period: 'noon' },
    ];
    
    for (const pattern of timeOfDayPatterns) {
      const match = text.match(pattern.regex);
      if (match) {
        matchedPattern = match[0];
        let hour: number;
        
        const timeNum = match[1];
        if (/^\d+$/.test(timeNum)) {
          hour = parseInt(timeNum);
        } else {
          hour = parseChineseNum(timeNum);
        }
        
        switch (pattern.period) {
          case 'morning':
            if (hour > 12) hour = hour;
            break;
          case 'noon':
            if (hour < 12) hour = 12;
            break;
          case 'afternoon':
            if (hour < 12) hour += 12;
            break;
          case 'evening':
            if (hour >= 6 && hour < 12) hour += 12;
            else if (hour < 6) hour += 12;
            break;
        }
        
        deadline = new Date(now);
        deadline.setHours(hour, 0, 0, 0);
        
        if (deadline <= now) {
          deadline.setDate(deadline.getDate() + 1);
        }
        break;
      }
    }
  }
  
  if (!deadline) return null;
  
  let title = text
    .replace(/提醒我|记得|要|需要|应该|必须/g, '')
    .replace(matchedPattern, '')
    .replace(/[，,。.！!？?]/g, '')
    .trim();
  
  if (!title) title = text.slice(0, 20);
  
  const year = deadline.getFullYear();
  const month = String(deadline.getMonth() + 1).padStart(2, '0');
  const day = String(deadline.getDate()).padStart(2, '0');
  const hours = String(deadline.getHours()).padStart(2, '0');
  const mins = String(deadline.getMinutes()).padStart(2, '0');
  
  return {
    title,
    deadline: `${year}-${month}-${day}T${hours}:${mins}`,
  };
}

export default function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const { t } = useLocale();
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [importance, setImportance] = useState<'low' | 'medium' | 'high' | ''>('');
  const [notes, setNotes] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [smartText, setSmartText] = useState('');
  const [parsedResult, setParsedResult] = useState<{ title: string; deadline: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      setSmartText('');
      setParsedResult(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (smartText.trim()) {
      const result = parseSmartText(smartText);
      setParsedResult(result);
    } else {
      setParsedResult(null);
    }
  }, [smartText]);

  const handleSmartCreate = () => {
    if (parsedResult) {
      onAdd({
        title: parsedResult.title,
        deadline: parsedResult.deadline,
        importance: undefined,
        notes: undefined,
        x: -50,
        y: 50,
      });
      
      setSmartText('');
      setParsedResult(null);
      setTitle('');
      setDeadline('');
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !deadline) return;

    onAdd({
      title: title.trim(),
      deadline,
      importance: importance || undefined,
      notes: notes.trim() || undefined,
      x: -50,
      y: 50,
    });

    setTitle('');
    setDeadline('');
    setImportance('');
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!isOpen) return null;

  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleClose}
    >
      <div 
        className={`absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} 
      />
      
      <div 
        className={`relative w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 transition-all duration-200 transform max-h-[90vh] overflow-y-auto ${
          isVisible ? 'opacity-100 translate-y-0 sm:scale-100' : 'opacity-0 translate-y-full sm:translate-y-0 sm:scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
        
        <button
          onClick={handleClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted
                     flex items-center justify-center text-muted-foreground
                     hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">{t('add.title')}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('add.subtitle')}</p>
        </div>

        {/* 智能识别输入 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-foreground">{t('add.smart')}</span>
            <span className="text-xs text-muted-foreground">{t('add.smartHint')}</span>
          </div>
          
          <div className="space-y-3">
            <textarea
              value={smartText}
              onChange={(e) => setSmartText(e.target.value)}
              placeholder={t('add.smartPlaceholder')}
              className="input-base text-sm py-3 min-h-[60px] resize-none"
              autoFocus
            />
            {parsedResult && (
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-xs text-muted-foreground mb-2">{t('add.result')}</p>
                <p className="text-sm font-medium text-foreground">📌 {parsedResult.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ⏰ {new Date(parsedResult.deadline).toLocaleString('zh-CN', { 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                <button
                  type="button"
                  onClick={handleSmartCreate}
                  className="mt-3 w-full py-2 bg-primary text-white rounded-lg text-sm font-medium
                             hover:bg-primary/90 transition-colors"
                >
                  {t('add.addEvent')}
                </button>
              </div>
            )}
            {smartText && !parsedResult && (
              <p className="text-xs text-muted-foreground text-center py-2">
                {t('add.smartFail')}
              </p>
            )}
          </div>
        </div>

        {/* 分隔线 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">{t('add.orManual')}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="relative z-10">
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
              {t('add.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('add.namePH')}
              className="input-base text-sm sm:text-base py-2.5 sm:py-3"
              required
            />
          </div>

          <div className="relative z-0">
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
              {t('add.deadline')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <input
                type="date"
                value={deadline.split('T')[0] || ''}
                onChange={(e) => {
                  const time = deadline.split('T')[1] || '23:59';
                  setDeadline(e.target.value ? `${e.target.value}T${time}` : '');
                }}
                min={minDateTime.split('T')[0]}
                className="input-base text-sm sm:text-base py-2.5 sm:py-3"
                required
              />
              <input
                type="time"
                value={deadline.split('T')[1] || ''}
                onChange={(e) => {
                  const date = deadline.split('T')[0] || minDateTime.split('T')[0];
                  setDeadline(e.target.value ? `${date}T${e.target.value}` : deadline);
                }}
                className="input-base text-sm sm:text-base py-2.5 sm:py-3"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
              {t('add.importance')} <span className="text-muted-foreground text-xs">{t('add.optional')}</span>
            </label>
            <div className="flex gap-2 sm:gap-3">
              {[
                { value: 'low', label: t('task.low'), bgColor: 'bg-gray-100', activeColor: 'bg-gray-200 ring-2 ring-gray-400' },
                { value: 'medium', label: t('task.medium'), bgColor: 'bg-orange-50', activeColor: 'bg-orange-100 ring-2 ring-orange-400' },
                { value: 'high', label: t('task.high'), bgColor: 'bg-red-50', activeColor: 'bg-red-100 ring-2 ring-red-400' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setImportance(importance === option.value ? '' : option.value as typeof importance)}
                  className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                    importance === option.value ? option.activeColor : `${option.bgColor} hover:opacity-80`
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
              {t('add.notes')} <span className="text-muted-foreground text-xs">{t('add.optional')}</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('add.notesPH')}
              className="input-base text-sm sm:text-base py-2.5 sm:py-3 min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1 text-sm sm:text-base py-2.5 sm:py-2"
            >
              {t('add.cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 text-sm sm:text-base py-2.5 sm:py-2"
              disabled={!title.trim() || !deadline}
            >
              {t('add.addEvent')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
