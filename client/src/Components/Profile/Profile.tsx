import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Switch,
  FormControlLabel,
  Alert,
  Autocomplete,
  IconButton,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import type { RootState } from '../../store/store';
import { Edit, Save, Cancel } from '@mui/icons-material';

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

interface FieldRowProps {
  label: string;
  value: string;
  field: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
  multiline?: boolean;
}

const FieldRow = ({ label, value, field, isEditing, onEdit, onSave, onCancel, onChange, disabled, type, multiline }: FieldRowProps) => (
  <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
        {label}
      </Typography>
      {!disabled && (
        <Box>
          {!isEditing ? (
            <IconButton size="small" onClick={onEdit} color="primary">
              <Edit fontSize="small" />
            </IconButton>
          ) : (
            <>
              <IconButton size="small" onClick={onSave} color="success">
                <Save fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={onCancel} color="error">
                <Cancel fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      )}
    </Box>
    {isEditing ? (
      <TextField
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type || 'text'}
        multiline={multiline}
        rows={multiline ? 3 : 1}
        autoFocus
      />
    ) : (
      <Typography variant="body1" sx={{ color: disabled ? 'text.disabled' : 'text.primary' }}>
        {value || '-'}
      </Typography>
    )}
  </Box>
);

const Profile = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profile: '',
    birthday: '',
    country: '',
    phoneNumber: '',
    profileVisible: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [originalData, setOriginalData] = useState(formData);

  useEffect(() => {
    if (user) {
      const [firstName, ...lastNameParts] = (user.name || '').split(' ');
      const data = {
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        email: user.email || '',
        profile: user.profile || '',
        birthday: user.birthday || '',
        country: (user as any).country || '',
        phoneNumber: (user as any).phoneNumber || '',
        profileVisible: (user as any).profileVisible ?? true,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [user]);

  const handleSaveField = async (field: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload: any = {};
      
      if (field === 'name') {
        payload.firstName = formData.firstName;
        payload.lastName = formData.lastName;
      } else if (field === 'profile') {
        payload.profile = formData.profile || undefined;
      } else if (field === 'birthday') {
        payload.birthday = formData.birthday || undefined;
      } else if (field === 'country') {
        payload.country = formData.country || undefined;
      } else if (field === 'phoneNumber') {
        payload.phoneNumber = formData.phoneNumber || undefined;
      } else if (field === 'profileVisible') {
        payload.profileVisible = formData.profileVisible;
      } else if (field === 'password') {
        if (!formData.currentPassword) {
          setError('Current password is required');
          setLoading(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 8) {
          setError('New password must be at least 8 characters');
          setLoading(false);
          return;
        }
        payload.currentPassword = formData.currentPassword;
        payload.password = formData.newPassword;
      }

      const response = await fetch(`http://localhost:3000/user/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess(`Updated successfully!`);
      setEditingField(null);
      if (field === 'password') {
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
      setTimeout(() => {
        setSuccess('');
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(originalData);
    setEditingField(null);
    setError('');
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Please log in to view your profile</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          My Profile
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={formData.profile || undefined}
              alt={`${formData.firstName} ${formData.lastName}`}
              sx={{ width: 120, height: 120, fontSize: 48 }}
            >
              {!formData.profile && formData.firstName.charAt(0).toUpperCase()}
            </Avatar>
            <IconButton
              size="small"
              onClick={() => setEditingField('profile')}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Box>
          {editingField === 'profile' && (
            <Box sx={{ mt: 2, width: '100%', maxWidth: 400 }}>
              <TextField
                fullWidth
                label="Profile Picture URL"
                value={formData.profile}
                onChange={(e) => setFormData(prev => ({ ...prev, profile: e.target.value }))}
                placeholder="Enter image URL"
                size="small"
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => handleSaveField('profile')}
                  startIcon={<Save />}
                >
                  Save
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => handleCancelEdit()}
                  startIcon={<Cancel />}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <FieldRow
          label="First Name"
          value={formData.firstName}
          field="firstName"
          isEditing={editingField === 'name'}
          onEdit={() => setEditingField('name')}
          onSave={() => handleSaveField('name')}
          onCancel={() => handleCancelEdit()}
          onChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
        />

        <FieldRow
          label="Last Name"
          value={formData.lastName}
          field="lastName"
          isEditing={editingField === 'name'}
          onEdit={() => setEditingField('name')}
          onSave={() => handleSaveField('name')}
          onCancel={() => handleCancelEdit()}
          onChange={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
        />

        <FieldRow
          label="Email"
          value={formData.email}
          field="email"
          isEditing={false}
          onEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onChange={() => {}}
          disabled
        />

        <FieldRow
          label="Phone Number"
          value={formData.phoneNumber}
          field="phoneNumber"
          isEditing={editingField === 'phoneNumber'}
          onEdit={() => setEditingField('phoneNumber')}
          onSave={() => handleSaveField('phoneNumber')}
          onCancel={() => handleCancelEdit()}
          onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
          type="tel"
        />

        <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Country
            </Typography>
            <Box>
              {editingField !== 'country' ? (
                <IconButton size="small" onClick={() => setEditingField('country')} color="primary">
                  <Edit fontSize="small" />
                </IconButton>
              ) : (
                <>
                  <IconButton size="small" onClick={() => handleSaveField('country')} color="success">
                    <Save fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleCancelEdit()} color="error">
                    <Cancel fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
          {editingField === 'country' ? (
            <Autocomplete
              options={countries}
              value={formData.country || null}
              onChange={(_, newValue) => setFormData(prev => ({ ...prev, country: newValue || '' }))}
              renderInput={(params) => <TextField {...params} placeholder="Select country" />}
              freeSolo
              fullWidth
            />
          ) : (
            <Typography variant="body1">{formData.country || '-'}</Typography>
          )}
        </Box>

        <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Birthday
            </Typography>
            <Box>
              {editingField !== 'birthday' ? (
                <IconButton size="small" onClick={() => setEditingField('birthday')} color="primary">
                  <Edit fontSize="small" />
                </IconButton>
              ) : (
                <>
                  <IconButton size="small" onClick={() => handleSaveField('birthday')} color="success">
                    <Save fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleCancelEdit()} color="error">
                    <Cancel fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
          {editingField === 'birthday' ? (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={formData.birthday ? dayjs(formData.birthday) : null}
                onChange={(date: Dayjs | null) => setFormData(prev => ({ ...prev, birthday: date ? date.format('YYYY-MM-DD') : '' }))}
                maxDate={dayjs()}
                minDate={dayjs('1900-01-01')}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          ) : (
            <Typography variant="body1">{formData.birthday || '-'}</Typography>
          )}
        </Box>

        <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Profile Visibility
            </Typography>
            <Box>
              {editingField !== 'profileVisible' ? (
                <IconButton size="small" onClick={() => setEditingField('profileVisible')} color="primary">
                  <Edit fontSize="small" />
                </IconButton>
              ) : (
                <>
                  <IconButton size="small" onClick={() => handleSaveField('profileVisible')} color="success">
                    <Save fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleCancelEdit()} color="error">
                    <Cancel fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={formData.profileVisible}
                onChange={(e) => setFormData(prev => ({ ...prev, profileVisible: e.target.checked }))}
                disabled={editingField !== 'profileVisible'}
              />
            }
            label={formData.profileVisible ? 'Public' : 'Private'}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>Change Password</Typography>
        
        <TextField
          fullWidth
          type="password"
          label="Current Password"
          value={formData.currentPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          type="password"
          label="New Password"
          value={formData.newPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
          helperText="At least 8 characters"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          type="password"
          label="Confirm New Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={() => handleSaveField('password')}
          disabled={loading || !formData.currentPassword || !formData.newPassword}
        >
          Update Password
        </Button>
      </Paper>
    </Container>
  );
};

export default Profile;
