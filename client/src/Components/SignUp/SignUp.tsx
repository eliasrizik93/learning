import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store/store';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  profile: '',
  birthday: '',
};

type Errors = Partial<Record<keyof typeof initialForm, string>>;

// Hide the red asterisk from required labels (keeps required semantics)
const hideAsteriskSx = { '& .MuiFormLabel-asterisk': { display: 'none' } };

const SignUp = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((s: RootState) => s.auth.loading);
  const apiError = useSelector((s: RootState) => s.auth.error);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e: Errors = {};

    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email';

    if (form.password.length < 8)
      e.password = 'Password must be at least 8 characters';

    if (form.confirmPassword !== form.password)
      e.confirmPassword = 'Passwords do not match';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      birthday: form.birthday || undefined,
      profile: form.profile || undefined,
    };

    try {
      await dispatch(signupUser(payload)).unwrap();
      setForm(initialForm);
      setErrors({});
    } catch {
      // apiError already handled from Redux
    }
  };

  return (
    <Container maxWidth='sm'>
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Typography variant='h4' gutterBottom>
          Sign Up
        </Typography>

        <Box component='form' onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label='First name'
            name='firstName'
            type='text'
            autoComplete='given-name'
            value={form.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            margin='normal'
            required
            sx={hideAsteriskSx}
          />

          <TextField
            fullWidth
            label='Last name'
            name='lastName'
            type='text'
            autoComplete='family-name'
            value={form.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            margin='normal'
            required
            sx={hideAsteriskSx}
          />

          <TextField
            fullWidth
            label='Email'
            name='email'
            type='email'
            autoComplete='email'
            value={form.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            margin='normal'
            required
            sx={hideAsteriskSx}
          />

          <TextField
            fullWidth
            label='Password'
            name='password'
            type={showPwd ? 'text' : 'password'}
            autoComplete='new-password'
            value={form.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            margin='normal'
            required
            sx={hideAsteriskSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPwd((v) => !v)}
                    edge='end'
                  >
                    {showPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label='Confirm password'
            name='confirmPassword'
            type={showConfirmPwd ? 'text' : 'password'}
            autoComplete='new-password'
            value={form.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            margin='normal'
            required
            sx={hideAsteriskSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label={
                      showConfirmPwd ? 'Hide password' : 'Show password'
                    }
                    onClick={() => setShowConfirmPwd((v) => !v)}
                    edge='end'
                  >
                    {showConfirmPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label='Birthday'
            name='birthday'
            type='date'
            InputLabelProps={{ shrink: true }}
            value={form.birthday}
            onChange={handleChange}
            margin='normal'
            sx={hideAsteriskSx}
          />

          <TextField
            fullWidth
            label='Profile URL'
            name='profile'
            type='url'
            value={form.profile}
            onChange={handleChange}
            margin='normal'
            sx={hideAsteriskSx}
          />

          {apiError && (
            <Typography color='error' variant='body2' sx={{ mt: 1 }}>
              {apiError}
            </Typography>
          )}

          <Button
            fullWidth
            variant='contained'
            type='submit'
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing up…' : 'Sign Up'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUp;
