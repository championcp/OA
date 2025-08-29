import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dashboard cards will go here */}
      </div>
    </div>
  );
};

export default Dashboard;