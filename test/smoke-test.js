#!/usr/bin/env node
/**
 * ============================================
 * Focudrant 冒烟测试脚本
 * ============================================
 * 
 * 测试目的：模拟大量随机操作，验证核心业务逻辑的稳定性
 * 
 * 测试内容：
 * 1. 随机添加任务 100 次
 * 2. 随机完成任务 100 次
 * 3. 随机拖动任务至不同象限 400 次
 * 4. 重复执行 100 轮
 * 
 * 验证规则：
 * - 任务数量不超过 MAX_TASKS (100)
 * - 任务位置在有效范围内 (-100 ~ 100)
 * - 完成的任务从列表中移除
 * - 数据一致性保持
 * 
 * 修复说明：
 * - 操作交错执行，更真实模拟用户行为
 * - 确保拖动操作时有可用任务
 * - 正确验证 MAX_TASKS 限制
 */

const MAX_TASKS = 100;
const MAX_ROUNDS = 100;
const ADD_OPS_PER_ROUND = 100;
const COMPLETE_OPS_PER_ROUND = 100;
const DRAG_OPS_PER_ROUND = 400;

// 颜色定义
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// 统计变量
let totalAddAttempts = 0;
let totalAddSuccess = 0;
let totalAddBlocked = 0;
let totalCompleteAttempts = 0;
let totalCompleteSuccess = 0;
let totalCompleteMissed = 0; // 无任务可完成
let totalDragAttempts = 0;
let totalDragSuccess = 0;
let totalDragMissed = 0; // 无任务可拖动
let errors = [];

/**
 * 模拟 useLocalStorage hook 的核心逻辑
 */
class TaskManager {
  constructor() {
    this.tasks = [];
    this.completedTasks = [];
  }

  // 添加任务 - 带数量限制
  addTask(task) {
    if (this.tasks.length >= MAX_TASKS) {
      return { success: false, reason: 'MAX_TASKS_REACHED' };
    }
    
    const newTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    this.tasks.push(newTask);
    return { success: true, task: newTask };
  }

  // 完成任务
  completeTask(id) {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return { success: false, reason: 'TASK_NOT_FOUND' };
    }
    
    const task = this.tasks[taskIndex];
    const completedTask = {
      ...task,
      completedAt: new Date().toISOString()
    };
    
    this.tasks.splice(taskIndex, 1);
    this.completedTasks.push(completedTask);
    return { success: true, task: completedTask };
  }

  // 更新任务位置（拖拽）
  updateTaskPosition(id, x, y) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      return { success: false, reason: 'TASK_NOT_FOUND' };
    }
    
    // 验证位置有效性
    if (x < -100 || x > 100 || y < -100 || y > 100) {
      return { success: false, reason: 'INVALID_POSITION' };
    }
    
    task.x = x;
    task.y = y;
    return { success: true, task };
  }

  // 获取任务数量
  getTaskCount() {
    return this.tasks.length;
  }

  // 获取随机任务
  getRandomTask() {
    if (this.tasks.length === 0) return null;
    return this.tasks[Math.floor(Math.random() * this.tasks.length)];
  }

  // 验证数据一致性
  validateConsistency() {
    const issues = [];
    
    // 检查任务数量不超过上限
    if (this.tasks.length > MAX_TASKS) {
      issues.push(`任务数量 ${this.tasks.length} 超过上限 ${MAX_TASKS}`);
    }
    
    // 检查所有任务都有必要字段
    this.tasks.forEach((task, index) => {
      if (!task.id) issues.push(`任务 ${index} 缺少 id`);
      if (!task.title) issues.push(`任务 ${index} 缺少 title`);
      if (task.x === undefined) issues.push(`任务 ${index} 缺少 x 坐标`);
      if (task.y === undefined) issues.push(`任务 ${index} 缺少 y 坐标`);
      if (task.x < -100 || task.x > 100) issues.push(`任务 ${index} x 坐标超出范围: ${task.x}`);
      if (task.y < -100 || task.y > 100) issues.push(`任务 ${index} y 坐标超出范围: ${task.y}`);
    });
    
    // 检查已完成任务都有 completedAt
    this.completedTasks.forEach((task, index) => {
      if (!task.completedAt) issues.push(`已完成任务 ${index} 缺少 completedAt`);
    });
    
    return issues;
  }
}

