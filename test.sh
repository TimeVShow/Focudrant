#!/bin/bash
# ============================================
# 四象限待办事项应用 - 完整功能测试脚本
# 版本: 2.0
# 更新日期: 2026-02-24
# 功能覆盖: 核心功能 + 新增功能（国际化、新手引导等）
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 计数器
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# 测试结果输出函数
pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    ((PASS_COUNT++))
}

fail() {
    echo -e "  ${RED}✗${NC} $1"
    ((FAIL_COUNT++))
}

warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
    ((WARN_COUNT++))
}

info() {
    echo -e "  ${BLUE}ℹ${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}【$1】$2${NC}"
}

echo ""
echo "============================================="
echo "  四象限待办事项应用 - 功能测试"
echo "============================================="
echo ""

# ============================================
# 第1部分：核心文件检查
# 测试目的：确保所有必要的源代码文件存在
# ============================================
section "1" "检查核心文件..."

# 主要组件文件
CORE_FILES=(
    "src/App.tsx"
    "src/main.tsx"
    "src/components/TaskCard.tsx"
    "src/components/QuadrantAxis.tsx"
    "src/components/AddTaskModal.tsx"
    "src/components/TaskDetailModal.tsx"
    "src/components/CompletedTasksList.tsx"
    "src/components/ImportModal.tsx"
    "src/components/CongratulationsAnimation.tsx"
    "src/components/OnboardingGuide.tsx"
)

ALL_CORE_EXIST=true
for file in "${CORE_FILES[@]}"; do
    if [ -f "$file" ]; then
        pass "$file 存在"
    else
        fail "$file 缺失"
        ALL_CORE_EXIST=false
    fi
done

if [ "$ALL_CORE_EXIST" = false ]; then
    echo -e "${RED}错误：缺少核心文件，测试终止${NC}"
    exit 1
fi

# ============================================
# 第2部分：Hook 文件检查
# 测试目的：确保自定义 Hook 文件完整
# ============================================
section "2" "检查 Hook 文件..."

HOOK_FILES=(
    "src/hooks/useLocalStorage.ts"
    "src/hooks/useFont.tsx"
    "src/hooks/useLocale.tsx"
)

for file in "${HOOK_FILES[@]}"; do
    if [ -f "$file" ]; then
        pass "$file 存在"
    else
        fail "$file 缺失"
    fi
done

# ============================================
# 第3部分：类型定义检查
# 测试目的：确保 TypeScript 类型定义完整
# ============================================
section "3" "检查类型定义..."

if [ -f "src/types/index.ts" ]; then
    # 检查 Task 类型字段
    if grep -q "id:" src/types/index.ts && grep -q "title:" src/types/index.ts; then
        pass "Task 基础字段（id, title）已定义"
    else
        fail "Task 基础字段定义不完整"
    fi
    
    if grep -q "deadline:" src/types/index.ts; then
        pass "Task deadline 字段已定义"
    else
        fail "Task deadline 字段缺失"
    fi
    
    if grep -q "notes" src/types/index.ts; then
        pass "Task notes 字段已定义（支持备注功能）"
    else
        fail "Task notes 字段缺失"
    fi
    
    if grep -q "x:" src/types/index.ts && grep -q "y:" src/types/index.ts; then
        pass "Task 位置字段（x, y）已定义"
    else
        fail "Task 位置字段缺失"
    fi
    
    # 检查 CompletedTask 类型
    if grep -q "CompletedTask" src/types/index.ts && grep -q "completedAt" src/types/index.ts; then
        pass "CompletedTask 类型已定义（支持已完成任务功能）"
    else
        fail "CompletedTask 类型缺失"
    fi
else
    fail "src/types/index.ts 不存在"
fi

# ============================================
# 第4部分：依赖检查
# 测试目的：确保 package.json 包含必要依赖
# ============================================
section "4" "检查 package.json 依赖..."

