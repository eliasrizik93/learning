import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import type { RootState } from '../../store/store';

const RequireAuth = () => {
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  if (!isAuth) {
    return <Navigate to='/signin' replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
