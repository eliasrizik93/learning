import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store/store';
import { createCard, updateCard } from '../../../store/slices/cardSlice';
import { getAllGroups } from '../../../store/slices/groupSlice';
import type { Card, ContentType } from '../../../types';

interface CardModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  card?: Card | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div hidden={value !== index} style={{ paddingTop: 16 }}>
    {value === index && children}
  </div>
);

const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'TEXT', label: 'Text' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'VIDEO', label: 'Video' },
];

const CardModal = ({ open, onClose, groupId, card }: CardModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Question fields
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<ContentType>('TEXT');
  const [questionMediaUrl, setQuestionMediaUrl] = useState('');

  // Answer fields
  const [answerText, setAnswerText] = useState('');
  const [answerType, setAnswerType] = useState<ContentType>('TEXT');
  const [answerMediaUrl, setAnswerMediaUrl] = useState('');

  useEffect(() => {
    if (card) {
      setQuestionText(card.questionText || '');
      setQuestionType(card.questionType || 'TEXT');
      setQuestionMediaUrl(card.questionMediaUrl || '');
      setAnswerText(card.answerText || '');
      setAnswerType(card.answerType || 'TEXT');
      setAnswerMediaUrl(card.answerMediaUrl || '');
    } else {
      resetForm();
    }
  }, [card, open]);

  const resetForm = () => {
    setQuestionText('');
    setQuestionType('TEXT');
    setQuestionMediaUrl('');
    setAnswerText('');
    setAnswerType('TEXT');
    setAnswerMediaUrl('');
    setActiveTab(0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (card) {
        await dispatch(
          updateCard({
            cardId: card.id,
            questionText,
            questionType,
            questionMediaUrl: questionMediaUrl || undefined,
            answerText,
            answerType,
            answerMediaUrl: answerMediaUrl || undefined,
          })
        ).unwrap();
      } else {
        await dispatch(
          createCard({
            groupId,
            questionText,
            questionType,
            questionMediaUrl: questionMediaUrl || undefined,
            answerText,
            answerType,
            answerMediaUrl: answerMediaUrl || undefined,
          })
        ).unwrap();
      }
      dispatch(getAllGroups());
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to save card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContentFields = (
    type: ContentType,
    setType: (t: ContentType) => void,
    text: string,
    setText: (t: string) => void,
    mediaUrl: string,
    setMediaUrl: (u: string) => void,
    label: string
  ) => (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Content Type</InputLabel>
        <Select
          value={type}
          label="Content Type"
          onChange={(e) => setType(e.target.value as ContentType)}
        >
          {contentTypes.map((ct) => (
            <MenuItem key={ct.value} value={ct.value}>
              {ct.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={4}
        label={`${label} Text`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{ mb: 2 }}
        placeholder={
          type === 'TEXT'
            ? `Enter your ${label.toLowerCase()} here...`
            : `Optional caption for the ${type.toLowerCase()}`
        }
      />

      {type !== 'TEXT' && (
        <TextField
          fullWidth
          label={`${type} URL`}
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder={`Enter ${type.toLowerCase()} URL...`}
          helperText={`Provide a URL to the ${type.toLowerCase()} file`}
        />
      )}

      {type === 'IMAGE' && mediaUrl && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Preview:
          </Typography>
          <Box
            component="img"
            src={mediaUrl}
            alt="Preview"
            sx={{
              maxWidth: '100%',
              maxHeight: 150,
              borderRadius: 1,
              mt: 1,
              display: 'block',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </Box>
      )}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {card ? 'Edit Card' : 'Create New Card'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="Question" />
            <Tab label="Answer" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Configure the question side of your flashcard
          </Typography>
          {renderContentFields(
            questionType,
            setQuestionType,
            questionText,
            setQuestionText,
            questionMediaUrl,
            setQuestionMediaUrl,
            'Question'
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Configure the answer side of your flashcard
          </Typography>
          {renderContentFields(
            answerType,
            setAnswerType,
            answerText,
            setAnswerText,
            answerMediaUrl,
            setAnswerMediaUrl,
            'Answer'
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || (!questionText && !questionMediaUrl)}
        >
          {isSubmitting ? 'Saving...' : card ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CardModal;
