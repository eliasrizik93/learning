import { Box, Button, Paper, Typography } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { useState } from 'react';
import AddGroupModal from './AddGroupModal/AddGroupModal';
import { createGroup } from '../../../store/slices/groupSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store/store';
import BrowseModal from '../BrowseModal/BrowseModal';

const TableHeader = () => {
  const [open, setOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const dispatch = useDispatch() as AppDispatch;
  const onGroupNameChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setGroupName(e.target.value);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleBrowseOpen = () => setBrowseOpen(true);
  const handleBrowseClose = () => setBrowseOpen(false);
  const handleCreateGroup = () => {
    setOpen(false);
    setGroupName('');
    dispatch(createGroup({ name: groupName }));
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 1 }}>
            Flashcard Manager
          </Typography>
          <Typography variant='body2' sx={{ opacity: 0.9 }}>
            Organize your study materials into groups and cards
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={handleOpen}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontWeight: 'bold',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Add Group
          </Button>

          <Button
            variant='outlined'
            startIcon={<Search />}
            onClick={handleBrowseOpen}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.5)',
              color: 'white',
              fontWeight: 'bold',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Browse
          </Button>
        </Box>
      </Box>

      {open && (
        <AddGroupModal
          open={open}
          groupName={groupName}
          onChange={onGroupNameChange}
          onClose={handleClose}
          onCreate={handleCreateGroup}
        />
      )}

      {browseOpen && (
        <BrowseModal open={browseOpen} onClose={handleBrowseClose} />
      )}
    </Paper>
  );
};

export default TableHeader;
