import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../store/store';
import { deleteGroup } from '../../../../store/slices/groupSlice';

interface DeleteGroupModalProps {
  open: boolean;
  groupId: string;
  groupName: string;
  onClose: () => void;
}

const DeleteGroupModal: React.FC<DeleteGroupModalProps> = ({
  open,
  groupId,
  groupName,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleConfirmDelete = () => {
    dispatch(deleteGroup({ id: groupId }));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Delete Group</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the group "{groupName}"? This action
          cannot be undone and will also delete all cards in this group.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Cancel
        </Button>
        <Button onClick={handleConfirmDelete} color='error' variant='contained'>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteGroupModal;