/**
 * 生成随机任务数据
 */
function generateRandomTask() {
  const titles = ['开会', '写报告', '代码审查', '测试', '部署', '修复Bug', '需求分析', '设计评审'];
  const importances = ['low', 'medium', 'high', undefined];
  
  const now = new Date();
  const futureDate = new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
  
  return {
    title: titles[Math.floor(Math.random() * titles.length)] + '-' + Math.floor(Math.random() * 1000),
    deadline: futureDate.toISOString().slice(0, 16),
    x: Math.floor(Math.random() * 200) - 100,
    y: Math.floor(Math.random() * 200) - 100,
    importance: importances[Math.floor(Math.random() * importances.length)]
  };
}

/**
 * 生成随机位置（四象限）
 */
function generateRandomPosition() {
  const quadrants = [
    { x: [-100, 0], y: [0, 100] },   // 左上 - 重要不紧急
    { x: [0, 100], y: [0, 100] },    // 右上 - 重要紧急
    { x: [-100, 0], y: [-100, 0] },  // 左下 - 不重要不紧急
    { x: [0, 100], y: [-100, 0] }    // 右下 - 不重要紧急
  ];
  
  const quadrant = quadrants[Math.floor(Math.random() * quadrants.length)];
  return {
    x: Math.floor(Math.random() * (quadrant.x[1] - quadrant.x[0])) + quadrant.x[0],
    y: Math.floor(Math.random() * (quadrant.y[1] - quadrant.y[0])) + quadrant.y[0]
  };
}

/**
 * 创建操作序列
 * 交错排列各种操作，确保拖动操作时有足够的任务
 */
function createOperationSequence() {
  const operations = [];
  
  // 策略：先添加一批任务，然后交错执行拖动和完成操作
  // 第一阶段：添加50个任务（确保有足够的任务池）
  for (let i = 0; i < 50; i++) {
    operations.push({ type: 'add' });
  }
  
  // 第二阶段：交错执行拖动操作和少量完成/添加
  // 200次拖动 + 25次完成 + 25次添加
  const phase2Ops = [];
  for (let i = 0; i < 200; i++) phase2Ops.push({ type: 'drag' });
  for (let i = 0; i < 25; i++) phase2Ops.push({ type: 'complete' });
  for (let i = 0; i < 25; i++) phase2Ops.push({ type: 'add' });
  shuffleArray(phase2Ops);
  operations.push(...phase2Ops);
  
  // 第三阶段：再添加25个任务
  for (let i = 0; i < 25; i++) {
    operations.push({ type: 'add' });
  }
  
  // 第四阶段：交错执行剩余操作
  // 200次拖动 + 50次完成
  const phase4Ops = [];
  for (let i = 0; i < 200; i++) phase4Ops.push({ type: 'drag' });
  for (let i = 0; i < 50; i++) phase4Ops.push({ type: 'complete' });
  shuffleArray(phase4Ops);
  operations.push(...phase4Ops);
  
  // 第五阶段：尝试超限添加（测试 MAX_TASKS 限制）
  // 此时已有约 50+25+25-75 = 25 个任务，再尝试添加足够多以触发限制
  for (let i = 0; i < 100; i++) {
    operations.push({ type: 'add' });
  }
  
  // 第六阶段：完成剩余任务
  for (let i = 0; i < 25; i++) {
    operations.push({ type: 'complete' });
  }
  
  return operations;
}

/**
 * Fisher-Yates 洗牌算法
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * 执行单轮测试 - 交错操作版本
 */
