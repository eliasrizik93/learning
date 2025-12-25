import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { Close, Add, Quiz } from '@mui/icons-material';
import * as React from 'react';
import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'list',
  'indent',
];

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  maxWidth: '95vw',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  p: 0,
  overflow: 'auto',
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
  onQuestionChange?: (value: string) => void;
  onAnswerChange?: (value: string) => void;
};

export default function AddCardModal({
  open,
  groupName,
  values,
  onClose,
  onCreate,
  onQuestionChange,
  onAnswerChange,
}: AddCardModalProps) {
  const [question, setQuestion] = useState(values.question);
  const [answer, setAnswer] = useState(values.answer);

  // Sync with parent values when modal opens
  React.useEffect(() => {
    if (open) {
      setQuestion(values.question);
      setAnswer(values.answer);
    }
  }, [open, values.question, values.answer]);

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
    onQuestionChange?.(value);
  };

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    onAnswerChange?.(value);
  };

  const isValid = question.replace(/<[^>]*>/g, '').trim() && answer.replace(/<[^>]*>/g, '').trim();

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby='add-card-title'
      aria-describedby='add-card-description'
    >
      <Box sx={style}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Quiz />
            <Typography
              id='add-card-title'
              variant='h6'
              component='h2'
              sx={{ fontWeight: 'bold' }}
            >
              Add New Card
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          <Typography variant='body2' sx={{ mb: 3, color: 'text.secondary' }}>
            Adding card to <strong>{groupName}</strong>
          </Typography>

          <TextField
            label='Group Name'
            variant='outlined'
            value={groupName}
            fullWidth
            disabled
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#f5f5f5',
              },
            }}
          />

          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 'bold' }}>
            Question
          </Typography>
          <Box
            sx={{
              mb: 3,
              '& .ql-editor': {
                minHeight: 100,
                fontSize: '1rem',
              },
              '& .ql-toolbar': {
                borderRadius: '8px 8px 0 0',
                borderColor: '#e0e0e0',
              },
              '& .ql-container': {
                borderRadius: '0 0 8px 8px',
                borderColor: '#e0e0e0',
              },
            }}
          >
            <ReactQuill
              theme='snow'
              value={question}
              onChange={handleQuestionChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder='Enter your question here...'
            />
          </Box>

          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 'bold' }}>
            Answer
          </Typography>
          <Box
            sx={{
              mb: 4,
              '& .ql-editor': {
                minHeight: 100,
                fontSize: '1rem',
              },
              '& .ql-toolbar': {
                borderRadius: '8px 8px 0 0',
                borderColor: '#e0e0e0',
              },
              '& .ql-container': {
                borderRadius: '0 0 8px 8px',
                borderColor: '#e0e0e0',
              },
            }}
          >
            <ReactQuill
              theme='snow'
              value={answer}
              onChange={handleAnswerChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder='Enter the answer here...'
            />
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
            }}
          >
            <Button
              variant='outlined'
              onClick={onClose}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                borderColor: '#e0e0e0',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: '#bdbdbd',
                  bgcolor: 'rgba(0,0,0,0.04)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              onClick={onCreate}
              disabled={!isValid}
              startIcon={<Add />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 'bold',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Add Card
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
