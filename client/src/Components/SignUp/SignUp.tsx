import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { signupUser } from '../../store/slices/authSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store/store';

const SignUp = () => {
  const dispatch = useDispatch() as AppDispatch;
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErros] = useState({ name: '', email: '', password: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const tempErrors = { name: '', email: '', password: '' };
    let isValid = true;
    if (!form.name) {
      tempErrors.name = 'Name is required';
      isValid = false;
    }
    if (!form.email.includes('@')) {
      tempErrors.email = 'enter a valid email';
      isValid = false;
    }
    if (form.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    setErros(tempErrors);
    return isValid;
  };
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      dispatch(signupUser(form));
      const tempValue = { name: '', email: '', password: '' };
      setForm(tempValue);
    }
  };
  return (
    <Container maxWidth='sm'>
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Typography variant='h4' gutterBottom>
          Sign Up
        </Typography>
        <Box component='form' onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label='Name'
            name='name'
            type='name'
            value={form.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            margin='normal'
          />
          <TextField
            fullWidth
            label='Email'
            name='email'
            type='email'
            value={form.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            margin='normal'
          />
          <TextField
            fullWidth
            label='Password'
            name='password'
            type='password'
            value={form.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            margin='normal'
          />
          <Button fullWidth variant='contained' type='submit' sx={{ mt: 2 }}>
            Sign Up
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUp;