function executeRound(manager, roundNum) {
  let roundErrors = [];
  const operations = createOperationSequence();
  
  for (const op of operations) {
    switch (op.type) {
      case 'add': {
        totalAddAttempts++;
        const taskData = generateRandomTask();
        const result = manager.addTask(taskData);
        
        if (result.success) {
          totalAddSuccess++;
        } else if (result.reason === 'MAX_TASKS_REACHED') {
          totalAddBlocked++;
        } else {
          roundErrors.push(`Round ${roundNum}: 添加任务失败 - ${result.reason}`);
        }
        break;
      }
      
      case 'complete': {
        totalCompleteAttempts++;
        const task = manager.getRandomTask();
        
        if (task) {
          const result = manager.completeTask(task.id);
          if (result.success) {
            totalCompleteSuccess++;
          }
        } else {
          totalCompleteMissed++;
        }
        break;
      }
      
      case 'drag': {
        totalDragAttempts++;
        const task = manager.getRandomTask();
        
        if (task) {
          const newPos = generateRandomPosition();
          const result = manager.updateTaskPosition(task.id, newPos.x, newPos.y);
          
          if (result.success) {
            totalDragSuccess++;
            
            // 验证位置确实被更新
            if (task.x !== newPos.x || task.y !== newPos.y) {
              roundErrors.push(`Round ${roundNum}: 位置更新不一致 - 期望 (${newPos.x}, ${newPos.y}), 实际 (${task.x}, ${task.y})`);
            }
          } else if (result.reason !== 'TASK_NOT_FOUND') {
            roundErrors.push(`Round ${roundNum}: 拖动任务失败 - ${result.reason}`);
          }
        } else {
          totalDragMissed++;
        }
        break;
      }
    }
  }
  
  // 验证数据一致性
  const consistencyIssues = manager.validateConsistency();
  if (consistencyIssues.length > 0) {
    roundErrors.push(...consistencyIssues.map(issue => `Round ${roundNum}: ${issue}`));
  }
  
  return roundErrors;
}

/**
 * 打印进度条
 */
function printProgress(current, total, label) {
  const percentage = Math.floor((current / total) * 100);
  const filled = Math.floor(percentage / 2);
  const empty = 50 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  process.stdout.write(`\r  ${label}: [${bar}] ${percentage}% (${current}/${total})`);
}

/**
 * 主函数
 */
