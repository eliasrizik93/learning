import { Button, TextareaAutosize } from '@mui/material';
import { useState } from 'react';
import Message from './Message/Message';

export default function ChatPage() {
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    const response = await fetch('http://localhost:3000/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
      }),
    });

    const data = await response.json();
    console.log('Sent message:', data);
    setMessage('');
  };

  return (
    <div className='chat-container'>
      <div className='messages'>
        <Message />
      </div>
      <div>
        <TextareaAutosize
          className='message-input'
          minRows={3}
          maxRows={3} // ✅ prevents growing
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: 200, resize: 'none' }}
        />

        <Button variant='contained' onClick={sendMessage}>
          Send
        </Button>
      </div>
    </div>
  );
}
