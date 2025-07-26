import { Button, Input, TextareaAutosize } from '@mui/material';
import { useState } from 'react';
import Message from './Message/Message';

type MessageType = {
  id: string;
  firstName: string;
  lastName: string;
  content: string;
  profile: string;
  date: string;
  reactions?: { emoji: string; by: string }[];
  attachments?: {
    type: 'image' | 'file' | 'video';
    url: string;
    name?: string;
  }[];
  isDeleted?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  edited?: boolean;
};

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