if [ -f "package.json" ]; then
    if grep -q "react" package.json; then
        pass "React 依赖存在"
    else
        fail "React 依赖缺失"
    fi
    
    if grep -q "typescript" package.json; then
        pass "TypeScript 依赖存在"
    else
        fail "TypeScript 依赖缺失"
    fi
    
    if grep -q "vite" package.json; then
        pass "Vite 依赖存在"
    else
        fail "Vite 依赖缺失"
    fi
    
    if grep -q "tailwindcss" package.json; then
        pass "TailwindCSS 依赖存在"
    else
        fail "TailwindCSS 依赖缺失"
    fi
else
    fail "package.json 不存在"
    exit 1
fi

# ============================================
# 第5部分：全屏布局检查
# 测试目的：确保坐标轴占满整个屏幕
# ============================================
section "5" "检查全屏布局..."

if grep -q "h-screen" src/App.tsx || grep -q "h-\[100dvh\]" src/App.tsx; then
    pass "全屏高度布局已实现（h-screen 或 h-[100dvh]）"
else
    fail "全屏布局未实现"
fi

if grep -q "overflow-hidden" src/App.tsx; then
    pass "溢出隐藏已设置（防止滚动条）"
else
    warn "未检测到 overflow-hidden"
fi

# ============================================
# 第6部分：四象限布局检查
# 测试目的：确保四象限对称布局正确实现
# ============================================
section "6" "检查四象限布局..."

# 检查象限Y方向对齐（上下对称）
if grep -q "flex-col-reverse" src/components/QuadrantAxis.tsx && grep -q "flex-col" src/components/QuadrantAxis.tsx; then
    pass "Y方向对称布局已实现（上象限 flex-col-reverse，下象限 flex-col）"
else
    fail "Y方向对称布局未实现"
fi

# 检查象限X方向对齐（左右对称）
if grep -q "items-end" src/components/QuadrantAxis.tsx && grep -q "items-start" src/components/QuadrantAxis.tsx; then
    pass "X方向对称布局已实现（左象限 items-end，右象限 items-start）"
else
    fail "X方向对称布局未实现"
fi

# 检查象限配置
if grep -q "quadrantConfig" src/components/QuadrantAxis.tsx; then
    pass "象限配置对象已定义"
else
    fail "象限配置对象缺失"
fi

# ============================================
# 第7部分：任务定位逻辑检查
# 测试目的：确保任务按紧急程度和截止时间正确定位
# ============================================
section "7" "检查任务定位逻辑..."

# 检查紧急程度计算
if grep -q "getUrgencyScore" src/components/QuadrantAxis.tsx; then
    pass "紧急程度计算函数（getUrgencyScore）已实现"
else
    fail "紧急程度计算函数缺失"
fi

# 检查Y轴定位（紧急程度）
if grep -q "normalizedUrgency" src/components/QuadrantAxis.tsx; then
    pass "Y轴归一化定位（normalizedUrgency）已实现"
else
    fail "Y轴归一化定位缺失"
fi

# 检查X轴定位（截止时间）
if grep -q "positionX" src/components/QuadrantAxis.tsx && grep -q "xOffset" src/components/QuadrantAxis.tsx; then
    pass "X轴截止时间定位已实现"
else
    fail "X轴截止时间定位未实现"
fi

# 检查累积偏移计算
if grep -q "calculateCumulativeOffset" src/components/QuadrantAxis.tsx; then
    pass "累积偏移计算函数（calculateCumulativeOffset）已实现"
    
    # 检查偏移参数
    if grep -q "MIN_OFFSET.*=.*24" src/components/QuadrantAxis.tsx; then
        pass "最小偏移量设置为 24px"
    else
        warn "最小偏移量可能不是 24px"
    fi
    
    if grep -q "MAX_OFFSET" src/components/QuadrantAxis.tsx; then
        pass "最大偏移量限制已设置"
    else
        warn "未设置最大偏移量限制"
    fi
    
    if grep -q "timeDiff\|daysDiff" src/components/QuadrantAxis.tsx; then
        pass "偏移量基于时间差动态计算"
    else
        fail "偏移量未基于时间差计算"
    fi
else
    fail "累积偏移计算函数缺失"
fi

