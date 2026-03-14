/**
 * 📱 Telegram Task Monitor
 * 在 Telegram 频道中实时显示 subagent 任务状态
 */

const fetch = require('node-fetch');

class TelegramTaskMonitor {
  constructor(options = {}) {
    this.botToken = options.botToken;
    this.chatId = options.chatId;
    this.useThread = options.useThread !== false; // 默认开启 Thread
    this.tasks = new Map();
  }

  /**
   * 发送 Telegram 消息
   */
  async sendMessage(text, replyTo = null) {
    const body = {
      chat_id: this.chatId,
      text: text,
      parse_mode: 'Markdown'
    };
    
    if (replyTo) {
      body.reply_to_message_id = replyTo;
    }
    
    const response = await fetch(
      `https://api.telegram.org/bot${this.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );
    
    return response.json();
  }

  /**
   * 创建新 Thread（频道需要开启 Forum 功能）
   */
  async createThread(name) {
    if (!this.useThread) return null;
    
    const response = await fetch(
      `https://api.telegram.org/bot${this.botToken}/createForumTopic`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          name: name
        })
      }
    );
    
    const data = await response.json();
    return data.ok ? data.result.message_thread_id : null;
  }

  /**
   * 启动任务
   */
  async startTask(taskInfo) {
    const taskId = `task_${Date.now()}`;
    const task = {
      id: taskId,
      name: taskInfo.name,
      description: taskInfo.description || '',
      agents: taskInfo.agents || [],
      status: 'running',
      startTime: Date.now(),
      reports: [],
      messageId: null,
      threadId: null
    };
    
    // 创建 Thread
    if (this.useThread) {
      task.threadId = await this.createThread(taskInfo.name);
    }
    
    this.tasks.set(taskId, task);
    
    // 发送任务消息
    const message = this.formatTaskStart(task);
    const result = await this.sendMessage(message);
    
    if (result.ok) {
      task.messageId = result.result.message_id;
    }
    
    return taskId;
  }

  /**
   * Subagent 报告状态
   */
  async report(reportInfo) {
    const { taskId, agentName, status, result } = reportInfo;
    const task = this.tasks.get(taskId);
    
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }
    
    // 查找 agent 的 emoji
    const agent = task.agents.find(a => a.name === agentName);
    const emoji = agent ? agent.emoji : '🤖';
    
    task.reports.push({
      agentName,
      status,
      result,
      time: Date.now()
    });
    
    // 更新任务消息
    const message = this.formatReport(task, agentName, status, result, emoji);
    await this.sendMessage(message, task.messageId);
    
    // 检查是否全部完成
    if (this.isTaskComplete(task)) {
      await this.completeTask(taskId);
    }
  }

  /**
   * 完成任务
   */
  async completeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return;
    
    task.status = 'completed';
    task.endTime = Date.now();
    task.duration = task.endTime - task.startTime;
    
    const message = this.formatTaskComplete(task);
    await this.sendMessage(message, task.messageId);
  }

  /**
   * 检查任务是否完成
   */
  isTaskComplete(task) {
    return task.agents.every(agent => {
      const report = task.reports.find(r => r.agentName === agent.name);
      return report && report.status === 'complete';
    });
  }

  /**
   * 格式化任务开始消息
   */
  formatTaskStart(task) {
    const agentList = task.agents.map(a => 
      `├── ${a.emoji} ${a.name}: 等待中`
    ).join('\n');
    
    return `📋 任务: ${task.name}\n${agentList}\n\n🔄 状态: 进行中`;
  }

  /**
   * 格式化状态报告
   */
  formatReport(task, agentName, status, result, emoji) {
    const statusIcon = status === 'complete' ? '✓' : '🔄';
    return `${emoji} ${agentName}: ${result} ${statusIcon}`;
  }

  /**
   * 格式化任务完成消息
   */
  formatTaskComplete(task) {
    const duration = Math.round(task.duration / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationStr = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
    
    const reportList = task.reports.map(r => {
      const agent = task.agents.find(a => a.name === r.agentName);
      const emoji = agent ? agent.emoji : '🤖';
      const time = Math.round((r.time - task.startTime) / 1000);
      return `├── ${emoji} ${r.agentName}: ${r.result} ✓ (${time}秒)`;
    }).join('\n');
    
    return `📋 任务: ${task.name}\n${reportList}\n\n✅ 完成！总耗时: ${durationStr}`;
  }

  /**
   * 获取任务看板
   */
  getBoard() {
    const running = [];
    const completed = [];
    
    for (const [id, task] of this.tasks) {
      const taskSummary = {
        id: task.id,
        name: task.name,
        status: task.status,
        duration: task.duration ? Math.round(task.duration / 1000) : null
      };
      
      if (task.status === 'running') {
        running.push(taskSummary);
      } else {
        completed.push(taskSummary);
      }
    }
    
    return { running, completed };
  }
}

module.exports = TelegramTaskMonitor;
