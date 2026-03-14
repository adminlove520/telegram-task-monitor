---
name: telegram-task-monitor
version: 1.0.0
description: Telegram 任务监控 - 在 Telegram 频道/群组中实时显示 subagent 任务执行状态，支持 Thread 模式
author: 小溪
license: MIT
keywords:
  - telegram
  - task
  - monitor
  - subagent
  - channel
---

# 📱 Telegram Task Monitor

> 在 Telegram 频道/群组中实时显示 subagent 任务执行状态
> 支持 Thread 模式，按任务隔离消息

---

## 🏗️ 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        小隐 (主 Agent)                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              TelegramTaskMonitor                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ subagent-1  │  │ subagent-2  │  │ subagent-3  │  │  │
│  │  │  (🔍调研)    │  │  (✍️写作)    │  │  (🎨设计)    │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │  │
│  │         │                  │                  │         │  │
│  │         └──────────────────┼──────────────────┘         │  │
│  │                            │                            │  │
│  │                     ┌──────┴──────┐                     │  │
│  │                     │ TaskTracker │                     │  │
│  │                     └──────┬──────┘                     │  │
│  └─────────────────────────────┼────────────────────────────┘  │
│                                │                              │
└────────────────────────────────┼──────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │   Telegram Bot API      │
                    │   (发送消息/创建Thread) │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │   Telegram 频道        │
                    │   ┌─────────────────┐  │
                    │   │ 🧵 任务1: 写博客 │  │
                    │   │   ├── 🔍 agent1  │  │
                    │   │   ├── ✍️ agent2  │  │
                    │   │   └── 🎨 agent3  │  │
                    │   └─────────────────┘  │
                    │   ┌─────────────────┐  │
                    │   │ 🧵 任务2: 做海报 │  │
                    │   │   └── 🎨 agent1  │  │
                    │   └─────────────────┘  │
                    └─────────────────────────┘
```

---

## 🔄 流程图

```
                    ┌──────────────────┐
                    │  主人发起任务     │
                    │  "帮我写一篇博客"  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  startTask()     │
                    │  创建任务对象      │
                    │  分配 taskId     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ 创建 Telegram     │
                    │ Thread (可选)    │
                    └────────┬─────────┘
                             │
                             ▼
              ┌─────────────┴─────────────┐
              │        并行执行             │
              │  ┌────────┐ ┌────────┐  │
              │  │agent-1 │ │agent-2 │  │
              │  │  🔍   │ │  ✍️   │  │
              │  └────┬──┘ └────┬──┘  │
              │       │         │       │
              │       └────┬────┘       │
              │            ▼            │
              │  ┌──────────────────┐  │
              │  │   report()      │  │
              │  │ 报告任务状态      │  │
              │  └────────┬─────────┘  │
              └───────────┼────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  发送 Telegram 消息    │
              │  📋 agent: 状态更新 ✓ │
              └───────────┬───────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  所有 agent 完成？     │
              └───────────┬───────────────┘
                    │     │
                    │Yes  │No
                    ▼     │
              ┌────┴─┐   │
              │完成  │   │
              │任务  │   │
              └──┬───┘   │
               │       │
               ▼       │
          ┌────┴────┐
          │ 📊 任务  │
          │ 统计面板 │
          └─────────┘
```

---

## ✨ 核心功能

- 📋 **任务追踪** - 实时显示每个 subagent 状态
- 🧵 **Thread 模式** - 按任务创建独立讨论串
- 📊 **任务看板** - 实时汇总所有任务状态
- ⏱️ **耗时统计** - 记录任务完成时间

---

## 🚀 快速开始

### 安装

```bash
git clone https://github.com/adminlove520/telegram-task-monitor.git
cd telegram-task-monitor
npm install
```

### 配置

```javascript
const TelegramTaskMonitor = require('./telegram-monitor');

const monitor = new TelegramTaskMonitor({
  botToken: 'YOUR_BOT_TOKEN',
  chatId: 'YOUR_CHANNEL_ID',
  useThread: true  // 开启 Thread 模式
});
```

---

## 📋 使用示例

### 1. 初始化

```javascript
const TelegramTaskMonitor = require('./telegram-monitor');