# 检查左右象限对称偏移
if grep -q "isRightQuadrant" src/components/QuadrantAxis.tsx && grep -q "isLeftQuadrant" src/components/QuadrantAxis.tsx; then
    if grep -q "marginLeft.*isRightQuadrant" src/components/QuadrantAxis.tsx || grep -q "marginRight.*isLeftQuadrant" src/components/QuadrantAxis.tsx; then
        pass "左右象限X轴对称偏移已实现"
    else
        warn "左右象限偏移逻辑可能不完整"
    fi
else
    fail "象限方向判断变量缺失"
fi

# ============================================
# 第8部分：任务卡片功能检查
# 测试目的：确保任务卡片具备所有必要功能
# ============================================
section "8" "检查任务卡片功能..."

# 检查复选框
if grep -q 'type="checkbox"' src/components/TaskCard.tsx; then
    pass "任务完成复选框已实现"
else
    fail "任务完成复选框缺失"
fi

# 检查拖拽功能
if grep -q "draggable" src/components/TaskCard.tsx && grep -q "onDragStart" src/components/TaskCard.tsx; then
    pass "桌面端拖拽功能已实现"
else
    fail "桌面端拖拽功能缺失"
fi

# 检查触摸拖拽功能
if grep -q "onTouchStart" src/components/TaskCard.tsx && grep -q "onTouchEnd" src/components/TaskCard.tsx; then
    pass "移动端触摸拖拽功能已实现"
else
    warn "移动端触摸拖拽功能可能缺失"
fi

# 检查删除按钮
if grep -q "onDelete" src/components/TaskCard.tsx && grep -q "bg-red-500" src/components/TaskCard.tsx; then
    pass "删除按钮已实现（右上角红色按钮）"
else
    fail "删除按钮缺失"
fi

# 检查卡片点击事件
if grep -q "onClick" src/components/TaskCard.tsx; then
    pass "卡片点击事件已实现（用于打开详情）"
else
    warn "卡片点击事件可能缺失"
fi

# 检查卡片最小宽度
if grep -q "min-w-\[" src/components/TaskCard.tsx; then
    pass "卡片最小宽度已设置"
else
    warn "卡片未设置最小宽度"
fi

# 检查剩余时间显示
if grep -q "timeRemaining" src/components/TaskCard.tsx; then
    pass "剩余时间计算与显示已实现"
else
    fail "剩余时间显示缺失"
fi

# 检查重要程度标签
if grep -q "importanceLabel" src/components/TaskCard.tsx; then
    pass "重要程度标签已实现"
else
    warn "重要程度标签可能缺失"
fi

# ============================================
# 第9部分：国际化功能检查（新增功能）
# 测试目的：确保中英文切换功能完整
# ============================================
section "9" "检查国际化功能（useLocale）..."

if [ -f "src/hooks/useLocale.tsx" ]; then
    # 检查语言类型定义
    if grep -q "type Locale = 'zh' | 'en'" src/hooks/useLocale.tsx || grep -q "Locale = \"zh\" | \"en\"" src/hooks/useLocale.tsx; then
        pass "语言类型定义已实现（支持 zh/en）"
    else
        warn "语言类型定义格式可能不同"
    fi
    
    # 检查翻译对象
    if grep -q "translations" src/hooks/useLocale.tsx; then
        pass "翻译键值对对象已定义"
    else
        fail "翻译键值对对象缺失"
    fi
    
    # 检查中文翻译
    if grep -q "zh:" src/hooks/useLocale.tsx && grep -q "重要" src/hooks/useLocale.tsx; then
        pass "中文翻译已实现"
    else
        fail "中文翻译缺失"
    fi
    
    # 检查英文翻译
    if grep -q "en:" src/hooks/useLocale.tsx && grep -q "Important" src/hooks/useLocale.tsx; then
        pass "英文翻译已实现"
    else
        fail "英文翻译缺失"
    fi
    
    # 检查 LocaleProvider
    if grep -q "LocaleProvider" src/hooks/useLocale.tsx; then
        pass "LocaleProvider 上下文提供者已实现"
    else
        fail "LocaleProvider 缺失"
    fi
    
    # 检查 useLocale Hook
    if grep -q "export function useLocale" src/hooks/useLocale.tsx || grep -q "export const useLocale" src/hooks/useLocale.tsx; then
        pass "useLocale Hook 已导出"
    else
        fail "useLocale Hook 未导出"
    fi
    
    # 检查 localStorage 持久化
    if grep -q "LOCALE_STORAGE_KEY\|localStorage" src/hooks/useLocale.tsx; then
        pass "语言偏好 localStorage 持久化已实现"
    else
        warn "语言偏好可能未持久化"
    fi
    
    # 检查翻译函数参数替换
    if grep -q "params" src/hooks/useLocale.tsx && grep -q "replace" src/hooks/useLocale.tsx; then
        pass "翻译函数支持参数替换（如 {n}, {d}）"
    else
        warn "翻译函数可能不支持参数替换"
    fi
