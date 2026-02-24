import { useState, useEffect } from 'react';
import { useLocale } from '../hooks/useLocale';

const ONBOARDING_KEY = 'quadrant-onboarding-done';

const stepIcons = [
  // Menu icon
  <svg key="menu" className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
  </svg>,
  // Plus icon
  <svg key="plus" className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
  </svg>,
  // Drag icon
  <svg key="drag" className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>,
];

const stepColors = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
];

export default function OnboardingGuide() {
  const { t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      // 延迟显示，等页面加载完
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const handleNext = () => {
    if (step < 2) {
      setAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setAnimating(false);
      }, 150);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setAnimating(true);
      setTimeout(() => {
        setStep(step - 1);
        setAnimating(false);
      }, 150);
    }
  };

  if (!isVisible) return null;

  const steps = [
    { title: t('guide.s1.title'), desc: t('guide.s1.desc') },
    { title: t('guide.s2.title'), desc: t('guide.s2.desc') },
    { title: t('guide.s3.title'), desc: t('guide.s3.desc') },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* 引导卡片 */}
      <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* 顶部渐变装饰 */}
        <div className={`h-40 bg-gradient-to-br ${stepColors[step]} flex items-center justify-center transition-all duration-300`}>
          <div className={`text-white/90 transition-all duration-150 ${animating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
            {stepIcons[step]}
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 欢迎标题 - 只在第一步显示 */}
          {step === 0 && (
            <p className="text-xs text-primary font-medium mb-1 tracking-wide uppercase">
              {t('guide.welcome')}
            </p>
          )}

          <div className={`transition-all duration-150 ${animating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {steps[step].title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {steps[step].desc}
            </p>
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-primary'
                    : i < step
                      ? 'w-1.5 bg-primary/40'
                      : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>

          {/* 按钮 */}
          <div className="flex items-center gap-3 mt-5">
            {step > 0 ? (
              <button
                onClick={handlePrev}
                className="flex-1 py-2.5 text-sm font-medium text-muted-foreground bg-muted rounded-xl
                           hover:bg-muted/80 transition-colors"
              >
                {t('guide.prev')}
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 text-sm font-medium text-muted-foreground bg-muted rounded-xl
                           hover:bg-muted/80 transition-colors"
              >
                {t('guide.skip')}
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex-1 py-2.5 text-sm font-medium text-white rounded-xl
                         bg-gradient-to-r ${stepColors[step]} hover:opacity-90 transition-all shadow-sm`}
            >
              {step < 2 ? t('guide.next') : t('guide.done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
