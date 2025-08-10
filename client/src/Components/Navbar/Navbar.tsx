import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { logout as logoutAction } from '../../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuth, name } = useSelector((state: RootState) => ({
    isAuth: state.auth.isAuth,
    name: state.auth.user?.name,
  }));

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  return (
    <AppBar position='static'>
      <Toolbar>
        <Button component={NavLink} to='/' color='inherit'>
          Home
        </Button>
        {!isAuth && (
          <>
            <Button component={NavLink} to='/signup' color='inherit'>
              Sign Up
            </Button>
            <Button component={NavLink} to='/signin' color='inherit'>
              Sign In
            </Button>
          </>
        )}
        {isAuth && (
          <>
            <Button component={NavLink} to='/dashboard' color='inherit'>
              Dashboard
            </Button>
            <Box
              sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <Typography>{name}</Typography>
              <Button onClick={handleLogout} color='inherit'>
                Logout
              </Button>
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