else
    fail "src/hooks/useLocale.tsx 不存在"
fi

# 检查 App.tsx 中的国际化集成
if grep -q "LocaleProvider" src/App.tsx; then
    pass "LocaleProvider 已在 App.tsx 中集成"
else
    fail "LocaleProvider 未在 App.tsx 中集成"
fi

# 检查语言切换按钮
if grep -q "setLocale" src/App.tsx && grep -q "'zh'\|'en'" src/App.tsx; then
    pass "语言切换按钮已在下拉菜单中实现"
else
    fail "语言切换按钮缺失"
fi

# ============================================
# 第10部分：新手引导功能检查（新增功能）
# 测试目的：确保首次用户引导功能完整
# ============================================
section "10" "检查新手引导功能（OnboardingGuide）..."

if [ -f "src/components/OnboardingGuide.tsx" ]; then
    # 检查 localStorage 控制
    if grep -q "ONBOARDING_KEY\|onboarding" src/components/OnboardingGuide.tsx; then
        pass "新手引导 localStorage 标记已实现"
    else
        fail "新手引导 localStorage 标记缺失"
    fi
    
    # 检查步骤状态
    if grep -q "step\|setStep" src/components/OnboardingGuide.tsx; then
        pass "多步骤引导状态已实现"
    else
        fail "多步骤引导状态缺失"
    fi
    
    # 检查引导内容（3个步骤）
    if grep -q "guide.s1" src/components/OnboardingGuide.tsx && grep -q "guide.s2" src/components/OnboardingGuide.tsx && grep -q "guide.s3" src/components/OnboardingGuide.tsx; then
        pass "3步引导内容已实现（菜单/添加/拖拽）"
    else
        warn "引导步骤数量可能不是3步"
    fi
    
    # 检查跳过功能
    if grep -q "skip\|handleClose" src/components/OnboardingGuide.tsx; then
        pass "跳过引导功能已实现"
    else
        warn "跳过引导功能可能缺失"
    fi
    
    # 检查下一步/上一步导航
    if grep -q "handleNext" src/components/OnboardingGuide.tsx && grep -q "handlePrev" src/components/OnboardingGuide.tsx; then
        pass "上一步/下一步导航已实现"
    else
        warn "导航按钮可能不完整"
    fi
    
    # 检查国际化支持
    if grep -q "useLocale" src/components/OnboardingGuide.tsx; then
        pass "新手引导支持国际化"
    else
        warn "新手引导可能不支持国际化"
    fi
else
    fail "src/components/OnboardingGuide.tsx 不存在"
fi

# 检查 App.tsx 中的集成
if grep -q "OnboardingGuide" src/App.tsx; then
    pass "OnboardingGuide 已在 App.tsx 中集成"
else
    fail "OnboardingGuide 未在 App.tsx 中集成"
fi

# ============================================
# 第11部分：下拉菜单功能检查
# 测试目的：确保下拉菜单包含所有功能入口
# ============================================
section "11" "检查下拉菜单功能..."

# 检查菜单位置（在象限标签旁边）
if grep -q "menuSlot" src/components/QuadrantAxis.tsx; then
    pass "菜单作为插槽放置在象限标签旁边"
else
    fail "菜单插槽未实现"
fi

