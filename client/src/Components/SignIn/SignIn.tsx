import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';

const SignIn = () => {
  const dispatch = useDispatch() as AppDispatch;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuth);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const apiError = useSelector((state: RootState) => state.auth.error);

  const [form, setForm] = useState({ email: '', password: '' });
  const [hasRedirected, setHasRedirected] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && !hasRedirected) {
      const redirect = searchParams.get('redirect');
      if (redirect) {
        setHasRedirected(true);
        navigate(redirect);
      } else {
        setHasRedirected(true);
        navigate('/flashcards');
      }
    }
  }, [isAuthenticated, navigate, searchParams, hasRedirected]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(form)).unwrap();
      setForm({ email: '', password: '' });
    } catch {
      // Error is handled by Redux and displayed via apiError
    }
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Container maxWidth='sm'>
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Typography variant='h4' gutterBottom>
          Sign In
        </Typography>
        <Box component='form' onSubmit={handleSubmit}>
          {apiError && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}
          <TextField
            fullWidth
            label='Email'
            type='email'
            name='email'
            onChange={handleChange}
            value={form.email}
            margin='normal'
          />
          <TextField
            fullWidth
            label='Password'
            type='password'
            name='password'
            onChange={handleChange}
            value={form.password}
            margin='normal'
          />
          <Button
            fullWidth
            variant='contained'
            type='submit'
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignIn;
