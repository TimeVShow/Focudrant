# Focudrant - 四象限聚焦式任务管理

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-4.5-purple?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-3.3-blue?logo=tailwindcss" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

<p align="center">
  基于艾森豪威尔矩阵（四象限法则）的可视化任务管理应用，聚焦重点、高效执行。<br/>
  <strong>Focus</strong> + <strong>Quadrant</strong> = <strong>Focudrant</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#使用指南">使用指南</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#项目结构">项目结构</a>
</p>

---

## 功能特性

### 核心功能

- **四象限可视化** - 基于艾森豪威尔矩阵，将任务分为四个象限管理
  - 重要且紧急（右上）→ 立即处理
  - 重要不紧急（左上）→ 计划安排
  - 紧急不重要（右下）→ 委托他人
  - 不重要不紧急（左下）→ 适当放弃

- **智能定位** - 任务根据截止时间和紧急程度自动定位
  - 截止时间越近，越靠近坐标轴
  - 同象限任务基于时间差智能错开

- **拖拽调整** - 支持桌面端拖拽和移动端触摸拖拽
  - 长按或拖拽卡片到不同象限
  - 实时更新任务优先级

### 智能识别

支持自然语言快速创建任务：

| 输入示例 | 识别结果 |
|---------|---------|
| `630聚会` | 6月30日 18:00 聚会 |
| `一天后开会` | 明天 18:00 开会 |
| `十一放假` | 10月1日 18:00 放假 |
| `晚上六点抢票` | 今天 18:00 抢票 |
| `明天下午三点面试` | 明天 15:00 面试 |

### 国际化支持

- 中文 / English 双语切换
- 所有界面文本支持国际化
- 语言偏好自动保存

### 新手引导

- 首次使用时显示交互式引导
- 3 步快速了解核心功能
- 支持跳过和步骤导航

### 更多功能

| 功能 | 描述 |
|-----|------|
| 字体切换 | 行草 / Script / 默认三种风格 |
| 批量导入 | 支持 TXT 文件拖拽导入 |
| 已完成任务 | 7 天内完成记录，支持撤销 |
| 任务备注 | 支持超链接自动识别 |
| 清除过期 | 一键清除已过期任务 |
| 祝贺动画 | 完成任务时的彩色粒子效果 |
| 本地存储 | 数据保存在浏览器，隐私安全 |

## 快速开始

### 环境要求

- Node.js >= 16.0
- npm >= 7.0 或 yarn >= 1.22

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/quadrant-todo.git
cd quadrant-todo

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 测试

```bash
# 运行功能测试脚本
chmod +x test.sh
./test.sh
```

## 使用指南

### 添加任务

1. 点击坐标轴中心的 **+** 按钮
2. 使用智能识别输入（如 `明天开会`）或手动填写表单
3. 点击「添加事件」完成创建

### 调整优先级

- **桌面端**：拖拽任务卡片到目标象限
- **移动端**：长按任务卡片后拖动

### 完成任务

- 点击任务卡片上的复选框标记完成
- 在「已完成任务」列表中可撤销

### 批量导入

支持 TXT 文件导入，格式如下：

```
任务标题|截止时间|重要程度|备注
完成报告|2026-02-10|高|需要提交给领导
买菜|明天|低|
开会|3天后|中|线上会议
```

## 技术栈

| 类别 | 技术 |
|-----|------|
| 框架 | React 18 |
| 语言 | TypeScript 5 |
| 构建 | Vite 4 |
| 样式 | Tailwind CSS 3 |
| 状态 | React Hooks + Context |
| 存储 | LocalStorage |
| 国际化 | 自定义 useLocale Hook |

## 项目结构

```
src/
├── components/                 # UI 组件
│   ├── AddTaskModal.tsx       # 添加任务弹窗（含智能识别）
│   ├── CompletedTasksList.tsx # 已完成任务列表
│   ├── CongratulationsAnimation.tsx # 祝贺动画
│   ├── ImportModal.tsx        # 批量导入弹窗
│   ├── OnboardingGuide.tsx    # 新手引导
│   ├── QuadrantAxis.tsx       # 四象限坐标轴
│   ├── TaskCard.tsx           # 任务卡片
│   └── TaskDetailModal.tsx    # 任务详情编辑
├── hooks/                     # 自定义 Hooks
│   ├── useFont.tsx           # 字体管理
│   ├── useLocale.tsx         # 国际化
│   └── useLocalStorage.ts    # 本地存储
├── types/                     # TypeScript 类型定义
│   └── index.ts
├── App.tsx                    # 应用入口
├── main.tsx                   # 渲染入口
└── index.css                  # 全局样式
```

## 设计理念

本应用遵循以下设计原则：

- **简约** - 专注核心功能，避免功能堆砌
- **直观** - 可视化呈现任务优先级
- **高效** - 智能识别减少输入成本
- **美观** - 现代简约的视觉设计
- **隐私** - 数据本地存储，不上传服务器

## 浏览器支持

| Chrome | Firefox | Safari | Edge |
|--------|---------|--------|------|
| ✅ Latest | ✅ Latest | ✅ Latest | ✅ Latest |

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

## 致谢

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [艾森豪威尔矩阵](https://zh.wikipedia.org/wiki/艾森豪威爾矩陣)

---

<p align="center">
  <strong>Focudrant</strong> - Made with ❤️ for better focus & productivity
</p>
