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
} from '@mui/material';
import TableHeader from './TableHeader/TableHeader';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { getAllGroups } from '../../store/slices/groupSlice';
import type { GroupType } from '../../types';

const Flashcards = () => {
  const flashCards = useSelector(
    (state: RootState) => state.groups?.groupsList
  );

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
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
