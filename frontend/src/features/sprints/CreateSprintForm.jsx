import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSprint, generateSprintPlan } from './sprintsSlice';
import { CalendarIcon, ChartBarIcon } from '@heroicons/react/outline';

export default function CreateSprintForm({ projectId }) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    duration: 2
  });
  
  const [previewData, setPreviewData] = useState(null);
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.sprints);

  const handleGeneratePreview = async () => {
    const result = await dispatch(generateSprintPlan({
      projectId,
      durationWeeks: formData.duration
    }));
    setPreviewData(result.payload);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createSprint({
      projectId,
      ...formData
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium mb-4">创建新Sprint</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 表单字段 */}
        </div>

        {previewData && (
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="font-medium flex items-center mb-2">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              计划预览
            </h3>
            {/* 预览数据展示 */}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleGeneratePreview}
            className="btn-secondary"
          >
            生成计划预览
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? '创建中...' : '确认创建Sprint'}
          </button>
        </div>
      </form>
    </div>
  );
}