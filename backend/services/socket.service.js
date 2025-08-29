import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Task, Sprint } from '../db/models';

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com' 
          : 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });
    
    this.initRedis();
    this.setupEventHandlers();
  }

  async initRedis() {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    
    await Promise.all([pubClient.connect(), subClient.connect()]);
    this.io.adapter(createAdapter(pubClient, subClient));
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`用户连接: ${socket.id}`);
      
      // 加入项目房间
      socket.on('join-project', async (projectId) => {
        socket.join(`project-${projectId}`);
        console.log(`用户 ${socket.id} 加入项目 ${projectId}`);
        
        // 发送当前Sprint状态
        const activeSprint = await Sprint.findOne({
          where: { 
            projectId,
            status: 'active'
          },
          include: [{
            model: Task,
            as: 'tasks'
          }]
        });
        
        socket.emit('sprint-update', activeSprint);
      });

      // 实时任务更新
      socket.on('task-update', async (data) => {
        // 保存到数据库
        await Task.update(data, { 
          where: { id: data.id } 
        });
        
        // 广播给项目成员
        this.io.to(`project-${data.projectId}`)
          .emit('task-updated', data);
      });

      // 冲突解决
      socket.on('resolve-conflict', (data) => {
        socket.to(`project-${data.projectId}`)
          .emit('conflict-resolved', data);
      });
    });
  }
}

export default SocketService;