import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { logout as logoutAction } from '../../store/slices/authSlice';
import { School, LogoutRounded } from '@mui/icons-material';

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  const name = useSelector((state: RootState) => state.auth.user?.name);

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  return (
    <AppBar
      position='sticky'
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 0.5,
      }}
    >
      <Toolbar sx={{ width: '100%', px: { xs: 1, md: 2 } }}>
        {/* Left side - Logo and Nav */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component={NavLink}
            to='/'
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'white',
              '&:hover': { opacity: 0.9 },
            }}
          >
            <School sx={{ fontSize: 28 }} />
            <Typography 
              variant='h6' 
              sx={{ 
                fontWeight: 700, 
                letterSpacing: '-0.5px',
              }}
            >
              FlashLearn
            </Typography>
          </Box>

          {isAuth && (
            <Button
              component={NavLink}
              to='/flashcards'
              sx={{
                color: 'white',
                fontWeight: 500,
                textTransform: 'none',
                ml: 2,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                '&.active': { backgroundColor: 'rgba(255,255,255,0.2)' },
              }}
            >
              Flashcards
            </Button>
          )}
        </Box>

        {/* Right Side - User info and logout */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isAuth ? (
            <>
              <Button
                component={NavLink}
                to='/signin'
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Sign In
              </Button>
              <Button
                component={NavLink}
                to='/signup'
                sx={{
                  backgroundColor: 'white',
                  color: '#667eea',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2,
                  borderRadius: 2,
                  '&:hover': { backgroundColor: '#f1f5f9' },
                }}
              >
                Get Started
              </Button>
            </>
          ) : (
            <>
              <Typography sx={{ fontWeight: 500 }}>{name}</Typography>
              <Button
                onClick={handleLogout}
                startIcon={<LogoutRounded />}
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
