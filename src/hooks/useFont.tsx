import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FontStyle = 'chinese' | 'english' | 'default';

interface FontContextType {
  fontStyle: FontStyle;
  setFontStyle: (style: FontStyle) => void;
  fontClass: string;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

const FONT_STORAGE_KEY = 'quadrant-font-style';

const fontClasses: Record<FontStyle, string> = {
  chinese: 'font-chinese',
  english: 'font-english',
  default: 'font-default',
};

export function FontProvider({ children }: { children: ReactNode }) {
  const [fontStyle, setFontStyleState] = useState<FontStyle>('chinese');

  // 从 localStorage 加载字体设置
  useEffect(() => {
    const saved = localStorage.getItem(FONT_STORAGE_KEY) as FontStyle | null;
    if (saved && ['chinese', 'english', 'default'].includes(saved)) {
      setFontStyleState(saved);
    }
  }, []);

  const setFontStyle = (style: FontStyle) => {
    setFontStyleState(style);
    localStorage.setItem(FONT_STORAGE_KEY, style);
  };

  return (
    <FontContext.Provider value={{ 
      fontStyle, 
      setFontStyle, 
      fontClass: fontClasses[fontStyle] 
    }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
}
