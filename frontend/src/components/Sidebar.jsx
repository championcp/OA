import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-md">
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/projects" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              Projects
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/sprints" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              Sprints
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/tasks" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              Tasks
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;