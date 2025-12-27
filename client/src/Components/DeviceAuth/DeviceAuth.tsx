import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { RootState } from '../../store/store';

const DeviceAuth = () => {
  const { userCode } = useParams<{ userCode: string }>();
  const navigate = useNavigate();
  const { token, isAuth, hydrated } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string>('');
  const [authorized, setAuthorized] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);

  useEffect(() => {
    // Wait for auth hydration to complete
    if (!hydrated) {
      console.log('DeviceAuth - waiting for hydration...');
      return;
    }
    
    console.log('DeviceAuth useEffect - isAuth:', isAuth, 'token:', token ? 'exists' : 'missing', 'userCode:', userCode);
    
    if (!isAuth || !token) {
      console.log('Not authenticated, redirecting to signin');
      navigate(`/signin?redirect=/authorize/${userCode}`);
      return;
    }

    const verifyCode = async () => {
      console.log('Verifying code:', userCode);
      try {
        const res = await fetch(
          `http://localhost:3000/device-auth/verify/${userCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('Verify response status:', res.status);

        // If 401, token is expired - redirect to login
        if (res.status === 401) {
          console.log('Token expired, redirecting to signin');
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate(`/signin?redirect=/authorize/${userCode}`);
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to verify code');
        }

        const data = await res.json();
        console.log('Verify response data:', data);

        if (!data.valid) {
          if (data.reason === 'already_authorized') {
            setError('This device has already been authorized.');
          } else {
            setError('Invalid or expired authorization code.');
          }
          setLoading(false);
          return;
        }

        console.log('Device name:', data.deviceName);
        setDeviceName(data.deviceName);
        setLoading(false);
      } catch (err) {
        console.error('Verification error:', err);
        setError('Failed to verify authorization code.');
        setLoading(false);
      }
    };

    verifyCode();
  }, [userCode, token, isAuth, hydrated, navigate]);

  const handleAuthorize = async () => {
    setAuthorizing(true);
    setError(null);
    console.log('Authorizing device with user_code:', userCode);

    try {
      const res = await fetch('http://localhost:3000/device-auth/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_code: userCode }),
      });

      console.log('Authorize response status:', res.status);
      const data = await res.json();
      console.log('Authorize response data:', data);

      if (!res.ok) {
        throw new Error(data.message || 'Failed to authorize device');
      }

      setAuthorized(true);
    } catch (err) {
      console.error('Authorize error:', err);
      setError('Failed to authorize device. Please try again.');
    } finally {
      setAuthorizing(false);
    }
  };

  const handleDeny = () => {
    navigate('/');
  };

  // Show loading while waiting for hydration or verification
  if (!hydrated || loading) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>
            {!hydrated ? 'Loading...' : 'Verifying authorization code...'}
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (authorized) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Device Authorized!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You can now return to your Python application.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/devices')}>
            Manage Devices
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Authorize Device
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              A device is requesting access to your FlashLearn account:
            </Typography>

            <Box
              sx={{
                bgcolor: 'background.default',
                p: 2,
                borderRadius: 1,
                mb: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Device Name
              </Typography>
              <Typography variant="h6">{deviceName}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Authorization Code
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                {userCode}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              This will allow the device to access your flashcards and study data.
            </Alert>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleAuthorize}
                disabled={authorizing}
              >
                {authorizing ? <CircularProgress size={24} /> : 'Authorize'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleDeny}
                disabled={authorizing}
              >
                Deny
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default DeviceAuth;