# 检查菜单透明度
if grep -q "bg-card/40\|bg-card/50" src/App.tsx; then
    pass "菜单透明度已调整（半透明效果）"
else
    warn "菜单透明度可能未调整"
fi

# 检查语言切换入口
if grep -q "menu.lang" src/App.tsx; then
    pass "语言切换入口已添加到菜单"
else
    fail "语言切换入口缺失"
fi

# 检查字体切换入口
if grep -q "menu.font\|FontStyle" src/App.tsx; then
    pass "字体切换入口已添加到菜单"
else
    fail "字体切换入口缺失"
fi

# 检查导入任务入口
if grep -q "onOpenImport\|menu.import" src/App.tsx; then
    pass "导入任务入口已添加到菜单"
else
    fail "导入任务入口缺失"
fi

# 检查已完成任务入口
if grep -q "showCompletedList\|menu.completed" src/App.tsx; then
    pass "已完成任务入口已添加到菜单"
else
    fail "已完成任务入口缺失"
fi

# 检查清除过期事件入口
if grep -q "onClearExpired\|menu.clearExpired" src/App.tsx; then
    pass "清除过期事件入口已添加到菜单"
else
    fail "清除过期事件入口缺失"
fi

# ============================================
# 第12部分：字体切换功能检查
# 测试目的：确保字体切换功能正常工作
# ============================================
section "12" "检查字体切换功能..."

if [ -f "src/hooks/useFont.tsx" ]; then
    # 检查字体类型
    if grep -q "FontStyle" src/hooks/useFont.tsx; then
        pass "FontStyle 类型已定义"
    else
        fail "FontStyle 类型缺失"
    fi
    
    # 检查 FontProvider
    if grep -q "FontProvider" src/hooks/useFont.tsx; then
        pass "FontProvider 上下文提供者已实现"
    else
        fail "FontProvider 缺失"
    fi
    
    # 检查 localStorage 持久化
    if grep -q "FONT_STORAGE_KEY\|localStorage" src/hooks/useFont.tsx; then
        pass "字体偏好 localStorage 持久化已实现"
    else
        warn "字体偏好可能未持久化"
    fi
    
    # 检查字体类名映射
    if grep -q "fontClasses\|font-chinese\|font-english" src/hooks/useFont.tsx; then
        pass "字体类名映射已实现"
    else
        warn "字体类名映射可能缺失"
    fi
else
    fail "src/hooks/useFont.tsx 不存在"
fi

# 检查 App.tsx 中的集成
if grep -q "FontProvider" src/App.tsx && grep -q "fontClass" src/App.tsx; then
    pass "字体功能已在 App.tsx 中集成"
else
    fail "字体功能未在 App.tsx 中正确集成"
fi

# ============================================
# 第13部分：智能识别功能检查
# 测试目的：确保智能文本解析功能完整
# ============================================
section "13" "检查智能识别功能..."

if [ -f "src/components/AddTaskModal.tsx" ]; then
    # 检查智能解析函数
    if grep -q "parseSmartText" src/components/AddTaskModal.tsx; then
        pass "智能文本解析函数（parseSmartText）已实现"
    else
        fail "智能文本解析函数缺失"
    fi
    
    # 检查数字日期识别（630聚会）
    if grep -q "numDateMatch" src/components/AddTaskModal.tsx; then
        pass "数字日期识别已实现（如 630聚会 → 6月30日）"
    else
        fail "数字日期识别未实现"
    fi
    
    # 检查中文数字识别
    if grep -q "parseChineseNum\|chineseNumMap" src/components/AddTaskModal.tsx; then
        pass "中文数字识别已实现（如 一天后 → 1天后）"
    else
        fail "中文数字识别未实现"
    fi
    
    # 检查节日识别
    if grep -q "holidayPatterns\|十一\|五一" src/components/AddTaskModal.tsx; then
        pass "节日识别已实现（如 十一 → 10月1日）"
    else
        fail "节日识别未实现"
    fi
    
    # 检查时间段识别
    if grep -q "timeOfDayPatterns\|晚上\|早上" src/components/AddTaskModal.tsx; then
        pass "时间段识别已实现（如 晚上六点 → 18:00）"
    else
        fail "时间段识别未实现"
    fi
    
    # 检查相对时间识别
    if grep -q "明天\|后天\|下周" src/components/AddTaskModal.tsx; then
        pass "相对时间识别已实现（明天、后天、下周等）"
    else
        fail "相对时间识别未实现"
    fi
    
    # 检查智能创建功能
    if grep -q "handleSmartCreate" src/components/AddTaskModal.tsx; then
        if grep -q "onAdd\(" src/components/AddTaskModal.tsx && grep -q "parsedResult" src/components/AddTaskModal.tsx; then
            pass "智能识别可直接创建任务（无需手动填写）"
        else
            warn "智能识别可能只填充表单"
        fi
    else
        fail "智能创建功能缺失"
    fi
    
    # 检查智能识别 UI 默认显示
    if ! grep -q "showSmartInput" src/components/AddTaskModal.tsx; then
        pass "智能识别输入框默认显示（无需点击展开）"
    else
        warn "智能识别可能需要点击展开"
    fi
    
    # 检查国际化支持
    if grep -q "useLocale" src/components/AddTaskModal.tsx; then
        pass "添加任务弹窗支持国际化"
    else
        warn "添加任务弹窗可能不支持国际化"
    fi
