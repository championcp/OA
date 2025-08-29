import React from 'react';
import { useDispatch } from 'react-redux';
import { updateTask } from './projectsSlice';
import { Menu, Transition } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/outline';

export default function TaskCard({ task }) {
  const dispatch = useDispatch();
  
  const handlePriorityChange = async (priority) => {
    try {
      await dispatch(updateTask({
        id: task.id,
        changes: { priority }
      }));
    } catch (error) {
      console.error('更新任务优先级失败:', error);
    }
  };
  
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'highest': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'lowest': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        
        <Menu as="div" className="relative">
          <Menu.Button className="text-gray-500 hover:text-gray-700">
            <DotsVerticalIcon className="h-5 w-5" />
          </Menu.Button>
          
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm`}
                      onClick={() => handlePriorityChange('highest')}
                    >
                      设为最高优先级
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm`}
                      onClick={() => handlePriorityChange('high')}
                    >
                      设为高优先级
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm`}
                      onClick={() => handlePriorityChange('medium')}
                    >
                      设为中优先级
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm`}
                      onClick={() => handlePriorityChange('low')}
                    >
                      设为低优先级
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm`}
                      onClick={() => handlePriorityChange('lowest')}
                    >
                      设为最低优先级
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      
      <div className="flex items-center space-x-2 mb-2">
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor()}`}>
          {task.priority === 'highest' && '最高'}
          {task.priority === 'high' && '高'}
          {task.priority === 'medium' && '中'}
          {task.priority === 'low' && '低'}
          {task.priority === 'lowest' && '最低'}
        </span>
        
        {task.storyPoints && (
          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
            {task.storyPoints} SP
          </span>
        )}
        
        {task.type === 'bug' && (
          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
            缺陷
          </span>
        )}
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}
      
      {task.dueDate && (
        <div className="text-xs text-gray-500">
          截止日期: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}