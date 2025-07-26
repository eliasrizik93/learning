import { Box } from '@mui/material';
import './Message.scss';

const Message = () => {
  return (
    <Box className='message'>
      <Box className='message-header'>
        <Box className='avatar'>P</Box>
        <Box className='sender-info'>
          <Box className='first-name'>name</Box>
          <Box className='last-name'>last name</Box>
        </Box>
        <Box className='timestamp'>{new Date().toLocaleString()}</Box>
      </Box>
      <Box className='message-body'>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Enim error
        suscipit accusantium a minus quia iusto facilis maiores, quibusdam porro
        laboriosam corrupti dicta omnis, ex quaerat quam placeat consequatur!
        Soluta.
      </Box>
    </Box>
  );
};

export default Message;