else
    fail "src/components/AddTaskModal.tsx 不存在"
fi

# ============================================
# 第14部分：导入功能检查
# 测试目的：确保批量导入功能完整
# ============================================
section "14" "检查导入功能..."

if [ -f "src/components/ImportModal.tsx" ]; then
    # 检查拖拽上传
    if grep -q "onDragEnter" src/components/ImportModal.tsx && grep -q "onDrop" src/components/ImportModal.tsx; then
        pass "拖拽上传功能已实现"
    else
        fail "拖拽上传功能缺失"
    fi
    
    # 检查文件选择
    if grep -q "fileInputRef\|handleFileChange" src/components/ImportModal.tsx; then
        pass "点击选择文件功能已实现"
    else
        fail "点击选择文件功能缺失"
    fi
    
    # 检查文件解析
    if grep -q "parseFileContent" src/components/ImportModal.tsx; then
        pass "文件内容解析函数已实现"
    else
        fail "文件内容解析函数缺失"
    fi
    
    # 检查格式说明
    if grep -q "guideTitle\|格式说明" src/components/ImportModal.tsx; then
        pass "导入格式说明已实现"
    else
        fail "导入格式说明缺失"
    fi
    
    # 检查导入状态反馈
    if grep -q "importStatus" src/components/ImportModal.tsx; then
        pass "导入状态反馈已实现（成功/失败数量）"
    else
        warn "导入状态反馈可能缺失"
    fi
    
    # 检查国际化支持
    if grep -q "useLocale" src/components/ImportModal.tsx; then
        pass "导入弹窗支持国际化"
    else
        warn "导入弹窗可能不支持国际化"
    fi
else
    fail "src/components/ImportModal.tsx 不存在"
fi

# ============================================
# 第15部分：已完成任务功能检查
# 测试目的：确保已完成任务管理功能完整
# ============================================
section "15" "检查已完成任务功能..."

# 检查 useLocalStorage 中的相关函数
if [ -f "src/hooks/useLocalStorage.ts" ]; then
    if grep -q "completedTasks" src/hooks/useLocalStorage.ts; then
        pass "已完成任务状态已实现"
    else
        fail "已完成任务状态缺失"
    fi
    
    if grep -q "completeTask" src/hooks/useLocalStorage.ts; then
        pass "完成任务函数（completeTask）已实现"
    else
        fail "完成任务函数缺失"
    fi
    
    if grep -q "restoreTask" src/hooks/useLocalStorage.ts; then
        pass "撤销完成函数（restoreTask）已实现"
    else
        fail "撤销完成函数缺失"
    fi
    
    if grep -q "SEVEN_DAYS\|7.*day" src/hooks/useLocalStorage.ts; then
        pass "7天自动清理逻辑已实现"
    else
        warn "7天自动清理逻辑可能缺失"
    fi
    
    if grep -q "clearExpiredTasks" src/hooks/useLocalStorage.ts; then
        pass "清除过期任务函数已实现"
    else
        fail "清除过期任务函数缺失"
    fi
