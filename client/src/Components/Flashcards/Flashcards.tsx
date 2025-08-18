import { useEffect, useState } from 'react';
import Group from './Group/GroupTable';
import GroupTable from './Group/GroupTable';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import TableHeader from './TableHeader/TableHeader';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { getAllGroups } from '../../store/slices/groupSlice';

export type Card = {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
  groupId: string;
};

type Group = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  groups?: Group[];
  cards?: Card[];
};

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
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Flashcard Groups</h1>
      <TableHeader />
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650 }}
          size='small'
          aria-label='flashcard groups table'
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: -53 }} />
              <TableCell>Name</TableCell>
              <TableCell align='right'>Total Cards</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {flashCards.map((group) => {
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
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Flashcards;
