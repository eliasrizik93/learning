import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import type { RootState } from '../../store/store';

const RequireAuth = () => {
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  const hydrated = useSelector((state: RootState) => state.auth.hydrated);

  // Wait for auth hydration to complete before making redirect decisions
  if (!hydrated) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuth) {
    return <Navigate to='/signin' replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
