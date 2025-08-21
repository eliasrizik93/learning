import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { logout as logoutAction } from '../../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  const name = useSelector((state: RootState) => state.auth.user?.name);

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  return (
    <AppBar
      position='static'
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
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
            <Button component={NavLink} to='/flashcards' color='inherit'>
              Flashcards
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
