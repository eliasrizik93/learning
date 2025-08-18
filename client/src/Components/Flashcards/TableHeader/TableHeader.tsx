import { Box, Button } from '@mui/material';
import { useState } from 'react';
import AddGroupModal from './AddGroupModal/AddGroupModal';
import { createGroup } from '../../../store/slices/groupSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store/store';

const TableHeader = () => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const dispatch = useDispatch() as AppDispatch;
  const onGroupNameChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setGroupName(e.target.value);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCreateGroup = () => {
    setOpen(false);
    setGroupName('');
    dispatch(createGroup({ name: groupName }));
  };
  return (
    <Box>
      <Button onClick={handleOpen}>Add Group</Button>
      <Button>Browse</Button>
      {open && (
        <AddGroupModal
          open={open}
          groupName={groupName}
          onChange={onGroupNameChange}
          onClose={handleClose}
          onCreate={handleCreateGroup}
        />
      )}
    </Box>
  );
};

export default TableHeader;
