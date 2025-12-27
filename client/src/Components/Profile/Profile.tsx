import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  Autocomplete,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  CloudUpload,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import { useAppSelector, useAppDispatch } from '../../store/hooks/hooks';
import { updateUser } from '../../store/slices/authSlice';
import { apiFetch } from '../../lib/apiFetch';
import { uploadFile } from '../../lib/uploadFile';
import { store } from '../../store/store';

// List of countries for autocomplete
const countries = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Cape Verde',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kosovo',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Korea',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Korea',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
];

const Profile = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const hydrated = useAppSelector((state) => state.auth.hydrated);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileUrlInputRef = useRef<HTMLInputElement>(null);

  // Split name into firstName and lastName
  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return { firstName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profile: '',
    birthday: '',
    country: '',
    phoneNumber: '',
    profileVisible: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Initialize formData from user when user becomes available
  useEffect(() => {
    if (user && hydrated) {
      const { firstName, lastName } = splitName(user.name || '');

      // Convert birthday to date string format
      let birthdayStr = '';
      if (user.birthday) {
        try {
          const birthdayDate = new Date(user.birthday);
          if (!isNaN(birthdayDate.getTime())) {
            birthdayStr = birthdayDate.toISOString().split('T')[0];
          }
        } catch {
          // Ignore parse errors
        }
      }

      setFormData({
        firstName: firstName || '',
        lastName: lastName || '',
        email: user.email || '',
        profile: user.profile || '',
        birthday: birthdayStr,
        country: user.country || '',
        phoneNumber: user.phoneNumber || '',
        profileVisible: user.profileVisible ?? true,
      });
    }
  }, [user, hydrated]);

  // Wait for hydration to complete
  useEffect(() => {
    if (hydrated) {
      setFetchLoading(false);
    }
  }, [hydrated]);

  const handleFileUpload = async (file: File) => {
    setUploadingProfile(true);
    setError('');
    try {
      const url = await uploadFile(file);
      setFormData({ ...formData, profile: url });
    } catch (err) {
      setError('Failed to upload image');
      console.error('Upload error:', err);
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleSaveProfileVisibility = async (value: boolean) => {
    if (!user || !token) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch(
        `/users/${user.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            profileVisible: value,
          }),
        },
        store.getState
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile visibility');
      }

      const updatedUser = await response.json();

      // Update Redux store with the updated user data
      dispatch(updateUser(updatedUser));

      setSuccess('Profile visibility updated successfully!');

      setTimeout(() => {
        setSuccess('');
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to update profile visibility';
      setError(errorMessage);
      // Revert the toggle on error
      setFormData({ ...formData, profileVisible: !value });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !token) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Combine firstName and lastName into name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const updateData: Record<string, unknown> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: fullName,
      };

      if (formData.profile) {
        updateData.profile = formData.profile;
      }

      if (formData.birthday) {
        updateData.birthday = formData.birthday;
      }

      if (formData.country) {
        updateData.country = formData.country;
      }

      if (formData.phoneNumber) {
        updateData.phoneNumber = formData.phoneNumber;
      }

      updateData.profileVisible = formData.profileVisible;

      // Update profile
      const response = await apiFetch(
        `/users/${user.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        },
        store.getState
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();

      // Update password if provided
      if (
        passwordData.currentPassword &&
        passwordData.newPassword &&
        passwordData.newPassword === passwordData.confirmPassword
      ) {
        const passwordResponse = await apiFetch(
          `/users/${user.id}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              password: passwordData.newPassword,
              currentPassword: passwordData.currentPassword,
            }),
          },
          store.getState
        );

        if (!passwordResponse.ok) {
          const data = await passwordResponse.json();
          throw new Error(data.message || 'Failed to change password');
        }
      }

      // Update Redux store with the updated user data
      dispatch(updateUser(updatedUser));

      setSuccess('Profile updated successfully!');
      setEditMode(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        setSuccess('');
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      const { firstName, lastName } = splitName(user.name || '');
      setFormData({
        firstName,
        lastName,
        email: user.email || '',
        profile: user.profile || '',
        birthday: user.birthday
          ? new Date(user.birthday).toISOString().split('T')[0]
          : '',
        country: user.country || '',
        phoneNumber: user.phoneNumber || '',
        profileVisible: user.profileVisible ?? true,
      });
    }
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setEditMode(false);
    setError('');
  };

  // Wait for hydration before showing anything
  if (!hydrated || fetchLoading) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

  if (!user || !token) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='h6'>
            Please log in to view your profile
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant='h4' sx={{ fontWeight: 700 }}>
            My Profile
          </Typography>
          {!editMode ? (
            <Button
              variant='contained'
              startIcon={<Edit />}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant='contained'
                color='success'
                startIcon={<Save />}
                onClick={handleSave}
                disabled={loading}
              >
                Save
              </Button>
              <Button
                variant='outlined'
                color='error'
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>

        {success && (
          <Alert
            severity='success'
            sx={{ mb: 3 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CircularProgress />
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Avatar
            src={formData.profile || undefined}
            alt={`${formData.firstName} ${formData.lastName}`}
            sx={{ width: 120, height: 120, fontSize: 48, mb: 2 }}
          >
            {!formData.profile &&
              (
                formData.firstName.charAt(0) ||
                formData.lastName.charAt(0) ||
                'U'
              ).toUpperCase()}
          </Avatar>
          {editMode ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: '100%',
                maxWidth: 400,
              }}
            >
              <Button
                variant='outlined'
                component='label'
                startIcon={<CloudUpload />}
                disabled={uploadingProfile}
              >
                {uploadingProfile ? 'Uploading...' : 'Upload from PC'}
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
              <TextField
                fullWidth
                label='Or enter image URL'
                value={formData.profile}
                inputRef={profileUrlInputRef}
                onChange={(e) =>
                  setFormData({ ...formData, profile: e.target.value })
                }
                placeholder='https://example.com/image.jpg'
                size='small'
              />
            </Box>
          ) : (
            <Typography variant='body2' color='text.secondary'>
              {formData.profile ? 'Click edit to change' : 'No profile picture'}
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography
              variant='subtitle2'
              color='text.secondary'
              sx={{ mb: 1 }}
            >
              First Name
            </Typography>
            {editMode ? (
              <TextField
                fullWidth
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder='Enter your first name'
              />
            ) : (
              <Typography variant='body1' sx={{ fontSize: '1.1rem' }}>
                {formData.firstName || '-'}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography
              variant='subtitle2'
              color='text.secondary'
              sx={{ mb: 1 }}
            >
              Last Name
            </Typography>
            {editMode ? (
              <TextField
                fullWidth
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder='Enter your last name'
              />
            ) : (
              <Typography variant='body1' sx={{ fontSize: '1.1rem' }}>
                {formData.lastName || '-'}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography
              variant='subtitle2'
              color='text.secondary'
              sx={{ mb: 1 }}
            >
              Email
            </Typography>
            <Typography
              variant='body1'
              sx={{ fontSize: '1.1rem', color: 'text.disabled' }}
            >
              {formData.email || '-'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Email cannot be changed
            </Typography>
          </Box>

          <Box>
            <Typography
              variant='subtitle2'
              color='text.secondary'
              sx={{ mb: 1 }}
            >
              Password
            </Typography>
            {editMode ? (
              <>
                <TextField
                  fullWidth
                  label='Current Password'
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label='New Password'
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  helperText='Password must be at least 8 characters'
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge='end'
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label='Confirm New Password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  error={
                    passwordData.confirmPassword !== '' &&
                    passwordData.newPassword !== passwordData.confirmPassword
                  }
                  helperText={
                    passwordData.confirmPassword !== '' &&
                    passwordData.newPassword !== passwordData.confirmPassword
                      ? 'Passwords do not match'
                      : ''
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge='end'
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            ) : (
              <Typography variant='body1' sx={{ fontSize: '1.1rem' }}>
                ••••••••
              </Typography>
            )}
          </Box>

          <Box>
            <Typography
              variant='subtitle2'
              color='text.secondary'
              sx={{ mb: 1 }}
            >
              Birthday
            </Typography>
            {editMode ? (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={formData.birthday ? dayjs(formData.birthday) : null}
                  onChange={(date: Dayjs | null) => {
                    setFormData({
                      ...formData,
                      birthday: date ? date.format('YYYY-MM-DD') : '',
                    });
                  }}
                  maxDate={dayjs()}
                  minDate={dayjs('1900-01-01')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            ) : (
              <Typography variant='body1' sx={{ fontSize: '1.1rem' }}>
                {formData.birthday || '-'}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography
              variant='subtitle2'
              color='text.secondary'
              sx={{ mb: 1 }}
            >
              Country
            </Typography>
            {editMode ? (
              <Autocomplete
                options={countries}
                value={formData.country || null}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, country: newValue || '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder='Type to search...'
                    fullWidth
                  />
                )}
                freeSolo
                fullWidth
              />
            ) : (
              <Typography variant='body1' sx={{ fontSize: '1.1rem' }}>
                {formData.country || '-'}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography
              variant='subtitle2'
              color='text.secondary'
              sx={{ mb: 1 }}
            >
              Phone Number
            </Typography>
            {editMode ? (
              <TextField
                fullWidth
                type='tel'
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder='+1 234 567 8900'
              />
            ) : (
              <Typography variant='body1' sx={{ fontSize: '1.1rem' }}>
                {formData.phoneNumber || '-'}
              </Typography>
            )}
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.profileVisible}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setFormData({
                      ...formData,
                      profileVisible: newValue,
                    });
                    // Auto-save when toggled
                    handleSaveProfileVisibility(newValue);
                  }}
                  color='primary'
                  disabled={loading}
                />
              }
              label='Make my profile visible to others'
              sx={{ mt: 2, mb: 1 }}
            />
          </Box>

          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant='subtitle2'
              color='text.secondary'
              sx={{ mb: 1 }}
            >
              Member Since
            </Typography>
            <Typography variant='body1' sx={{ fontSize: '1.1rem' }}>
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
