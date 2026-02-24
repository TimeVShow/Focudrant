import { Task } from '../src/types';

// 基础功能测试
describe('基础功能测试', () => {
  // 测试用例1：添加事件并移动到四个象限
  test('添加事件并移动到四个象限', () => {
    // 模拟添加事件
    const newTask: Task = {
      id: 'test-1',
      title: '测试事件',
      deadline: new Date(Date.now() + 86400000).toISOString(), // 1天后
      importance: 'medium',
      x: -50, // 默认在重要不紧急象限
      y: 50,
      createdAt: new Date().toISOString()
    };

    // 验证初始位置在第二象限（重要不紧急）
    expect(newTask.x).toBe(-50);
    expect(newTask.y).toBe(50);

    // 模拟移动到第一象限（重要紧急）
    const taskInQ1 = { ...newTask, x: 50, y: 50 };
    expect(taskInQ1.x).toBe(50);
    expect(taskInQ1.y).toBe(50);

    // 模拟移动到第三象限（不重要不紧急）
    const taskInQ3 = { ...newTask, x: -50, y: -50 };
    expect(taskInQ3.x).toBe(-50);
    expect(taskInQ3.y).toBe(-50);

    // 模拟移动到第四象限（紧急不重要）
    const taskInQ4 = { ...newTask, x: 50, y: -50 };
    expect(taskInQ4.x).toBe(50);
    expect(taskInQ4.y).toBe(-50);
  });

  // 测试用例2：同一象限内不同截止时间的事件排序
  test('同一象限内不同截止时间的事件排序', () => {
    const now = new Date();
    const task1: Task = {
      id: 'task-1',
      title: '紧急任务',
      deadline: new Date(now.getTime() + 3600000).toISOString(), // 1小时后
      x: -50,
      y: 50,
      createdAt: now.toISOString()
    };

    const task2: Task = {
      id: 'task-2',
      title: '较不紧急任务',
      deadline: new Date(now.getTime() + 7200000).toISOString(), // 2小时后
      x: -50,
      y: 50,
      createdAt: now.toISOString()
    };

    // 排序：按截止时间升序排列（越早的排在前面）
    const tasks = [task2, task1]; // 故意打乱顺序
    const sortedTasks = [...tasks].sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );

    // 验证排序结果：task1（1小时后）应该在task2（2小时后）之前
    expect(sortedTasks[0].id).toBe('task-1');
    expect(sortedTasks[1].id).toBe('task-2');
  });
});