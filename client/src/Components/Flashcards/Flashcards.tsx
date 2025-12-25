import { useEffect, useState } from 'react';
import GroupTable from './Group/GroupTable';
import {
  Box,
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
import { getAllGroups, moveGroup } from '../../store/slices/groupSlice';
import type { GroupType } from '../../types';
import StudySession from './Study/StudySession';

type StudyMode = 'review' | 'practice';

const Flashcards = () => {
  const flashCards = useSelector(
    (state: RootState) => state.groups?.groupsList
  );

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isStudying, setIsStudying] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>('review');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getAllGroups());
  }, [dispatch]);

  // Track when dragging starts/ends anywhere
  useEffect(() => {
    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => {
      setIsDragging(false);
      setIsDropZoneActive(false);
    };
    
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    
    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  const handleRootDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropZoneActive(true);
  };

  const handleRootDropZoneDragLeave = () => {
    setIsDropZoneActive(false);
  };

  const handleRootDropZoneDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropZoneActive(false);
    const draggedGroupId = e.dataTransfer.getData('groupId') || e.dataTransfer.getData('text/plain');
    if (draggedGroupId) {
      await dispatch(moveGroup({ groupId: draggedGroupId, parentId: null }));
      dispatch(getAllGroups());
    }
  };

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

  const handleGroupClick = (groupId: string, groupName: string, mode: StudyMode) => {
    setSelectedGroupId(groupId);
    setSelectedGroupName(groupName);
    setStudyMode(mode);
    setIsStudying(true);
  };

  const handleBackToTable = () => {
    setIsStudying(false);
    setSelectedGroupId('');
    setSelectedGroupName('');
    dispatch(getAllGroups());
  };

  if (isStudying && selectedGroupId) {
    return (
      <StudySession
        groupId={selectedGroupId}
        groupName={selectedGroupName}
        onBack={handleBackToTable}
        practiceMode={studyMode === 'practice'}
      />
    );
  }

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <TableHeader />

      {/* Drop zone to move groups to root level - always visible when dragging */}
      <Box
        onDragOver={handleRootDropZoneDragOver}
        onDragLeave={handleRootDropZoneDragLeave}
        onDrop={handleRootDropZoneDrop}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          border: isDropZoneActive ? '3px solid #4caf50' : '2px dashed #bbb',
          backgroundColor: isDropZoneActive ? '#c8e6c9' : isDragging ? '#e3f2fd' : 'transparent',
          textAlign: 'center',
          transition: 'all 0.2s',
          opacity: isDragging ? 1 : 0.5,
          minHeight: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography 
          variant="body2"
          color={isDropZoneActive ? 'success.main' : 'text.secondary'}
          sx={{ fontWeight: isDropZoneActive ? 600 : 400 }}
        >
          {isDropZoneActive ? '✓ Release to move to root level' : 'Drag a group here to move it to root level'}
        </Typography>
      </Box>

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
