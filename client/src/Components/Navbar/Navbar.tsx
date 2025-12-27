import { AppBar, Box, Button, Toolbar, Typography, Avatar, Menu, MenuItem, Divider, ListItemIcon } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { logout as logoutAction } from '../../store/slices/authSlice';
import { School, LogoutRounded, Devices, Person, Settings } from '@mui/icons-material';
import { useState } from 'react';

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  const user = useSelector((state: RootState) => state.auth.user);
  const name = user?.name;
  const profilePicture = user?.profile;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logoutAction());
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/settings');
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
            <>
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
              <Button
                component={NavLink}
                to='/devices'
                startIcon={<Devices />}
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                  '&.active': { backgroundColor: 'rgba(255,255,255,0.2)' },
                }}
              >
                Devices
              </Button>
            </>
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
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Box
                onClick={handleMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                }}
              >
                <Avatar
                  src={profilePicture || undefined}
                  alt={name || 'User'}
                  sx={{ width: 32, height: 32 }}
                >
                  {!profilePicture && name?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography sx={{ fontWeight: 500 }}>{name}</Typography>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleSettings}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutRounded fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
