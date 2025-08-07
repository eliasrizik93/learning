import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { AppDispatch } from '../../store/store';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/slices/AuthSlice';

const SignIn = () => {
  const dispatch = useDispatch() as AppDispatch;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(form));
    setForm({ email: '', password: '' });
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
          <Button fullWidth variant='contained' type='submit' sx={{ mt: 2 }}>
            Sign In
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignIn;