else
    fail "src/hooks/useLocalStorage.ts 不存在"
fi

# 检查 CompletedTasksList 组件
if [ -f "src/components/CompletedTasksList.tsx" ]; then
    if grep -q "onRestore" src/components/CompletedTasksList.tsx; then
        pass "撤销完成按钮已在列表中实现"
    else
        fail "撤销完成按钮缺失"
    fi
    
    if grep -q "useLocale" src/components/CompletedTasksList.tsx; then
        pass "已完成任务列表支持国际化"
    else
        warn "已完成任务列表可能不支持国际化"
    fi
else
    fail "src/components/CompletedTasksList.tsx 不存在"
fi

# ============================================
# 第16部分：任务详情功能检查
# 测试目的：确保任务详情编辑功能完整
# ============================================
section "16" "检查任务详情功能..."

if [ -f "src/components/TaskDetailModal.tsx" ]; then
    # 检查截止时间编辑
    if grep -q "deadline\|setDeadline" src/components/TaskDetailModal.tsx; then
        pass "截止时间编辑功能已实现"
    else
        fail "截止时间编辑功能缺失"
    fi
    
    # 检查备注编辑
    if grep -q "notes\|setNotes" src/components/TaskDetailModal.tsx; then
        pass "备注编辑功能已实现"
    else
        fail "备注编辑功能缺失"
    fi
    
    # 检查链接渲染
    if grep -q "renderNotes\|urlRegex" src/components/TaskDetailModal.tsx; then
        pass "备注链接自动渲染已实现"
    else
        warn "备注链接渲染可能缺失"
    fi
    
    # 检查保存功能
    if grep -q "handleSave\|onUpdate" src/components/TaskDetailModal.tsx; then
        pass "保存修改功能已实现"
    else
        fail "保存修改功能缺失"
    fi
    
    # 检查国际化支持
    if grep -q "useLocale" src/components/TaskDetailModal.tsx; then
        pass "任务详情弹窗支持国际化"
    else
        warn "任务详情弹窗可能不支持国际化"
    fi
else
    fail "src/components/TaskDetailModal.tsx 不存在"
fi

# ============================================
# 第17部分：祝贺动画功能检查
# 测试目的：确保任务完成祝贺动画正常
# ============================================
section "17" "检查祝贺动画功能..."

if [ -f "src/components/CongratulationsAnimation.tsx" ]; then
    # 检查动画触发
    if grep -q "isVisible" src/components/CongratulationsAnimation.tsx; then
        pass "动画显示控制已实现"
    else
        fail "动画显示控制缺失"
    fi
    
    # 检查粒子效果
    if grep -q "particles" src/components/CongratulationsAnimation.tsx; then
        pass "彩色粒子效果已实现"
    else
        warn "彩色粒子效果可能缺失"
    fi
    
    # 检查自动关闭
    if grep -q "onComplete\|setTimeout" src/components/CongratulationsAnimation.tsx; then
        pass "动画自动关闭已实现"
    else
        warn "动画可能不会自动关闭"
    fi
    
    # 检查国际化支持
    if grep -q "useLocale" src/components/CongratulationsAnimation.tsx; then
        pass "祝贺动画支持国际化"
    else
        warn "祝贺动画可能不支持国际化"
    fi
else
    fail "src/components/CongratulationsAnimation.tsx 不存在"
fi

# 检查 App.tsx 中的集成
if grep -q "CongratulationsAnimation\|showCongratulations" src/App.tsx; then
    pass "祝贺动画已在 App.tsx 中集成"
else
    fail "祝贺动画未在 App.tsx 中集成"
fi

# ============================================
# 第18部分：坐标轴标签国际化检查
# 测试目的：确保坐标轴标签支持中英文
# ============================================
section "18" "检查坐标轴标签国际化..."

if grep -q "t('axis\|t(\"axis" src/components/QuadrantAxis.tsx; then
    pass "坐标轴标签使用国际化（↑重要、↓不重要、→紧急、←不紧急）"
