import { useState, useEffect, useCallback, useRef } from 'react';

const IDLE_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds

export function useIdleTimer(timeout: number = IDLE_TIMEOUT) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdleRef = useRef(false);

  const resetTimer = useCallback(() => {
    // 如果当前是闲置状态，先退出闲置模式
    if (isIdleRef.current) {
      setIsIdle(false);
      isIdleRef.current = false;
    }

    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 设置新的定时器
    timerRef.current = setTimeout(() => {
      setIsIdle(true);
      isIdleRef.current = true;
    }, timeout);
  }, [timeout]);

  const exitIdleMode = useCallback(() => {
    if (isIdleRef.current) {
      setIsIdle(false);
      isIdleRef.current = false;
      resetTimer();
    }
  }, [resetTimer]);

  useEffect(() => {
    // 监听用户活动事件
    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'wheel',
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // 初始化定时器
    resetTimer();

    // 添加事件监听
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer]);

  return { isIdle, exitIdleMode };
}
