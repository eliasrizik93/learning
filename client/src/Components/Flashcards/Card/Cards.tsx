import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  ThumbDown,
  School,
  CheckCircle,
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Card as CardType } from '../../../types';

const Cards = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const groupId = searchParams.get('groupId');
  const groupName = searchParams.get('groupName');

  const [cards, setCards] = useState<CardType[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/card');

        if (!response.ok) {
          throw new Error('Failed to fetch cards');
        }

        const result = await response.json();

        if (result.success && result.data) {
          let filteredCards = result.data;

          // Filter by group if groupId is provided
          if (groupId) {
            filteredCards = result.data.filter(
              (card: CardType) => card.groupId === groupId
            );
          }

          setCards(filteredCards);
        } else {
          throw new Error(result.message || 'Failed to fetch cards');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [groupId]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleDifficultyResponse = (
    difficulty: 'incorrect' | 'hard' | 'easy'
  ) => {
    // TODO: Implement spaced repetition logic here
    console.log(`Card ${currentCardIndex + 1} marked as: ${difficulty}`);

    // Move to next card
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // Finished all cards
      alert("Congratulations! You've completed all cards in this session.");
      navigate('/');
    }
  };

  const currentCard = cards[currentCardIndex];
  const progress =
    cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0;

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='80vh'
        flexDirection='column'
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant='h6' color='text.secondary'>
          Loading flashcards...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='80vh'
      >
        <Alert severity='error' sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (cards.length === 0) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='80vh'
      >
        <Alert severity='info' sx={{ maxWidth: 500 }}>
          No cards found for this group. Add some flashcards to get started!
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant='h4' gutterBottom>
          Flashcard Study Session
        </Typography>
        {groupName && (
          <Chip
            label={groupName}
            color='primary'
            size='medium'
            sx={{ mb: 2, fontWeight: 'bold' }}
          />
        )}
        <Typography variant='body1' color='text.secondary'>
          Card {currentCardIndex + 1} of {cards.length}
        </Typography>
        <LinearProgress
          variant='determinate'
          value={progress}
          sx={{ mt: 2, height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Flashcard */}
      <Paper
        elevation={8}
        sx={{
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 600, boxShadow: 4 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography
              variant='h5'
              gutterBottom
              color='primary'
              fontWeight='bold'
            >
              Question
            </Typography>
            <Typography variant='h6' sx={{ mb: 3, lineHeight: 1.6 }}>
              {currentCard.question}
            </Typography>

            {showAnswer && (
              <Box sx={{ mt: 4, pt: 3, borderTop: '2px solid #e0e0e0' }}>
                <Typography
                  variant='h5'
                  gutterBottom
                  color='secondary'
                  fontWeight='bold'
                >
                  Answer
                </Typography>
                <Typography variant='h6' sx={{ lineHeight: 1.6 }}>
                  {currentCard.answer}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Paper>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {!showAnswer ? (
          <Button
            variant='contained'
            size='large'
            startIcon={<Visibility />}
            onClick={handleShowAnswer}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 2,
            }}
          >
            Show Answer
          </Button>
        ) : (
          <>
            <Button
              variant='contained'
              color='error'
              size='large'
              startIcon={<ThumbDown />}
              onClick={() => handleDifficultyResponse('incorrect')}
              sx={{
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 2,
              }}
            >
              Incorrect
            </Button>
            <Button
              variant='contained'
              color='warning'
              size='large'
              startIcon={<School />}
              onClick={() => handleDifficultyResponse('hard')}
              sx={{
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 2,
              }}
            >
              Hard
            </Button>
            <Button
              variant='contained'
              color='success'
              size='large'
              startIcon={<CheckCircle />}
              onClick={() => handleDifficultyResponse('easy')}
              sx={{
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 2,
              }}
            >
              Easy
            </Button>
          </>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant='outlined'
          onClick={() => navigate('/')}
          sx={{ fontWeight: 'bold' }}
        >
          Back to Browse
        </Button>
      </Box>
    </Box>
  );
};

export default Cards;