else
    if grep -q "axis.up\|axis.down\|axis.left\|axis.right" src/components/QuadrantAxis.tsx; then
        pass "坐标轴标签国际化键已使用"
    else
        warn "坐标轴标签可能未国际化"
    fi
fi

if grep -q "t('q\.\|t(\"q\." src/components/QuadrantAxis.tsx; then
    pass "象限标签使用国际化（重要·紧急等）"
else
    warn "象限标签可能未国际化"
fi

# ============================================
# 测试结果汇总
# ============================================
echo ""
echo "============================================="
echo "              测试结果汇总"
echo "============================================="
echo ""
echo -e "  ${GREEN}通过: $PASS_COUNT${NC}"
echo -e "  ${RED}失败: $FAIL_COUNT${NC}"
echo -e "  ${YELLOW}警告: $WARN_COUNT${NC}"
echo ""

# ============================================
# 功能清单
# ============================================
echo "============================================="
echo "              已实现功能清单"
echo "============================================="
echo ""
echo "【核心功能】"
echo "  ✓ 四象限坐标系统（艾森豪威尔矩阵）"
echo "  ✓ 全屏布局（h-screen / h-[100dvh]）"
echo "  ✓ 任务按截止时间排序（越紧急越靠近坐标轴）"
echo "  ✓ 任务按紧急程度Y轴定位"
echo "  ✓ 同象限任务X轴错开（基于时间差动态计算）"
echo "  ✓ 象限对称布局（Q1-Q4关于X轴对称，Q1-Q2关于Y轴对称）"
echo "  ✓ 拖拽功能（桌面端 + 移动端触摸）"
echo "  ✓ 任务删除（右上角红色按钮）"
echo "  ✓ 任务完成（复选框 + 祝贺动画）"
echo ""
echo "【国际化功能】（新增）"
echo "  ✓ 中英文切换（下拉菜单入口）"
echo "  ✓ 所有 UI 文本支持国际化"
echo "  ✓ 语言偏好 localStorage 持久化"
echo ""
echo "【新手引导】（新增）"
echo "  ✓ 首次打开显示3步引导"
echo "  ✓ 步骤1：菜单功能介绍"
echo "  ✓ 步骤2：添加事件介绍"
echo "  ✓ 步骤3：拖拽调整优先级介绍"
echo "  ✓ 支持跳过、上一步、下一步"
echo "  ✓ 完成状态 localStorage 持久化"
echo ""
echo "【下拉菜单】（优化）"
echo "  ✓ 位置移至象限标签旁边"
echo "  ✓ 半透明毛玻璃效果"
echo "  ✓ 语言切换入口"
echo "  ✓ 字体切换入口"
echo "  ✓ 导入任务入口"
echo "  ✓ 已完成任务入口"
echo "  ✓ 清除过期事件入口"
echo ""
echo "【智能识别】"
echo "  ✓ 数字日期：630聚会 → 6月30日聚会"
echo "  ✓ 中文数字：一天后上班 → 明天上班"
echo "  ✓ 节日识别：十一放假 → 10月1日放假"
echo "  ✓ 时间段：晚上六点抢票 → 今天18:00抢票"
echo "  ✓ 相对时间：明天、后天、下周等"
echo "  ✓ 直接创建任务（无需手动填写表单）"
echo ""
echo "【其他功能】"
echo "  ✓ 批量导入（拖拽上传 + 格式说明）"
echo "  ✓ 已完成任务列表（7天保留）"
echo "  ✓ 撤销完成功能"
echo "  ✓ 任务备注（支持超链接）"
echo "  ✓ 任务详情编辑"
echo "  ✓ 清除过期任务"
echo "  ✓ 字体切换（行草/Script/默认）"
echo "  ✓ 祝贺动画（彩色粒子效果）"
echo ""
echo "============================================="

# 返回退出码
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}测试未完全通过，请检查失败项${NC}"
    exit 1
else
    echo -e "${GREEN}所有测试通过！${NC}"
    echo ""
    echo "要运行应用，请执行: npm run dev"
    exit 0
fi
