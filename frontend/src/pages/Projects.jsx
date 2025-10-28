import React from 'react';
import { useSelector } from 'react-redux';

const Projects = () => {
  const projects = useSelector(state => state.projects.projects);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">项目管理</h1>
      {projects.map(project => (
        <div key={project.id} className="border p-4 mb-2 rounded">
          <h2>{project.name}</h2>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Projects;