import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { fetchTaskDependencies } from './projectsSlice';
import { useSelector, useDispatch } from 'react-redux';

const TaskDependencyGraph = ({ taskId }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setLoading(true);
        await dispatch(fetchTaskDependencies(taskId));
        
        // 构建节点和边
        const task = useSelector(state => 
          state.projects.tasks.find(t => t.id === taskId)
        );
        
        if (!task) return;
        
        const allTasks = [
          task,
          ...(task.dependentTasks || []),
          ...(task.prerequisiteTasks || [])
        ];
        
        // 创建节点
        const newNodes = allTasks.map((task, index) => ({
          id: task.id,
          position: { x: index * 250, y: 0 },
          data: { label: task.title },
          style: {
            border: task.id === taskId ? '2px solid #6366f1' : '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '10px',
            backgroundColor: '#fff',
            width: '200px'
          }
        }));
        
        // 创建边
        const newEdges = [];
        
        // 前置任务边
        if (task.prerequisiteTasks) {
          task.prerequisiteTasks.forEach(prereq => {
            newEdges.push({
              id: `e${prereq.id}-${task.id}`,
              source: prereq.id,
              target: task.id,
              animated: false,
              label: '前置任务',
              style: { stroke: '#6366f1' }
            });
          });
        }
        
        // 依赖任务边
        if (task.dependentTasks) {
          task.dependentTasks.forEach(dep => {
            newEdges.push({
              id: `e${task.id}-${dep.id}`,
              source: task.id,
              target: dep.id,
              animated: false,
              label: '依赖任务',
              style: { stroke: '#10b981' }
            });
          });
        }
        
        setNodes(newNodes);
        setEdges(newEdges);
      } catch (error) {
        console.error('加载任务依赖关系失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDependencies();
  }, [taskId, dispatch]);
  
  if (loading) {
    return <div className="text-center py-8">加载依赖关系...</div>;
  }
  
  return (
    <div className="h-[500px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <div className="bg-white p-2 rounded shadow">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-indigo-500 mr-2"></div>
              <span className="text-sm">当前任务</span>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-emerald-500 mr-2"></div>
              <span className="text-sm">依赖任务</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 mr-2"></div>
              <span className="text-sm">前置任务</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default TaskDependencyGraph;