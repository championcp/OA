import { io } from 'socket.io-client';
import { addToast } from '../features/alert/alertSlice';

class SocketManager {
  constructor() {
    this.socket = null;
    this.dispatch = null;
  }

  connect(dispatch) {
    this.dispatch = dispatch;
    this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
      withCredentials: true,
      autoConnect: true
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('task-updated', (task) => {
      this.dispatch({
        type: 'projects/updateTaskFromSocket',
        payload: task
      });
      this.dispatch(addToast({
        message: `任务 "${task.title}" 已更新`,
        type: 'info'
      }));
    });

    this.socket.on('conflict-detected', (data) => {
      this.dispatch(addToast({
        message: `检测到编辑冲突: ${data.message}`,
        type: 'warning'
      }));
    });
  }

  joinProject(projectId) {
    this.socket.emit('join-project', projectId);
  }

  updateTask(task) {
    this.socket.emit('task-update', task);
  }

  resolveConflict(resolution) {
    this.socket.emit('resolve-conflict', resolution);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketManager();