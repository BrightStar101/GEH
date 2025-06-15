import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const PublicLayout = () => {
  const { user, isAdmin } = useContext(AuthContext);
  return (!user ? <Outlet /> : (isAdmin ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />));
};

export default PublicLayout;