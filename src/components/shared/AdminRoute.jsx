import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function AdminRoute({ children }) {
  const { isAdminLoggedIn } = useApp();
  return isAdminLoggedIn ? children : <Navigate to="/admin/login" replace />;
}