async function main() {
  console.log('');
  console.log('=============================================');
  console.log('  Focudrant 冒烟测试');
  console.log('=============================================');
  console.log('');
  console.log(`${colors.blue}【测试配置】${colors.reset}`);
  console.log(`  - 测试轮数: ${MAX_ROUNDS}`);
  console.log(`  - 每轮添加操作: ~${ADD_OPS_PER_ROUND + 100} (含超限测试)`);
  console.log(`  - 每轮完成操作: ${COMPLETE_OPS_PER_ROUND}`);
  console.log(`  - 每轮拖动操作: ${DRAG_OPS_PER_ROUND}`);
  console.log(`  - 任务数量上限: ${MAX_TASKS}`);
  console.log(`  - 操作模式: 交错执行`);
  console.log('');
  console.log(`${colors.blue}【开始测试】${colors.reset}`);
  console.log('');

  const startTime = Date.now();
  
  // 执行测试轮次
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    // 每轮创建新的 TaskManager 实例（模拟新会话）
    const manager = new TaskManager();
    
    const roundErrors = executeRound(manager, round);
    errors.push(...roundErrors);
    
    printProgress(round, MAX_ROUNDS, '测试进度');
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n');
  console.log(`${colors.blue}【测试结果】${colors.reset}`);
  console.log('');
  
  // 添加操作统计
  const addSuccessRate = ((totalAddSuccess / totalAddAttempts) * 100).toFixed(1);
  console.log('  添加任务操作:');
  console.log(`    ${colors.green}✓${colors.reset} 成功: ${totalAddSuccess} (${addSuccessRate}%)`);
  console.log(`    ${colors.yellow}⚠${colors.reset} 被限制: ${totalAddBlocked} (符合预期 - 达到上限)`);
  console.log(`    总计尝试: ${totalAddAttempts}`);
  console.log('');
  
  // 完成操作统计
  const completeSuccessRate = totalCompleteAttempts > 0 
    ? ((totalCompleteSuccess / totalCompleteAttempts) * 100).toFixed(1) 
    : '0.0';
  console.log('  完成任务操作:');
  console.log(`    ${colors.green}✓${colors.reset} 成功: ${totalCompleteSuccess} (${completeSuccessRate}%)`);
  console.log(`    ${colors.yellow}○${colors.reset} 无任务可完成: ${totalCompleteMissed}`);
  console.log(`    总计尝试: ${totalCompleteAttempts}`);
  console.log('');
  
  // 拖动操作统计
  const dragSuccessRate = totalDragAttempts > 0 
    ? ((totalDragSuccess / totalDragAttempts) * 100).toFixed(1) 
    : '0.0';
  console.log('  拖动任务操作:');
  console.log(`    ${colors.green}✓${colors.reset} 成功: ${totalDragSuccess} (${dragSuccessRate}%)`);
  console.log(`    ${colors.yellow}○${colors.reset} 无任务可拖动: ${totalDragMissed}`);
  console.log(`    总计尝试: ${totalDragAttempts}`);
  console.log('');
  
  // 错误统计
  if (errors.length > 0) {
    console.log(`  ${colors.red}发现错误: ${errors.length}${colors.reset}`);
    console.log('');
    // 只显示前10个错误
    const displayErrors = errors.slice(0, 10);
    displayErrors.forEach(err => {
      console.log(`    ${colors.red}✗${colors.reset} ${err}`);
    });
    if (errors.length > 10) {
      console.log(`    ... 还有 ${errors.length - 10} 个错误`);
    }
    console.log('');
  }
  
  console.log('=============================================');
  console.log(`  执行时间: ${duration} 秒`);
  console.log(`  总操作数: ${totalAddAttempts + totalCompleteAttempts + totalDragAttempts}`);
  console.log('=============================================');
  console.log('');
  
  // 验证规则检查
  console.log(`${colors.blue}【规则验证】${colors.reset}`);
  console.log('');
  
  const rules = [
    {
      name: '任务数量限制 (MAX_TASKS = 100)',
      pass: totalAddBlocked > 0,
      detail: `被限制添加 ${totalAddBlocked} 次`
    },
    {
      name: '添加任务成功率 (>50%)',
      pass: parseFloat(addSuccessRate) > 50,
      detail: `成功率 ${addSuccessRate}%`
    },
    {
      name: '完成任务功能',
      pass: totalCompleteSuccess > 0,
      detail: `成功完成 ${totalCompleteSuccess} 次`
    },
    {
      name: '拖动任务功能 (成功率>50%)',
      pass: parseFloat(dragSuccessRate) > 50,
      detail: `成功率 ${dragSuccessRate}%`
    },
    {
      name: '数据一致性',
      pass: errors.length === 0,
      detail: errors.length === 0 ? '无错误' : `发现 ${errors.length} 个问题`
    }
  ];
  
  let allPassed = true;
  rules.forEach(rule => {
    if (rule.pass) {
      console.log(`  ${colors.green}✓${colors.reset} ${rule.name} - ${rule.detail}`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ${rule.name} - ${rule.detail}`);
      allPassed = false;
    }
  });
  
  console.log('');
  console.log('=============================================');
  
  if (allPassed && errors.length === 0) {
    console.log(`${colors.green}冒烟测试通过！${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}冒烟测试失败，请检查错误${colors.reset}`);
    process.exit(1);
  }
}

// 执行测试
main().catch(err => {
  console.error(`${colors.red}测试执行异常: ${err.message}${colors.reset}`);
  process.exit(1);
});
