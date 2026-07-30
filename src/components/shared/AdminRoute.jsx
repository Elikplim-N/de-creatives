import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function AdminRoute({ children }) {
  const { isAdminLoggedIn, authLoading } = useApp();

  // Wait for the initial Supabase session check to resolve before deciding
  // whether to redirect, otherwise a refresh always bounces a logged-in
  // admin to /admin/login (isAdminLoggedIn starts false on every mount).
  if (authLoading) return null;

  return isAdminLoggedIn ? children : <Navigate to="/admin/login" replace />;
}
