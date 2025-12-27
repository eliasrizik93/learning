import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { Share, Send } from '@mui/icons-material';
import type { AppDispatch } from '../../store/store';
import { shareGroup } from '../../store/slices/groupSlice';

interface Props {
  open: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

const ShareGroupDialog = ({ open, onClose, groupId, groupName }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await dispatch(shareGroup({ groupId, recipientEmail: email })).unwrap();
      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Share color="primary" />
        Share Group
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" paragraph>
          Share "{groupName}" with another user. They will receive a full copy of the group and all its cards.
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            After sharing, both users will own independent copies. Changes won't sync between copies.
          </Alert>
        </Box>

        <TextField
          fullWidth
          label="Recipient Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter the recipient's email address"
          disabled={loading || success}
          error={!!error}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Group shared successfully! The recipient will be notified.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleShare}
          disabled={loading || success || !email.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
        >
          {loading ? 'Sharing...' : 'Share'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareGroupDialog;

