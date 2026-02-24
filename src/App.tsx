import { useState } from 'react';
import QuadrantAxis from './components/QuadrantAxis';
import { useLocalStorage } from './hooks/useLocalStorage';
import { FontProvider, useFont, FontStyle } from './hooks/useFont';
import { LocaleProvider, useLocale } from './hooks/useLocale';
import { useIdleTimer } from './hooks/useIdleTimer';
import CongratulationsAnimation from './components/CongratulationsAnimation';
import CompletedTasksList from './components/CompletedTasksList';
import ImportModal from './components/ImportModal';
import OnboardingGuide from './components/OnboardingGuide';
import FocusMode from './components/FocusMode';
import { CompletedTask, Task } from './types';

interface DropdownMenuProps {
  completedTasks: CompletedTask[];
  onRestore: (id: string) => { success: boolean; task?: Task };
  onOpenImport: () => void;
  onClearExpired: () => void;
}

function DropdownMenu({ completedTasks, onRestore, onOpenImport, onClearExpired }: DropdownMenuProps) {
  const { fontStyle, setFontStyle } = useFont();
  const { locale, setLocale, t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [showCompletedList, setShowCompletedList] = useState(false);
  
  const fonts: { value: FontStyle; label: string; icon: string }[] = [
    { value: 'chinese', label: '行草', icon: '書' },
    { value: 'english', label: 'Script', icon: 'Aa' },
    { value: 'default', label: '默认', icon: '字' },
  ];

  return (
    <>
      <div className="relative z-30">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50
                     flex items-center justify-center text-muted-foreground
                     hover:bg-card/60 hover:text-foreground transition-all duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* 下拉菜单 */}
        <div 
          className={`absolute top-full left-0 mt-2 w-56 bg-card/50 backdrop-blur-md rounded-xl border border-border/50 shadow-lg overflow-hidden
                      transition-all duration-200 origin-top-left ${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {/* 语言切换 */}
          <div className="p-3 border-b border-border/50">
            <p className="text-xs text-muted-foreground mb-2">{t('menu.lang')}</p>
            <div className="flex gap-1">
              {[
                { value: 'zh' as const, label: '中文' },
                { value: 'en' as const, label: 'EN' },
              ].map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLocale(lang.value)}
                  className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all duration-150 ${
                    locale === lang.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* 字体切换 */}
          <div className="p-3 border-b border-border/50">
            <p className="text-xs text-muted-foreground mb-2">{t('menu.font')}</p>
            <div className="flex gap-1">
              {fonts.map((font) => (
                <button
                  key={font.value}
                  onClick={() => setFontStyle(font.value)}
                  className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all duration-150 ${
                    fontStyle === font.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  title={font.label}
                >
                  <span className={font.value === 'english' ? 'font-english' : font.value === 'chinese' ? 'font-chinese' : ''}>
                    {font.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* 导入功能 */}
          <button
            onClick={() => {
              onOpenImport();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50"
          >
            <span className="text-lg">📥</span>
            <div>
              <p className="text-sm font-medium text-foreground">{t('menu.import')}</p>
              <p className="text-xs text-muted-foreground">{t('menu.importDesc')}</p>
            </div>
          </button>
          
          {/* 已完成任务 */}
          <button
            onClick={() => {
              setShowCompletedList(true);
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
          >
            <span className="text-lg">✅</span>
            <div>
              <p className="text-sm font-medium text-foreground">{t('menu.completed')}</p>
              <p className="text-xs text-muted-foreground">{t('menu.completedDesc')}</p>
            </div>
            <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {completedTasks.length}
            </span>
          </button>
          
          {/* 清除过期事件 */}
          <button
            onClick={() => {
              onClearExpired();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors border-t border-border/50"
          >
            <span className="text-lg">🗑️</span>
            <div>
              <p className="text-sm font-medium text-foreground">{t('menu.clearExpired')}</p>
              <p className="text-xs text-muted-foreground">{t('menu.clearExpiredDesc')}</p>
            </div>
          </button>
        </div>
        
        {/* 点击外部关闭菜单 */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-[-1]" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
      
      {/* 已完成任务列表弹窗 */}
      <CompletedTasksList
        tasks={completedTasks}
        isOpen={showCompletedList}
        onClose={() => setShowCompletedList(false)}
        onRestore={onRestore}
      />
    </>
  );
}

function AppContent() {
  const { tasks, completedTasks, isLoaded, addTask, addTasks, updateTask, updateTaskPosition, deleteTask, clearExpiredTasks, completeTask, restoreTask } = useLocalStorage();
  const { fontClass } = useFont();
  const { t } = useLocale();
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const { isIdle, exitIdleMode } = useIdleTimer();

  const handleCompleteTask = (id: string) => {
    completeTask(id);
    setShowCongratulations(true);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft text-primary text-lg">{t('loading')}</div>
      </div>
    );
  }

  const menuSlot = (
    <DropdownMenu 
      completedTasks={completedTasks} 
      onRestore={restoreTask}
      onOpenImport={() => setShowImportModal(true)}
      onClearExpired={clearExpiredTasks}
    />
  );

  return (
    <div className={`h-screen h-[100dvh] overflow-hidden ${fontClass}`}>
      {/* 主内容区 - 占满整个屏幕 */}
      <div className="w-full h-full">
        <QuadrantAxis
          tasks={tasks}
          onAddTask={addTask}
          onUpdatePosition={updateTaskPosition}
          onDeleteTask={deleteTask}
          onCompleteTask={handleCompleteTask}
          onUpdateTask={updateTask}
          menuSlot={menuSlot}
        />
      </div>
      
      {/* Congratulations动画 */}
      <CongratulationsAnimation
        isVisible={showCongratulations}
        onComplete={() => setShowCongratulations(false)}
      />
      
      {/* 导入弹窗 */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={addTasks}
      />

      {/* 新手引导 */}
      <OnboardingGuide />

      {/* 闲置聚焦模式 */}
      <FocusMode
        isActive={isIdle}
        tasks={tasks}
        onExit={exitIdleMode}
      />
    </div>
  );
}

function App() {
  return (
    <LocaleProvider>
      <FontProvider>
        <AppContent />
      </FontProvider>
    </LocaleProvider>
  );
}

export default App;
