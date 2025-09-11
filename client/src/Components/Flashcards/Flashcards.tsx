import { useEffect, useState } from 'react';
import GroupTable from './Group/GroupTable';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Container,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { ArrowBack, ArrowForward, Visibility, VisibilityOff } from '@mui/icons-material';
import TableHeader from './TableHeader/TableHeader';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { getAllGroups } from '../../store/slices/groupSlice';
import type { GroupType, Card as CardType } from '../../types';

const Flashcards = () => {
  const flashCards = useSelector(
    (state: RootState) => state.groups?.groupsList
  );

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedGroupCards, setSelectedGroupCards] = useState<CardType[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(getAllGroups());
  }, [dispatch]);
  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleGroupClick = (groupId: string, groupName: string) => {
    const group = flashCards?.find(g => g.id === groupId);
    if (group && group.cards && group.cards.length > 0) {
      setSelectedGroupCards(group.cards);
      setSelectedGroupName(groupName);
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setViewMode('cards');
    }
  };

  const handleBackToTable = () => {
    setViewMode('table');
    setSelectedGroupCards([]);
    setSelectedGroupName('');
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const handleNextCard = () => {
    if (currentCardIndex < selectedGroupCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  if (viewMode === 'cards' && selectedGroupCards.length > 0) {
    const currentCard = selectedGroupCards[currentCardIndex];
    
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBackToTable}
          >
            Back to Groups
          </Button>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            {selectedGroupName} ({currentCardIndex + 1} of {selectedGroupCards.length})
          </Typography>
        </Box>

        <Card 
          elevation={6}
          sx={{ 
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
              Question:
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}>
              {currentCard.question}
            </Typography>

            <Typography variant="h6" sx={{ mb: 3, color: 'secondary.main', fontWeight: 'bold' }}>
              Answer:
            </Typography>
            {showAnswer ? (
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                {currentCard.answer}
              </Typography>
            ) : (
              <Box 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'grey.100', 
                  borderRadius: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.200' }
                }}
                onClick={toggleAnswer}
              >
                <Typography variant="body2" color="text.secondary">
                  Click to reveal answer
                </Typography>
              </Box>
            )}
          </CardContent>

          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton 
              onClick={handlePrevCard} 
              disabled={currentCardIndex === 0}
              size="large"
            >
              <ArrowBack />
            </IconButton>

            <Button
              variant="contained"
              startIcon={showAnswer ? <VisibilityOff /> : <Visibility />}
              onClick={toggleAnswer}
              sx={{ minWidth: 150 }}
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </Button>

            <IconButton 
              onClick={handleNextCard} 
              disabled={currentCardIndex === selectedGroupCards.length - 1}
              size="large"
            >
              <ArrowForward />
            </IconButton>
          </Box>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <TableHeader />

      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}
      >
        <TableContainer>
          <Table
            sx={{ minWidth: 650 }}
            size='medium'
            aria-label='flashcard groups table'
          >
            <TableHead>
              <TableRow
                sx={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '& .MuiTableCell-head': {
                    fontWeight: 'bold',
                    color: 'white',
                    borderBottom: '2px solid rgba(255,255,255,0.2)',
                  },
                }}
              >
                <TableCell sx={{ width: 48 }} />
                <TableCell align='left'>Group Name</TableCell>
                <TableCell align='center'>Total Cards</TableCell>
                <TableCell align='left'>Created</TableCell>
                <TableCell align='left'>Last Updated</TableCell>
                <TableCell align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {flashCards?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 8 }}>
                    <Typography
                      variant='h6'
                      color='text.secondary'
                      sx={{ mb: 1 }}
                    >
                      No flashcard groups yet
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Create your first group to get started with organizing
                      your flashcards
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                flashCards?.map((group: GroupType) => {
                  const isOpen = expanded.has(group.id);
                  return (
                    <GroupTable
                      key={group.id}
                      group={group}
                      isOpen={isOpen}
                      toggleExpand={toggleExpand}
                      level={0}
                      expanded={expanded}
                      onGroupClick={handleGroupClick}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Flashcards;
