// GroupTable.tsx
import {
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Box,
  TextField,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Edit,
  Delete,
  Add,
} from '@mui/icons-material';
import type { GroupType } from '../../../store/slices/groupSlice';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store/store';
import { addCardToGroup, updateGroup } from '../../../store/slices/groupSlice';
import AddCardModal from './AddCardModal/AddCardModal';
import DeleteGroupModal from './DeleteGroupModal/DeleteGroupModal';

type GroupTableProps = {
  group: GroupType;
  isOpen: boolean;
  toggleExpand: (id: string) => void;
  level?: number;
  expanded: Set<string>;
};

const GroupTable: React.FC<GroupTableProps> = ({
  group,
  toggleExpand,
  isOpen,
  level = 0,
  expanded,
}) => {
  const { id, name, updatedAt, createdAt, groups } = group;
  const [isEditName, setIsEditName] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [editedName, setEditedName] = useState(name);
  const totalCards = group.cards?.length;
  const hasChildren = !!(groups && groups.length > 0);
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
    if (newCard.question.trim() && newCard.answer.trim()) {
      try {
        await dispatch(
          addCardToGroup({
            groupId: id,
            question: newCard.question.trim(),
            answer: newCard.answer.trim(),
          })
        ).unwrap();
        handleCloseModal();
      } catch (error) {
        console.error('Failed to add card:', error);
        // You might want to show a toast notification here
      }
    }
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
        sx={{
          backgroundColor: getBackgroundColor(level),
          '&:hover': { backgroundColor: '#d3d3d3' },
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
            name
          )}
        </TableCell>

        <TableCell align='center'>{totalCards}</TableCell>
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
            />
          );
        })}
    </>
  );
};

export default GroupTable;
