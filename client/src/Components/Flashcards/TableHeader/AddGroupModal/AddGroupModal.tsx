import { Box, Button, Modal, TextField, Typography } from '@mui/material';
const style = {
  position: 'absolute',
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
  return (
    <Modal
      open={open}
      onClose={onClose}
      keepMounted
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={style}>
        <Typography id='modal-modal-title' variant='h6' component='h2'>
          Add Group Name
        </Typography>
        <TextField
          label='Group Name'
          variant='filled'
          value={groupName}
          onChange={onChange}
          autoFocus
          fullWidth
        />
        <Box sx={{ ml: 'auto' }}>
          <Button variant='contained' sx={{ mt: 2 }} onClick={onCreate}>
            Add Group
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
