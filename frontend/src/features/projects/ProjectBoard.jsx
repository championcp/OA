import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjectTasks, updateTaskStatus } from './projectsSlice';
import TaskCard from './TaskCard';

const statusColumns = [
  { id: 'backlog', title: '待办' },
  { id: 'todo', title: '待开始' },
  { id: 'in_progress', title: '进行中' },
  { id: 'review', title: '评审中' },
  { id: 'done', title: '已完成' }
];

export default function ProjectBoard() {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const tasks = useSelector(state => state.projects.tasks);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadTasks = async () => {
      try {
        await dispatch(fetchProjectTasks(projectId));
        setLoading(false);
      } catch (error) {
        console.error('加载任务失败:', error);
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [projectId, dispatch]);
  
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    // 如果没有拖放到有效区域，不做任何操作
    if (!destination) return;
    
    // 如果拖放位置没有变化，不做任何操作
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    try {
      // 乐观更新UI
      const task = tasks.find(t => t.id === draggableId);
      const updatedTask = { ...task, status: destination.droppableId };
      
      dispatch({
        type: 'projects/updateTaskOptimistic',
        payload: updatedTask
      });
      
      // 发送API请求更新状态
      await dispatch(updateTaskStatus({
        taskId: draggableId,
        status: destination.droppableId,
        order: destination.index
      }));
    } catch (error) {
      console.error('更新任务状态失败:', error);
      // 回滚UI状态
      dispatch({
        type: 'projects/revertTaskStatus',
        payload: {
          taskId: draggableId,
          originalStatus: source.droppableId
        }
      });
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">项目看板</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {statusColumns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 min-w-[300px] bg-gray-100 rounded-lg p-4"
                >
                  <h2 className="font-semibold text-lg mb-4">{column.title}</h2>
                  
                  {tasks
                    .filter(task => task.status === column.id)
                    .sort((a, b) => a.order - b.order)
                    .map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-3"
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}