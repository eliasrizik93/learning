import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Share,
  Support,
  Info,
  Check,
  Delete,
  DoneAll,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../../store/slices/notificationSlice';
import type { Notification } from '../../types';

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'GROUP_SHARED':
      return <Share fontSize="small" color="primary" />;
    case 'TICKET_REPLY':
      return <Support fontSize="small" color="secondary" />;
    default:
      return <Info fontSize="small" />;
  }
};

const Notifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useSelector(
    (state: RootState) => state.notifications
  );
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuth]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }

    const data = notification.data as Record<string, unknown> | undefined;
    if (notification.type === 'GROUP_SHARED' && data?.groupId) {
      navigate('/flashcards');
    } else if (notification.type === 'TICKET_REPLY' && data?.ticketId) {
      navigate('/support');
    }
    handleClose();
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isAuth) return null;

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAll fontSize="small" />}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                py: 1.5,
                backgroundColor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': {
                  backgroundColor: notification.read ? 'action.hover' : 'action.selected',
                },
              }}
            >
              <ListItemIcon>
                <NotificationIcon type={notification.type} />
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={
                  <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatTime(notification.createdAt)}
                    </Typography>
                  </Box>
                }
                sx={{ mr: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {!notification.read && (
                  <Chip size="small" label="New" color="primary" sx={{ height: 20 }} />
                )}
                <IconButton
                  size="small"
                  onClick={(e) => handleDelete(e, notification.id)}
                  sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          ))
        )}

        {notifications.length > 10 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button size="small" onClick={() => { navigate('/notifications'); handleClose(); }}>
                View all notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default Notifications;

