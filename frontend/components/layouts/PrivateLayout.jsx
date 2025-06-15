import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const PrivateLayout = () => {
  const { user, isAdmin } = useContext(AuthContext);
  return (!user ? <Navigate to="/login" /> : <Outlet />);
};

export default PrivateLayout;