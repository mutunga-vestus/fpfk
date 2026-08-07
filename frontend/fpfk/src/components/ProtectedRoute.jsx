import { Navigate } from 'react-router-dom';
import InactivityLock from '../pages/admin/InactivityLock';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/admin/login" replace />;
  return <InactivityLock>{children}</InactivityLock>;
}