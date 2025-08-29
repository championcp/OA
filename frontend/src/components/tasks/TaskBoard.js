import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { updateTask } from '../../features/tasks/taskSlice';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

const TaskBoard = ({ projectId, tasks }) => {
  const dispatch = useDispatch();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 按状态分组任务
  const columns = {
    todo: {
      id: 'todo',
      title: '待办',
      tasks: tasks.filter(task => task.status === 'todo')
    },
    inProgress: {
      id: 'in-progress',
      title: '进行中',
      tasks: tasks.filter(task => task.status === 'in-progress')
    },
    review: {
      id: 'review',
      title: '审核中',
      tasks: tasks.filter(task => task.status === 'review')
    },
    completed: {
      id: 'completed',
      title: '已完成',
      tasks: tasks.filter(task => task.status === 'completed')
    }
  };

  // 处理拖拽结束事件
  const handleDragEnd = (result) => {
    const { source, destination } = result;

    // 如果没有目标或者拖拽到相同位置，则不做任何操作
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }

    // 获取拖拽的任务
    const task = columns[source.droppableId].tasks[source.index];
    
    // 更新任务状态
    const updatedTask = {
      ...task,
      status: destination.droppableId
    };
    
    // 调用API更新任务状态
    dispatch(updateTask({
      projectId,
      taskId: task.id,
      taskData: updatedTask
    }));
  };

  // 打开任务详情
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // 关闭任务详情
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">任务看板</h2>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(columns).map(column => (
            <div key={column.id} className="bg-gray-100 rounded-lg p-3">
              <h3 className="font-medium text-gray-700 mb-3 flex justify-between">
                <span>{column.title}</span>
                <span className="bg-gray-200 text-gray-700 text-sm py-0.5 px-2 rounded-full">
                  {column.tasks.length}
                </span>
              </h3>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[200px]"
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleTaskClick(task)}
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
            </div>
          ))}
        </div>
      </DragDropContext>
      
      {/* 任务详情模态框 */}
      {selectedTask && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          task={selectedTask}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default TaskBoard;