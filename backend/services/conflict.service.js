import { Task, TaskHistory } from '../db/models';

class ConflictService {
  constructor() {
    this.pendingOperations = new Map();
  }

  // 检测编辑冲突
  async detectConflict(taskId, newData, userId) {
    const currentTask = await Task.findByPk(taskId);
    const lastUpdate = await TaskHistory.findOne({
      where: { taskId },
      order: [['updatedAt', 'DESC']]
    });

    // 检查是否有其他用户正在编辑
    const pendingOp = this.pendingOperations.get(taskId);
    if (pendingOp && pendingOp.userId !== userId) {
      return {
        hasConflict: true,
        message: '其他用户正在编辑此任务',
        conflictingUser: pendingOp.userId,
        currentData: currentTask
      };
    }

    // 检查版本冲突
    if (lastUpdate && newData.version !== lastUpdate.version) {
      return {
        hasConflict: true,
        message: '数据版本冲突',
        currentData: currentTask,
        serverVersion: lastUpdate.version
      };
    }

    return { hasConflict: false };
  }

  // 注册操作
  registerOperation(taskId, userId, operation) {
    this.pendingOperations.set(taskId, { userId, operation });
    
    // 设置超时自动清理
    setTimeout(() => {
      this.pendingOperations.delete(taskId);
    }, 30000); // 30秒超时
  }

  // 完成操作
  completeOperation(taskId) {
    this.pendingOperations.delete(taskId);
  }

  // 解决冲突
  async resolveConflict(taskId, resolution, userId) {
    const { acceptedData, resolvedVersion } = resolution;
    
    // 更新任务数据
    await Task.update(acceptedData, { where: { id: taskId } });
    
    // 记录解决历史
    await TaskHistory.create({
      taskId,
      userId,
      action: 'conflict_resolution',
      changes: acceptedData,
      version: resolvedVersion
    });

    this.completeOperation(taskId);
  }
}

export default new ConflictService();