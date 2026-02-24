export interface Task {
  id: string;
  title: string;
  deadline: string;
  importance?: 'low' | 'medium' | 'high';
  // 位置信息 (相对于坐标轴中心的百分比位置, -100 到 100)
  x: number; // 紧急程度: 负值=不紧急, 正值=紧急
  y: number; // 重要程度: 负值=不重要, 正值=重要
  createdAt: string;
  // 备注信息
  notes?: string;
}

export interface CompletedTask extends Task {
  completedAt: string;
}

export type Quadrant = 'urgent' | 'important' | 'delegate' | 'later';

export interface QuadrantInfo {
  name: string;
  description: string;
  color: string;
  bgClass: string;
}
