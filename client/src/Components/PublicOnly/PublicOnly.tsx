import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import type { RootState } from '../../store/store';

export default function PublicOnly() {
  const isAuth = useSelector((s: RootState) => s.auth.isAuth);
  if (isAuth) return <Navigate to='/dashboard' replace />;
  return <Outlet />;
}
