// GroupTable.tsx
import {
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Box,
  TextField,
  Chip,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Edit,
  Delete,
  Add,
  Refresh,
  PlayArrow,
  CreateNewFolder,
  DriveFileMove,
} from '@mui/icons-material';
import type { GroupType } from '../../../types';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store/store';
import { addCardToGroup, updateGroup, getAllGroups, createGroup, moveGroup } from '../../../store/slices/groupSlice';
import { resetGroupProgress } from '../../../store/slices/cardSlice';
import AddCardModal from './AddCardModal/AddCardModal';
import DeleteGroupModal from './DeleteGroupModal/DeleteGroupModal';

type StudyMode = 'review' | 'practice';

type GroupTableProps = {
  group: GroupType;
  isOpen: boolean;
  toggleExpand: (id: string) => void;
  level?: number;
  expanded: Set<string>;
  onGroupClick?: (groupId: string, groupName: string, mode: StudyMode) => void;
};

const GroupTable: React.FC<GroupTableProps> = ({
  group,
  toggleExpand,
  isOpen,
  level = 0,
  expanded,
  onGroupClick,
}) => {
  const { id, name, updatedAt, createdAt, children: groups } = group;
  const [isEditName, setIsEditName] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [editedName, setEditedName] = useState(name);
  const totalCards = group.cards?.length ?? 0;
  const hasChildren = !!(groups && groups.length > 0);
  const [isDragOver, setIsDragOver] = useState(false);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', id); // Use text/plain for better compatibility
    e.dataTransfer.setData('groupId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    // Try both data types for compatibility
    const draggedGroupId = e.dataTransfer.getData('groupId') || e.dataTransfer.getData('text/plain');
    
    // Don't drop on itself
    if (draggedGroupId === id || !draggedGroupId) return;
    
    await dispatch(moveGroup({ groupId: draggedGroupId, parentId: id }));
    dispatch(getAllGroups());
  };

  // Calculate card statistics
  const cardStats = useMemo(() => {
    const cards = group.cards ?? [];
    const now = new Date();
    const dueCards = cards.filter((c) => new Date(c.nextReviewAt) <= now).length;
    const newCards = cards.filter((c) => c.repetitions === 0).length;
    const learningCards = cards.filter((c) => c.repetitions > 0 && c.interval < 21).length;
    return { dueCards, newCards, learningCards };
  }, [group.cards]);
  const [openModal, setOpenModal] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewCard({ question: '', answer: '' });
  };
  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    const { name, value } = e.target;
    setNewCard((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    // Strip HTML tags to check if there's actual content
    const questionContent = newCard.question.replace(/<[^>]*>/g, '').trim();
    const answerContent = newCard.answer.replace(/<[^>]*>/g, '').trim();
    
    if (questionContent && answerContent) {
      try {
        await dispatch(
          addCardToGroup({
            groupId: id,
            questionText: newCard.question,
            answerText: newCard.answer,
          })
        ).unwrap();
        handleCloseModal();
      } catch (error) {
        console.error('Failed to add card:', error);
      }
    }
  };

  const handleQuestionChange = (value: string) => {
    setNewCard((prev) => ({ ...prev, question: value }));
  };

  const handleAnswerChange = (value: string) => {
    setNewCard((prev) => ({ ...prev, answer: value }));
  };

  const handleEditGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditName(true);
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditedName(value);
  };
  const handleDeleteGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleting(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      dispatch(updateGroup({ id, name: editedName }));
      setIsEditName(false);
    }
  };

  const getBackgroundColor = (lvl: number) =>
    lvl % 2 === 0 ? '#e9ecef' : '#f8f9fa';

  return (
    <>
      <AddCardModal
        open={openModal}
        groupId={id}
        groupName={name}
        values={newCard}
        onChange={handleChange}
        onClose={handleCloseModal}
        onCreate={handleCreate}
        onQuestionChange={handleQuestionChange}
        onAnswerChange={handleAnswerChange}
      />
      <DeleteGroupModal
        open={isDeleting}
        groupId={id}
        groupName={name}
        onClose={handleCloseDeleteModal}
      />
      <TableRow
        key={id}
        hover
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          backgroundColor: isDragOver ? '#c8e6c9' : getBackgroundColor(level),
          '&:hover': { backgroundColor: isDragOver ? '#c8e6c9' : '#d3d3d3' },
          cursor: 'grab',
          transition: 'background-color 0.2s',
          border: isDragOver ? '2px dashed #4caf50' : 'none',
        }}
      >
        <TableCell>
          {hasChildren && (
            <IconButton
              size='small'
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(id);
              }}
            >
              {isOpen ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
            </IconButton>
          )}
        </TableCell>
        <TableCell
          align='left'
          sx={{
            minWidth: 400,
            ...(level > 0 && { paddingLeft: `${level * 32}px` }),
            cursor: 'pointer',
          }}
          onClick={() => {
            if (!isEditName && onGroupClick && totalCards > 0) {
              onGroupClick(id, name, 'review');
            }
          }}
        >
          {isEditName ? (
            <TextField
              value={editedName}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              size="small"
              variant="outlined"
              autoFocus
              placeholder="Enter group name..."
              sx={{
                width: '280px',
                '& .MuiOutlinedInput-root': {
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease-in-out',
                  border: '1px solid #e1e5e9',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(102, 126, 234, 0.15)',
                    transform: 'translateY(-1px)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                    borderWidth: '2px',
                  },
                  '& fieldset': {
                    borderColor: '#e1e5e9',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '9px 14px',
                  fontWeight: 500,
                  color: '#2c3e50',
                  '&::placeholder': {
                    color: '#94a3b8',
                    opacity: 1,
                  },
                },
              }}
            />
          ) : (
            <Box
              sx={{
                color: totalCards && totalCards > 0 ? 'primary.main' : 'inherit',
                fontWeight: totalCards && totalCards > 0 ? 'bold' : 'normal',
                '&:hover': totalCards && totalCards > 0 ? {
                  textDecoration: 'underline',
                  color: 'primary.dark'
                } : {}
              }}
            >
              {name}
            </Box>
          )}
        </TableCell>

        <TableCell align='center'>
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={`${totalCards} total`}
              size='small'
              variant='outlined'
              sx={{ fontSize: '0.7rem' }}
            />
            {cardStats.dueCards > 0 && (
              <Chip
                label={`${cardStats.dueCards} due`}
                size='small'
                color='error'
                sx={{ fontSize: '0.7rem' }}
              />
            )}
            {cardStats.newCards > 0 && (
              <Chip
                label={`${cardStats.newCards} new`}
                size='small'
                color='info'
                sx={{ fontSize: '0.7rem' }}
              />
            )}
            {cardStats.learningCards > 0 && (
              <Chip
                label={`${cardStats.learningCards} learning`}
                size='small'
                color='warning'
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </TableCell>
        <TableCell align='left'>
          {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}
        </TableCell>
        <TableCell align='left'>
          {updatedAt ? new Date(updatedAt).toLocaleDateString() : '—'}
        </TableCell>

        <TableCell align='center'>
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              opacity: 0.7,
              '&:hover': { opacity: 1 },
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Tooltip title='Add Flashcard'>
              <IconButton
                size='small'
                onClick={handleOpenModal}
                sx={{ color: 'primary.main' }}
              >
                <Add fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Add Subgroup'>
              <IconButton
                size='small'
                onClick={async (e) => {
                  e.stopPropagation();
                  const subgroupName = window.prompt(`Enter name for new subgroup under "${name}":`);
                  if (subgroupName && subgroupName.trim()) {
                    await dispatch(createGroup({ name: subgroupName.trim(), parentId: id }));
                    dispatch(getAllGroups());
                  }
                }}
                sx={{ color: 'info.main' }}
              >
                <CreateNewFolder fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Rename Group'>
              <IconButton
                size='small'
                onClick={handleEditGroup}
                sx={{ color: 'text.secondary' }}
              >
                <Edit fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Remove Group'>
              <IconButton
                size='small'
                onClick={handleDeleteGroup}
                sx={{ color: 'error.main' }}
              >
                <Delete fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Reset Progress'>
              <IconButton
                size='small'
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm(`Reset all progress for "${name}"? This will make all cards due for review again.`)) {
                    await dispatch(resetGroupProgress({ groupId: id }));
                    dispatch(getAllGroups());
                  }
                }}
                sx={{ color: 'warning.main' }}
              >
                <Refresh fontSize='small' />
              </IconButton>
            </Tooltip>
            {level > 0 && (
              <Tooltip title='Move to Root Level'>
                <IconButton
                  size='small'
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm(`Move "${name}" to root level?`)) {
                      await dispatch(moveGroup({ groupId: id, parentId: null }));
                      dispatch(getAllGroups());
                    }
                  }}
                  sx={{ color: 'secondary.main' }}
                >
                  <DriveFileMove fontSize='small' />
                </IconButton>
              </Tooltip>
            )}
            {totalCards > 0 && (
              <Tooltip title='Practice All (no progress tracking)'>
                <IconButton
                  size='small'
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onGroupClick) {
                      onGroupClick(id, name, 'practice');
                    }
                  }}
                  sx={{ color: 'success.main' }}
                >
                  <PlayArrow fontSize='small' />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </TableRow>

      {isOpen &&
        hasChildren &&
        groups?.map((child: GroupType) => {
          const childIsOpen = expanded.has(child.id);
          return (
            <GroupTable
              key={child.id}
              group={child}
              isOpen={childIsOpen}
              toggleExpand={toggleExpand}
              level={level + 1}
              expanded={expanded}
              onGroupClick={onGroupClick}
            />
          );
        })}
    </>
  );
};

export default GroupTable;
