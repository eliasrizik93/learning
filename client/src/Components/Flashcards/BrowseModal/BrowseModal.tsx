import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Card } from '../../../types';

interface BrowseModalProps {
  open: boolean;
  onClose: () => void;
}

const BrowseModal = ({ open, onClose }: BrowseModalProps) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/card');

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setCards(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch cards');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGroupClick = (groupId: string, groupName: string) => {
    onClose();
    navigate(
      `/cards?groupId=${groupId}&groupName=${encodeURIComponent(groupName)}`
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='400px'
          flexDirection='column'
          gap={2}
        >
          <CircularProgress size={40} />
          <Typography variant='body1' color='text.secondary'>
            Loading cards...
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
          minHeight='400px'
        >
          <Alert severity='error' sx={{ maxWidth: 400 }}>
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
          minHeight='400px'
        >
          <Alert severity='info' sx={{ maxWidth: 400 }}>
            No cards found. Create your first flashcard to get started!
          </Alert>
        </Box>
      );
    }

    return (
      <Box
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}
      >
        <TableContainer
          component={Paper}
          sx={{
            flexGrow: 1,
            maxHeight: '60vh',
            boxShadow: 3,
            borderRadius: 2,
            overflow: 'auto',
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'primary.main',
                    color: 'white',
                  }}
                >
                  ID
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'primary.main',
                    color: 'white',
                  }}
                >
                  Group
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'primary.main',
                    color: 'white',
                  }}
                >
                  Created Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'primary.main',
                    color: 'white',
                  }}
                >
                  Question
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'primary.main',
                    color: 'white',
                  }}
                >
                  Answer
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cards.map((card) => (
                <TableRow
                  key={card.id}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'action.hover',
                    },
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <TableCell
                    sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}
                  >
                    #{card?.id}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={card.group?.name || 'No Group'}
                      size='medium'
                      color={card.group?.name ? 'primary' : 'default'}
                      variant={card.group?.name ? 'filled' : 'outlined'}
                      clickable={!!card.group?.name}
                      onClick={
                        card.group?.name
                          ? () =>
                              handleGroupClick(card.groupId, card.group!.name)
                          : undefined
                      }
                      sx={{
                        fontWeight: 'bold',
                        minWidth: '80px',
                        cursor: card.group?.name ? 'pointer' : 'default',
                        '& .MuiChip-label': {
                          fontSize: '0.875rem',
                        },
                        '&:hover': card.group?.name
                          ? {
                              backgroundColor: 'primary.dark',
                              transform: 'scale(1.05)',
                            }
                          : {},
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {formatDate(card.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography
                      variant='body2'
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={card.question}
                    >
                      {card.question}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography
                      variant='body2'
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={card.answer}
                    >
                      {card.answer}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1,
          }}
        >
          <Typography variant='body2' color='text.secondary'>
            Total cards: <strong>{cards.length}</strong>
          </Typography>
          <Typography variant='caption' color='text.disabled'>
            Scroll to view all data
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>Browse All Cards</Box>
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, height: '100%', overflow: 'hidden' }}>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default BrowseModal;
