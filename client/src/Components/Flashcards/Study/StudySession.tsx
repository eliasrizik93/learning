import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Replay,
  ThumbDown,
  ThumbUp,
  Visibility,
} from '@mui/icons-material';
import type { AppDispatch, RootState } from '../../../store/store';
import {
  skipCard,
  reviewCard,
  getGroupDueCards,
  getGroupAllCards,
  endStudySession,
} from '../../../store/slices/cardSlice';
import type { ContentType, ReviewResponse } from '../../../types';

interface StudySessionProps {
  groupId: string;
  groupName: string;
  onBack: () => void;
  practiceMode?: boolean;
}

interface MediaContentProps {
  text?: string;
  type?: ContentType;
  mediaUrl?: string;
  label: 'Question' | 'Answer';
}

const MediaContent = ({ text, type, mediaUrl, label }: MediaContentProps) => {
  const labelColor = label === 'Question' ? 'primary.main' : 'secondary.main';

  // Debug: Log media URL to console
  if (mediaUrl && type !== 'TEXT') {
    console.log(`${label} media URL:`, mediaUrl, `Type:`, type);
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, color: labelColor, fontWeight: 'bold' }}
      >
        {label}:
      </Typography>

      {type === 'TEXT' && (
        <Box
          sx={{
            fontSize: '1.2rem',
            lineHeight: 1.8,
            '& p': { margin: 0 },
            '& ul, & ol': { paddingLeft: 3 },
          }}
          dangerouslySetInnerHTML={{ __html: text || 'No content' }}
        />
      )}

      {type === 'IMAGE' && mediaUrl && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {mediaUrl.split(',').map((url, index) => (
            <Box
              key={index}
              component="img"
              src={url.trim()}
              alt={`${label} ${index + 1}`}
              loading="lazy"
              onError={(e) => {
                console.error(`Failed to load image: ${url}`, e);
              }}
              sx={{
                maxWidth: '100%',
                maxHeight: 300,
                borderRadius: 2,
                boxShadow: 2,
              }}
            />
          ))}
        </Box>
      )}

      {type === 'AUDIO' && mediaUrl && (
        <Box 
          component="audio" 
          controls 
          src={mediaUrl} 
          onError={(e) => {
            console.error(`Failed to load audio: ${mediaUrl}`, e);
          }}
          sx={{ width: '100%' }} 
        />
      )}

      {type === 'VIDEO' && mediaUrl && (
        <Box
          component="video"
          controls
          src={mediaUrl}
          sx={{ maxWidth: '100%', maxHeight: 300, borderRadius: 2 }}
        />
      )}

      {text && type !== 'TEXT' && (
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          {text}
        </Typography>
      )}
    </Box>
  );
};

const StudySession = ({ groupId, groupName, onBack, practiceMode = false }: StudySessionProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentStudyCards, currentCardIndex, isLoading, isReviewing } = useSelector(
    (state: RootState) => state.cards
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [totalCards, setTotalCards] = useState(0);
  const [completedCards, setCompletedCards] = useState(0);

  useEffect(() => {
    const loadCards = async () => {
      if (practiceMode) {
        const result = await dispatch(getGroupAllCards({ groupId }));
        if (getGroupAllCards.fulfilled.match(result)) {
          setTotalCards(result.payload.length);
        }
      } else {
        const result = await dispatch(getGroupDueCards({ groupId }));
        if (getGroupDueCards.fulfilled.match(result)) {
          setTotalCards(result.payload.length);
        }
      }
      setHasInitialized(true);
    };
    loadCards();

    return () => {
      dispatch(endStudySession());
    };
  }, [dispatch, groupId, practiceMode]);

  const currentCard = useMemo(
    () => currentStudyCards[currentCardIndex],
    [currentStudyCards, currentCardIndex]
  );

  const isSessionComplete = useMemo(
    () => hasInitialized && !isLoading && currentStudyCards.length === 0,
    [hasInitialized, isLoading, currentStudyCards.length]
  );

  // In practice mode, just skip to next card without calling API
  const handlePracticeNext = useCallback(() => {
    dispatch(skipCard());
    setShowAnswer(false);
    setCompletedCards((prev) => prev + 1);
  }, [dispatch]);

  const handleReview = useCallback(
    async (response: ReviewResponse) => {
      if (!currentCard) return;
      if (practiceMode) {
        // In practice mode, just move to next card
        handlePracticeNext();
      } else {
        await dispatch(reviewCard({ cardId: currentCard.id, response }));
        setShowAnswer(false);
        setCompletedCards((prev) => prev + 1);
      }
    },
    [currentCard, dispatch, practiceMode, handlePracticeNext]
  );

  const handleBack = useCallback(() => {
    dispatch(endStudySession());
    onBack();
  }, [dispatch, onBack]);

  if (isLoading && !hasInitialized) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Loading cards...
        </Typography>
      </Container>
    );
  }

  if (isSessionComplete) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card
          elevation={6}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            🎉 Session Complete!
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            {practiceMode 
              ? `You've practiced all cards in "${groupName}"`
              : `You've reviewed all due cards in "${groupName}"`
            }
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleBack}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Back to Groups
          </Button>
        </Card>
      </Container>
    );
  }

  const progress = totalCards > 0 ? (completedCards / totalCards) * 100 : 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleBack}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          {groupName}
          {practiceMode && (
            <Chip
              label="Practice Mode"
              color="success"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        <Chip
          label={`${completedCards + 1} of ${totalCards}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 3, height: 8, borderRadius: 4 }}
      />

      {/* Card */}
      {currentCard && (
        <Card
          elevation={6}
          sx={{
            minHeight: 450,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 4 }}>
            {/* Question */}
            <MediaContent
              text={currentCard.questionText}
              type={currentCard.questionType}
              mediaUrl={currentCard.questionMediaUrl}
              label="Question"
            />

            {/* Answer */}
            {showAnswer ? (
              <MediaContent
                text={currentCard.answerText}
                type={currentCard.answerType}
                mediaUrl={currentCard.answerMediaUrl}
                label="Answer"
              />
            ) : (
              <Box
                sx={{
                  p: 4,
                  backgroundColor: 'grey.100',
                  borderRadius: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'grey.200',
                    transform: 'scale(1.01)',
                  },
                }}
                onClick={() => setShowAnswer(true)}
              >
                <Visibility sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Click to reveal answer
                </Typography>
              </Box>
            )}
          </CardContent>

          {/* Actions - only show when answer is revealed */}
          {showAnswer && (
            <Box
              sx={{
                p: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'grey.50',
              }}
            >
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<Replay />}
                  onClick={() => handleReview('AGAIN')}
                  disabled={isReviewing}
                  sx={{ flex: 1, py: 1.5 }}
                >
                  Again
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  startIcon={<ThumbDown />}
                  onClick={() => handleReview('HARD')}
                  disabled={isReviewing}
                  sx={{ flex: 1, py: 1.5 }}
                >
                  Hard
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<ThumbUp />}
                  onClick={() => handleReview('EASY')}
                  disabled={isReviewing}
                  sx={{ flex: 1, py: 1.5 }}
                >
                  Easy
                </Button>
              </Stack>
            </Box>
          )}

          {/* Card info */}
          {showAnswer && (
            <Box
              sx={{
                px: 3,
                py: 1,
                backgroundColor: 'grey.100',
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Interval: {currentCard.interval} days
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Reviews: {currentCard.repetitions}
              </Typography>
            </Box>
          )}
        </Card>
      )}
    </Container>
  );
};

export default StudySession;
