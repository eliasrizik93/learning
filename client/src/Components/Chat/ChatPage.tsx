import { Box, Button, TextField } from '@mui/material';
import './ChatPage.scss';
import { useState } from 'react';
const ChatPage = () => {
  const [message, setMessage] = useState('');
  return (
    <div className='chat-container'>
      <div className='messages'></div>
      <Box sx={{ display: 'flex' }}>
        <TextField
          className='message-input'
          label='Message'
          variant='outlined'
          multiline
          rows={4}
          fullWidth
          sx={{
            padding: '10px',
            height: '100%',
            '& .MuiInputBase-root textarea': {
              resize: 'none',
            },
          }}
        />
        <Button variant='contained' sx={{ mr: '10px' }}>
          Send
        </Button>
      </Box>
    </div>
  );
};

export default ChatPage;
