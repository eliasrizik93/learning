import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Autocomplete,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { uploadFile } from '../../lib/uploadFile';
import { CloudUpload } from '@mui/icons-material';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  profile: '',
  birthday: '',
  country: '',
  phoneNumber: '',
  profileVisible: true,
};

// List of countries for autocomplete
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
  'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
  'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe'
];

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
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [profileInputType, setProfileInputType] = useState<'url' | 'file'>('url');

  const firstNameRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstNameRef.current?.focus();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    // Clear error when field becomes valid
    setErrors((prev) => {
      const newErrors = { ...prev };
      switch (name) {
        case 'firstName':
          if (value.trim()) delete newErrors.firstName;
          break;
        case 'lastName':
          if (value.trim()) delete newErrors.lastName;
          break;
        case 'email':
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) delete newErrors.email;
          break;
        case 'password':
          if (value.length >= 8) delete newErrors.password;
          break;
        case 'confirmPassword':
          if (value === form.password) delete newErrors.confirmPassword;
          break;
      }
      return newErrors;
    });
  };

  const handleFileUpload = async (file: File) => {
    setUploadingProfile(true);
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, profile: url }));
    } catch (err) {
      console.error('Upload error:', err);
      setErrors((prev) => ({ ...prev, profile: 'Failed to upload image' }));
    } finally {
      setUploadingProfile(false);
    }
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
      country: form.country || undefined,
      phoneNumber: form.phoneNumber || undefined,
      profileVisible: form.profileVisible,
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
            inputRef={firstNameRef}
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

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label='Birthday'
              value={form.birthday ? dayjs(form.birthday) : null}
              onChange={(date: Dayjs | null) => {
                setForm((f) => ({
                  ...f,
                  birthday: date ? date.format('YYYY-MM-DD') : '',
                }));
              }}
              maxDate={dayjs()}
              minDate={dayjs('1900-01-01')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                },
              }}
            />
          </LocalizationProvider>

          <Box sx={{ mt: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant={profileInputType === 'url' ? 'contained' : 'outlined'}
                onClick={() => setProfileInputType('url')}
                size='small'
              >
                Enter URL
              </Button>
              <Button
                variant={profileInputType === 'file' ? 'contained' : 'outlined'}
                onClick={() => setProfileInputType('file')}
                size='small'
                startIcon={<CloudUpload />}
              >
                Upload from PC
              </Button>
            </Box>
            {profileInputType === 'url' ? (
              <TextField
                fullWidth
                label='Profile Picture URL'
                name='profile'
                type='url'
                value={form.profile}
                onChange={handleChange}
                margin='normal'
                placeholder='https://example.com/image.jpg'
                sx={hideAsteriskSx}
              />
            ) : (
              <Box>
                <Button
                  variant='outlined'
                  component='label'
                  fullWidth
                  startIcon={<CloudUpload />}
                  disabled={uploadingProfile}
                  sx={{ mt: 1 }}
                >
                  {uploadingProfile ? 'Uploading...' : 'Choose Image File'}
                  <input
                    type='file'
                    hidden
                    accept='image/*'
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                  />
                </Button>
                {form.profile && (
                  <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                    Image uploaded: {form.profile}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Autocomplete
            options={countries}
            value={form.country || null}
            onChange={(_, newValue) => {
              setForm((f) => ({ ...f, country: newValue || '' }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Country'
                margin='normal'
                placeholder='Type to search... (e.g., Israel, Lebanon)'
                sx={hideAsteriskSx}
              />
            )}
            freeSolo
            fullWidth
          />

          <TextField
            fullWidth
            label='Phone Number'
            name='phoneNumber'
            type='tel'
            value={form.phoneNumber}
            onChange={handleChange}
            margin='normal'
            placeholder='+1 234 567 8900'
            sx={hideAsteriskSx}
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.profileVisible}
                onChange={(e) => setForm((f) => ({ ...f, profileVisible: e.target.checked }))}
                color='primary'
              />
            }
            label='Make my profile visible to others'
            sx={{ mt: 2, mb: 1 }}
          />

          {apiError && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {apiError}
            </Alert>
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
