import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Sprints from './pages/Sprints';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportViewer from './features/reports/ReportViewer';
import ReportList from './features/reports/ReportList';
import ReportGenerator from './features/reports/ReportGenerator';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/sprints" element={<Sprints />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/reports" element={<ReportList />} />
        <Route path="/reports/new" element={<ReportGenerator />} />
        <Route path="/reports/generate" element={<ReportGenerator />} />
        <Route path="/reports/:reportId" element={<ReportViewer />} />
      </Route>
    </Routes>
  );
}

export default App;