import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Agile Team Manager</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">{user?.name}</span>
          <button 
            onClick={handleLogout}
            className="btn-danger"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;