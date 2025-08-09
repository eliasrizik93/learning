import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import type { RootState } from '../../store/store';

const Navbar = () => {
  const { isAuth, name } = useSelector((state: RootState) => ({
    isAuth: state.auth.isAuth,
    name: state.auth.user?.name,
  }));
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
            <Box sx={{ ml: 'auto' }}>
              <Typography>{name}</Typography>
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
