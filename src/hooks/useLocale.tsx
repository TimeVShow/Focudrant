import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Locale = 'zh' | 'en';

const translations: Record<Locale, Record<string, string>> = {
  zh: {
    // 象限标签
    'q.important.label': '重要 · 不紧急',
    'q.important.sub': '计划安排',
    'q.urgent.label': '重要 · 紧急',
    'q.urgent.sub': '立即处理',
    'q.later.label': '不重要 · 不紧急',
    'q.later.sub': '适当放弃',
    'q.delegate.label': '不重要 · 紧急',
    'q.delegate.sub': '委托他人',

    // 坐标轴
    'axis.up': '↑ 重要',
    'axis.down': '↓ 不重要',
    'axis.right': '紧急 →',
    'axis.left': '← 不紧急',

    // 下拉菜单
    'menu.font': '切换字体',
    'menu.lang': '语言切换',
    'menu.import': '导入任务',
    'menu.importDesc': '从txt文件批量导入',
    'menu.completed': '已完成任务',
    'menu.completedDesc': '查看最近7天完成的任务',
    'menu.clearExpired': '清除过期事件',
    'menu.clearExpiredDesc': '删除所有已过期的事件',

    // 任务卡片
    'task.overdue': '已过期',
    'task.dh': '{d}天{h}小时',
    'task.hm': '{h}小时{m}分钟',
    'task.m': '{m}分钟',
    'task.low': '低',
    'task.medium': '中',
    'task.high': '高',

    // 添加任务弹窗
    'add.title': '添加新事件',
    'add.subtitle': '新事件将默认添加到「重要·不紧急」象限',
    'add.smart': '智能识别',
    'add.smartHint': '如：630聚会、一天后开会、十一放假',
    'add.smartPlaceholder': '输入任务描述，支持：630聚会、一天后上班、十一放假、明天开会...',
    'add.result': '识别结果：',
    'add.addEvent': '添加事件',
    'add.orManual': '或手动填写',
    'add.name': '事件名称',
    'add.namePH': '请输入事件名称',
    'add.deadline': '截止时间',
    'add.importance': '重要程度',
    'add.optional': '(可选)',
    'add.notes': '备注',
    'add.notesPH': '添加备注或超链接...',
    'add.cancel': '取消',
    'add.smartFail': '未能识别，请尝试："630聚会"、"一天后上班"、"明天开会"',

    // 已完成任务
    'done.title': '已完成任务',
    'done.subtitle': '最近7天内完成的任务',
    'done.empty': '暂无已完成的任务',
    'done.emptyHint': '完成任务后会在这里显示',
    'done.undo': '撤销',
    'done.today': '今天',
    'done.yesterday': '昨天',
    'done.daysAgo': '{d}天前',

    // 任务详情
    'detail.subtitle': '事件详情',
    'detail.deadline': '截止时间',
    'detail.notes': '备注',
    'detail.notesHint': '(支持文本和链接)',
    'detail.notesPH': '添加备注或超链接...',
    'detail.preview': '预览：',
    'detail.cancel': '取消',
    'detail.save': '保存修改',

    // 导入
    'imp.title': '导入任务',
    'imp.subtitle': '从txt文件批量导入任务',
    'imp.success': '导入成功',
    'imp.successCount': '成功导入 {n} 个任务',
    'imp.failCount': '，{n} 个解析失败',
    'imp.drop': '拖拽文件到此处，或点击选择文件',
    'imp.release': '松开鼠标导入文件',
    'imp.format': '支持 .txt 格式文件',
    'imp.guideTitle': '文件格式说明',
    'imp.guideDesc': '每行一个任务，使用 | 分隔字段：',
    'imp.guideExample': '任务标题|截止时间|重要程度|备注',
    'imp.guideComment': '# 以下是示例',
    'imp.fTitle': '标题',
    'imp.fTitleD': '必填',
    'imp.fDeadline': '截止时间',
    'imp.fDeadlineD': '可选，支持日期格式或"明天"、"X天后"等',
    'imp.fImp': '重要程度',
    'imp.fImpD': '可选，支持 高/中/低 或 high/medium/low',
    'imp.fNotes': '备注',
    'imp.fNotesD': '可选',
    'imp.privacy': '文件仅在本地解析，解析后立即删除，不会上传至任何服务器',

    // 加载
    'loading': '加载中...',

    // 祝贺
    'congrats': '任务完成！继续加油！',

    // 任务数量限制
    'limit.title': '事件数量已达上限',
    'limit.add': '事件数量过多，请先删除部分吧',
    'limit.import': '导入后将超过100个事件，请先删除部分后重试',
    'limit.restore': '事件数量已达上限，无法恢复',

    // 引导
    'guide.welcome': '欢迎使用四象限待办',
    'guide.s1.title': '菜单功能',
    'guide.s1.desc': '点击「重要·不紧急」标签旁的菜单按钮，可以切换字体、导入任务、切换语言等。',
    'guide.s2.title': '添加事件',
    'guide.s2.desc': '点击中央的 + 按钮，支持智能识别文本或手动输入来快速添加新事件。',
    'guide.s3.title': '拖拽调整优先级',
    'guide.s3.desc': '长按或拖拽事件卡片到不同象限，即可调整事件的重要性和紧急程度。',
    'guide.next': '下一步',
    'guide.prev': '上一步',
    'guide.done': '开始使用',
    'guide.skip': '跳过',
  },
  en: {
    'q.important.label': 'Important · Not Urgent',
    'q.important.sub': 'Plan Ahead',
    'q.urgent.label': 'Important · Urgent',
    'q.urgent.sub': 'Do Now',
    'q.later.label': 'Not Important · Not Urgent',
    'q.later.sub': 'Eliminate',
    'q.delegate.label': 'Not Important · Urgent',
    'q.delegate.sub': 'Delegate',

    'axis.up': '↑ Important',
    'axis.down': '↓ Not Important',
    'axis.right': 'Urgent →',
    'axis.left': '← Not Urgent',

    'menu.font': 'Font Style',
    'menu.lang': 'Language',
    'menu.import': 'Import Tasks',
    'menu.importDesc': 'Batch import from txt',
    'menu.completed': 'Completed',
    'menu.completedDesc': 'Tasks from last 7 days',
    'menu.clearExpired': 'Clear Expired',
    'menu.clearExpiredDesc': 'Remove all expired events',

    'task.overdue': 'Overdue',
    'task.dh': '{d}d {h}h',
    'task.hm': '{h}h {m}m',
    'task.m': '{m}m',
    'task.low': 'Low',
    'task.medium': 'Med',
    'task.high': 'High',

    'add.title': 'Add New Event',
    'add.subtitle': 'Defaults to "Important · Not Urgent" quadrant',
    'add.smart': 'Smart Input',
    'add.smartHint': 'e.g. 630party, 1day meeting',
    'add.smartPlaceholder': 'Describe your task: 630party, in 1 day work, tomorrow meeting...',
    'add.result': 'Recognized:',
    'add.addEvent': 'Add Event',
    'add.orManual': 'or fill manually',
    'add.name': 'Event Name',
    'add.namePH': 'Enter event name',
    'add.deadline': 'Deadline',
    'add.importance': 'Importance',
    'add.optional': '(optional)',
    'add.notes': 'Notes',
    'add.notesPH': 'Add notes or links...',
    'add.cancel': 'Cancel',
    'add.smartFail': 'Not recognized. Try: "630party", "in 1 day work"',

    'done.title': 'Completed Tasks',
    'done.subtitle': 'Tasks from last 7 days',
    'done.empty': 'No completed tasks',
    'done.emptyHint': 'Completed tasks will appear here',
    'done.undo': 'Undo',
    'done.today': 'Today',
    'done.yesterday': 'Yesterday',
    'done.daysAgo': '{d}d ago',

    'detail.subtitle': 'Event Details',
    'detail.deadline': 'Deadline',
    'detail.notes': 'Notes',
    'detail.notesHint': '(text & links)',
    'detail.notesPH': 'Add notes or links...',
    'detail.preview': 'Preview:',
    'detail.cancel': 'Cancel',
    'detail.save': 'Save',

    'imp.title': 'Import Tasks',
    'imp.subtitle': 'Batch import from txt file',
    'imp.success': 'Import Successful',
    'imp.successCount': 'Imported {n} tasks',
    'imp.failCount': ', {n} failed',
    'imp.drop': 'Drop files here, or click to select',
    'imp.release': 'Release to import',
    'imp.format': 'Supports .txt files',
    'imp.guideTitle': 'Format Guide',
    'imp.guideDesc': 'One task per line, use | to separate:',
    'imp.guideExample': 'Title|Deadline|Importance|Notes',
    'imp.guideComment': '# Examples below',
    'imp.fTitle': 'Title',
    'imp.fTitleD': 'Required',
    'imp.fDeadline': 'Deadline',
    'imp.fDeadlineD': 'Optional, supports date or "tomorrow"',
    'imp.fImp': 'Importance',
    'imp.fImpD': 'Optional, high/medium/low',
    'imp.fNotes': 'Notes',
    'imp.fNotesD': 'Optional',
    'imp.privacy': 'Files are parsed locally and deleted immediately. Nothing is uploaded.',

    'loading': 'Loading...',
    'congrats': 'Task completed! Keep going!',

    // Task limit
    'limit.title': 'Task limit reached',
    'limit.add': 'Too many tasks. Please delete some first.',
    'limit.import': 'Import would exceed 100 tasks. Please delete some first.',
    'limit.restore': 'Task limit reached. Cannot restore.',

    'guide.welcome': 'Welcome to Quadrant Todo',
    'guide.s1.title': 'Menu Features',
    'guide.s1.desc': 'Click the menu button next to the "Important · Not Urgent" label to switch fonts, import tasks, change language, etc.',
    'guide.s2.title': 'Add Events',
    'guide.s2.desc': 'Click the + button in the center to quickly add new events with smart text recognition or manual input.',
    'guide.s3.title': 'Drag to Adjust',
    'guide.s3.desc': 'Long press or drag event cards to different quadrants to change their importance and urgency.',
    'guide.next': 'Next',
    'guide.prev': 'Back',
    'guide.done': 'Get Started',
    'guide.skip': 'Skip',
  },
};

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'quadrant-locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh');

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (saved && ['zh', 'en'].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc);
    localStorage.setItem(LOCALE_STORAGE_KEY, loc);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let text = translations[locale]?.[key] || translations['zh']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
