import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { RootState } from '../../store/store';

interface Device {
  id: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt: string;
}

const DeviceManagement = () => {
  const { token } = useSelector((state: RootState) => state.auth);

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [deviceToRevoke, setDeviceToRevoke] = useState<Device | null>(null);
  const [revoking, setRevoking] = useState(false);

  const fetchDevices = async () => {
    try {
      const res = await fetch('http://localhost:3000/device-auth/devices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch devices');
      const data = await res.json();
      setDevices(data);
    } catch {
      setError('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [token]);

  const handleRevokeClick = (device: Device) => {
    setDeviceToRevoke(device);
    setRevokeDialogOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!deviceToRevoke) return;

    setRevoking(true);
    try {
      const res = await fetch(
        `http://localhost:3000/device-auth/devices/${deviceToRevoke.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error('Failed to revoke device');

      setDevices(devices.filter((d) => d.id !== deviceToRevoke.id));
      setRevokeDialogOpen(false);
      setDeviceToRevoke(null);
    } catch {
      setError('Failed to revoke device');
    } finally {
      setRevoking(false);
    }
  };

  const handleRevokeAll = async () => {
    setRevoking(true);
    try {
      const res = await fetch('http://localhost:3000/device-auth/devices', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to revoke all devices');

      setDevices([]);
    } catch {
      setError('Failed to revoke all devices');
    } finally {
      setRevoking(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading devices...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4">Connected Devices</Typography>
          {devices.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleRevokeAll}
              disabled={revoking}
            >
              Revoke All
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {devices.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            No connected devices. When you authorize a Python application, it
            will appear here.
          </Typography>
        ) : (
          <List>
            {devices.map((device) => (
              <ListItem
                key={device.id}
                divider
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemText
                  primary={device.deviceName}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        Connected: {formatDate(device.createdAt)}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Last used: {formatDate(device.lastUsedAt)}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="revoke"
                    onClick={() => handleRevokeClick(device)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={revokeDialogOpen} onClose={() => setRevokeDialogOpen(false)}>
        <DialogTitle>Revoke Device Access</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to revoke access for "{deviceToRevoke?.deviceName}"?
            This device will no longer be able to access your FlashLearn account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeDialogOpen(false)} disabled={revoking}>
            Cancel
          </Button>
          <Button
            onClick={handleRevokeConfirm}
            color="error"
            disabled={revoking}
          >
            {revoking ? <CircularProgress size={24} /> : 'Revoke'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeviceManagement;