const monitor = new TelegramTaskMonitor({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID,
  useThread: true
});
```

### 2. 启动任务

```javascript
// 主人发起任务
const taskId = await monitor.startTask({
  name: '写一篇AI博客',
  description: '关于AI Agent的最新发展',
  agents: [
    { name: 'researcher', emoji: '🔍', role: '调研' },
    { name: 'writer', emoji: '✍️', role: '写作' },
    { name: 'designer', emoji: '🎨', role: '设计' }
  ]
});

console.log('任务ID:', taskId);
```

### 3. Subagent 报告

```javascript
// Subagent-1 完成调研
await monitor.report({
  taskId: taskId,
  agentName: 'researcher',
  status: 'complete',
  result: '找到了10篇高质量参考文章'
});

// Subagent-2 完成写作
await monitor.report({
  taskId: taskId,
  agentName: 'writer',
  status: 'complete',
  result: '博客大纲+正文已完成'
});

// Subagent-3 完成设计
await monitor.report({
  taskId: taskId,
  agentName: 'designer',
  status: 'complete',
  result: '封面图+内文配图已完成'
});
```

### 4. 完成任务

```javascript
// 所有 subagent 完成后自动调用
await monitor.completeTask(taskId);
```

---

## 📱 消息格式

### 任务开始

```
📋 任务: 写一篇AI博客
├── 🔍 researcher: 等待中
├── ✍️ writer: 等待中
└── 🎨 designer: 等待中

🔄 状态: 进行中
```

### 状态更新

```
🔍 researcher: 找到了10篇参考文章 ✓
✍️ writer: 博客大纲已完成 ✓
🎨 designer: 封面图设计完成 ✓
```

### 任务完成

```
📋 任务: 写一篇AI博客
├── 🔍 researcher: 找到10篇参考文章 ✓ (30秒)
├── ✍️ writer: 博客完成 ✓ (2分钟)
└── 🎨 designer: 配图完成 ✓ (1分钟)

✅ 完成！总耗时: 3分30秒
```

---

## 🔧 进阶配置

### 完整配置

```javascript
const monitor = new TelegramTaskMonitor({
  botToken: 'xxx',
  chatId: 'xxx',
  useThread: true,           // 开启 Thread 模式
  parseMode: 'Markdown',    // 消息格式
  silent: false              // 是否静默推送
});
```

### Agent 配置

```javascript
const agents = [
  { name: 'researcher', emoji: '🔍', role: '调研', color: '绿色' },
  { name: 'writer', emoji: '✍️', role: '写作', color: '蓝色' },
  { name: 'coder', emoji: '💻', role: '编程', color: '紫色' },
  { name: 'designer', emoji: '🎨', role: '设计', color: '粉色' },
  { name: 'tester', emoji: '🧪', role: '测试', color: '橙色' },
  { name: 'reviewer', emoji: '✅', role: '审核', color: '青色' }
];
```

---

## 📊 任务看板

```
┌─────────────────────────────────────────────┐
│         🦞 小隐任务大厅 - 实时看板          │
├─────────────────────────────────────────────┤
│ 📋 进行中任务: 2                           │
│   ├── 任务1: 写博客       🔄 2/3 agent     │
│   │   ├── 🔍 researcher  ✓               │
│   │   ├── ✍️ writer     🔄               │
│   │   └── 🎨 designer    ⏳               │
│   │                                       │
│   └── 任务2: 做海报       🔄 1/2 agent     │
│       └── 🎨 designer    ✓                │
├─────────────────────────────────────────────┤
│ ✅ 已完成任务: 15                          │
│   ├── 任务: 写代码       3分钟             │
│   └── 任务: 调试bug      5分钟            │
└─────────────────────────────────────────────┘
```

---

## 📁 文件结构

```
telegram-task-monitor/
├── SKILL.md              # 本文档
├── README.md             # 简介
├── telegram-monitor.js   # 核心模块
├── example.js           # 使用示例
└── package.json
```

---

## 📝 更新日志

See [CHANGELOG.md](./CHANGELOG.md)

---

## 📄 许可证

MIT

---

**🦞 让任务清晰可见！**
