import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import { Keyboard } from '@mui/icons-material';

const Settings = () => {
  const [hotkey, setHotkey] = useState('r');
  const [tempHotkey, setTempHotkey] = useState('r');
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load hotkey from localStorage
    const savedHotkey = localStorage.getItem('audioReplayHotkey');
    if (savedHotkey) {
      setHotkey(savedHotkey);
      setTempHotkey(savedHotkey);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('audioReplayHotkey', tempHotkey.toLowerCase());
    setHotkey(tempHotkey.toLowerCase());
    setIsEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    const key = e.key.toLowerCase();
    
    // Only allow single letter keys
    if (key.length === 1 && /^[a-z]$/.test(key)) {
      setTempHotkey(key);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Settings
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
            Settings saved successfully!
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Keyboard />
            <Typography variant="h6">Hotkeys</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Audio/Video Replay Hotkey
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Press this key while viewing a flashcard to replay the audio or video from the beginning.
            </Typography>

            {!isEditing ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    fontSize: 24,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {hotkey}
                </Box>
                <Button variant="outlined" onClick={() => setIsEditing(true)}>
                  Change Hotkey
                </Button>
              </Box>
            ) : (
              <Box>
                <TextField
                  fullWidth
                  label="Press any letter key"
                  value={tempHotkey.toUpperCase()}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  helperText="Press any letter (A-Z) to set as your hotkey"
                  sx={{ mb: 2, maxWidth: 300 }}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      fontSize: 24,
                      fontWeight: 700,
                      textAlign: 'center',
                    },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained" onClick={handleSave}>
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setTempHotkey(hotkey);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Current hotkey:</strong> Press <strong>{hotkey.toUpperCase()}</strong> to replay audio/video
            </Typography>
          </Alert>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;
