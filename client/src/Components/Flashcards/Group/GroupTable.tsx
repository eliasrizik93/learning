// GroupTable.tsx
import { IconButton, TableCell, TableRow } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import type { GroupType } from '../../../store/slices/groupSlice';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store/store';
import { addCardToGroup } from '../../../store/slices/groupSlice';
import AddCardModal from './AddCardModal/AddCardModal';

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
  const dispatch = useDispatch<AppDispatch>();

  const totalCards = group.cards?.length;
  const hasChildren = !!(groups && groups.length > 0);
  const [openModal, setOpenModal] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '' });
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
        await dispatch(addCardToGroup({
          groupId: id,
          question: newCard.question.trim(),
          answer: newCard.answer.trim(),
        })).unwrap();
        handleCloseModal();
      } catch (error) {
        console.error('Failed to add card:', error);
        // You might want to show a toast notification here
      }
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
          sx={{
            minWidth: 400,
            paddingLeft: level > 0 ? `${level * 32}px` : 0,
            cursor: 'pointer',
          }}
          onClick={handleOpenModal}
        >
          {name}
        </TableCell>

        <TableCell align='right'>{totalCards}</TableCell>
        <TableCell>
          {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}
        </TableCell>
        <TableCell>
          {updatedAt ? new Date(updatedAt).toLocaleDateString() : '—'}
        </TableCell>

        <TableCell align='left'>
          <IconButton size='small' aria-label='more'>
            ⋯
          </IconButton>
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
