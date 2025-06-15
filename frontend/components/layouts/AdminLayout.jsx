import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const { user, isAdmin } = useContext(AuthContext);
  return (isAdmin ? <Outlet /> : (user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />));
};

export default AdminLayout;