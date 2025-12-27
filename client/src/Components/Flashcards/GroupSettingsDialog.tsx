import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { Settings, Public, Lock } from '@mui/icons-material';
import type { AppDispatch } from '../../store/store';
import { updateGroupPublicSettings } from '../../store/slices/groupSlice';
import type { Group } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  group: Group;
}

const commonLanguages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Chinese', 'Korean', 'Russian', 'Arabic', 'Hindi',
];

const GroupSettingsDialog = ({ open, onClose, group }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isPublic, setIsPublic] = useState(group.isPublic || false);
  const [description, setDescription] = useState(group.description || '');
  const [language, setLanguage] = useState(group.language || '');
  const [tags, setTags] = useState<string[]>(group.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setIsPublic(group.isPublic || false);
    setDescription(group.description || '');
    setLanguage(group.language || '');
    setTags(group.tags || []);
  }, [group]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      await dispatch(updateGroupPublicSettings({
        groupId: group.id,
        isPublic,
        description,
        language: language || undefined,
        tags,
      })).unwrap();
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings color="primary" />
        Group Settings
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Public Toggle */}
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: isPublic ? 'success.50' : 'grey.100',
            border: '1px solid',
            borderColor: isPublic ? 'success.200' : 'grey.300',
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isPublic ? <Public color="success" /> : <Lock />}
                  <Box>
                    <Typography fontWeight={600}>
                      {isPublic ? 'Public Group' : 'Private Group'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isPublic 
                        ? 'Anyone can find and copy this group' 
                        : 'Only you can see this group'}
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Box>

          {/* Description */}
          <TextField
            label="Description"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this group is about..."
            helperText="A good description helps others find your group"
          />

          {/* Language */}
          <Autocomplete
            freeSolo
            options={commonLanguages}
            value={language}
            onChange={(_, newValue) => setLanguage(newValue || '')}
            onInputChange={(_, newValue) => setLanguage(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Language"
                placeholder="e.g., English, Spanish"
                helperText="What language are the cards in?"
              />
            )}
          />

          {/* Tags */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                sx={{ flexGrow: 1 }}
              />
              <Button variant="outlined" onClick={handleAddTag} disabled={!tagInput.trim()}>
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
              {tags.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No tags added. Tags help others find your group.
                </Typography>
              )}
            </Box>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Settings saved!</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupSettingsDialog;

