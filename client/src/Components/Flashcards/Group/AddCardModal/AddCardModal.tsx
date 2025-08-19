import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import * as React from 'react';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  alignContent: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
};

type AddCardModalProps = {
  open: boolean;
  groupId: string;
  groupName: string;
  values: { question: string; answer: string };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClose: () => void;
  onCreate: () => void;
};

export default function AddCardModal({
  open,
  groupName,
  values,
  onChange,
  onClose,
  onCreate,
}: AddCardModalProps) {
  const { question, answer } = values;

  return (
    <Modal
      open={open}
      onClose={onClose}
      keepMounted
      aria-labelledby='add-card-title'
      aria-describedby='add-card-description'
    >
      <Box sx={style}>
        <Typography id='add-card-title' variant='h6' component='h2'>
          Add Card to Group
        </Typography>

        <TextField
          label='Group Name'
          variant='filled'
          value={groupName}
          fullWidth
          disabled
          sx={{ mt: 2 }}
        />

        <TextField
          label='Question'
          name='question'
          variant='filled'
          value={question}
          onChange={onChange}
          autoFocus
          fullWidth
          sx={{ mt: 2 }}
        />

        <TextField
          label='Answer'
          name='answer'
          variant='filled'
          value={answer}
          onChange={onChange}
          fullWidth
          sx={{ mt: 2 }}
        />

        <Box
          sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}
        >
          <Button variant='text' onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={onCreate}
            disabled={!question.trim() || !answer.trim()}
          >
            Add Card
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
