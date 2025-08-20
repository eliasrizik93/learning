import { Box, Button, Modal, TextField, Typography, IconButton } from '@mui/material';
import { Close, Add } from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  p: 0,
  overflow: 'hidden',
};

type AddGroupModalProps = {
  open: boolean;
  groupName: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClose: () => void;
  onCreate: () => void;
};

export default function AddGroupModal({
  open,
  groupName,
  onChange,
  onClose,
  onCreate,
}: AddGroupModalProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && groupName.trim()) {
      onCreate();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby='add-group-modal-title'
      aria-describedby='add-group-modal-description'
    >
      <Box sx={style}>
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add />
            <Typography id='add-group-modal-title' variant='h6' component='h2' sx={{ fontWeight: 'bold' }}>
              Create New Group
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Enter a name for your new flashcard group. This will help you organize your study materials.
          </Typography>
          
          <TextField
            label='Group Name'
            variant='outlined'
            value={groupName}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            autoFocus
            fullWidth
            placeholder="e.g., Spanish Vocabulary, Math Formulas..."
            sx={{
              mb: 4,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
          />

          {/* Actions */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'flex-end' 
          }}>
            <Button 
              variant='outlined' 
              onClick={onClose}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                borderColor: '#e0e0e0',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: '#bdbdbd',
                  bgcolor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant='contained' 
              onClick={onCreate}
              disabled={!groupName.trim()}
              startIcon={<Add />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Create Group
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
