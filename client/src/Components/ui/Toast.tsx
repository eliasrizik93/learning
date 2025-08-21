import React from 'react';
import { Snackbar, Alert, type AlertProps } from '@mui/material';

interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertProps['severity'];
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity = 'info',
  duration = 4000,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          borderRadius: 2,
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant='filled'
        sx={{
          borderRadius: 2,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
