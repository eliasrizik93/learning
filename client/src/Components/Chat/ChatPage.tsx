import { Button, Input, TextareaAutosize } from '@mui/material';
import { useState } from 'react';

export default function ChatPage() {
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    const response = await fetch('http://localhost:3000/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello from React!',
      }),
    });

    const data = await response.json();
    console.log('Sent message:', data);
    setMessage('');
  };

  return (
    <div className='chat-container'>
      <div className='messages'>messages</div>
      <div>
        <TextareaAutosize
          className='message-input'
          minRows={3}
          style={{ width: 200 }}
        />
        <Button variant='contained' onClick={sendMessage}>
          Send
        </Button>
      </div>
    </div>
  );
}
