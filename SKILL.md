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

## ✨ 核心功能

- 📋 任务追踪 - 实时显示每个 subagent 状态
- 🧵 Thread 模式 - 按任务创建独立讨论串
- 📊 任务看板 - 实时汇总所有任务状态
- ⏱️ 耗时统计 - 记录任务完成时间

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
  chatId: 'YOUR_CHANNEL_ID'  // 频道或群组 ID
});
```

---

## 📋 使用示例

### 1. 启动任务

```javascript
// 创建新任务
const taskId = await monitor.startTask({
  name: '写一篇博客',
  description: '关于AI的博客',
  agents: [
    { name: 'researcher', emoji: '🔍' },
    { name: 'writer', emoji: '✍️' },
    { name: 'designer', emoji: '🎨' }
  ]
});
```

### 2. Subagent 报告

```javascript
// Subagent 完成
await monitor.report({
  taskId,
  agentName: 'researcher',
  status: 'complete',
  result: '调研完成，找到了10篇参考文章'
});
```

### 3. 完成任务

```javascript
// 任务全部完成
await monitor.completeTask(taskId);
```

---

## 📱 消息格式

### 任务开始

```
📋 任务: 写一篇博客
├── 🔍 researcher: 进行中
├── ✍️ writer: 等待中
└── 🎨 designer: 等待中

🔄 状态: 进行中
```

### 状态更新

```
🔍 researcher: 调研完成 ✓
```

### 任务完成

```
📋 任务: 写一篇博客
├── 🔍 researcher: 调研完成 ✓ (30秒)
├── ✍️ writer: 写作完成 ✓ (2分钟)
└── 🎨 designer: 配图完成 ✓ (1分钟)

✅ 完成！总耗时: 3分30秒
```

---

## 🧵 Thread 模式

每个任务创建一个独立的 Thread，方便追踪讨论。

```
频道根消息
  ├── 🧵 任务1: 写博客 (Thread)
  ├── 🧵 任务2: 做海报 (Thread)
  └── 🧵 任务3: 写代码 (Thread)
```

---

## 🎯 最佳实践

### Agent 命名规范

```javascript
const agents = [
  { name: 'researcher', emoji: '🔍', role: '调研' },
  { name: 'writer', emoji: '✍️', role: '写作' },
  { name: 'coder', emoji: '💻', role: '编程' },
  { name: 'designer', emoji: '🎨', role: '设计' },
  { name: 'tester', emoji: '🧪', role: '测试' },
  { name: 'reviewer', emoji: '✅', role: '审核' }
];
```

### 状态更新

| 状态 | 描述 |
|------|------|
| pending | 等待中 |
| running | 进行中 |
| complete | 已完成 |
| failed | 失败 |

---

## 📁 文件结构

```
telegram-task-monitor/
├── SKILL.md
├── README.md
├── telegram-monitor.js
└── example.js
```

---

## 📝 更新日志

See [CHANGELOG.md](./CHANGELOG.md)

---

## 📄 许可证

MIT

---

**🦞 让任务清晰可见！**
