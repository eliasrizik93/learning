// GroupTable.tsx
import type { Group } from '../Flashcards';
import { Box, IconButton, TableCell, TableRow } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';

type GroupTableProps = {
  group: Group;
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
  const { id, name, updatedAt, groups } = group;

  const getTotalCards = (g: Group): number => {
    let total = g.cards ? g.cards.length : 0; // <-- use the parameter, not outer scope
    if (g.groups && g.groups.length) {
      total += g.groups.reduce((sum, sub) => sum + getTotalCards(sub), 0);
    }
    return total;
  };

  const totalCards = getTotalCards(group);
  const hasChildren = !!(groups && groups.length > 0);

  const getBackgroundColor = (lvl: number) =>
    lvl % 2 === 0 ? '#e9ecef' : '#f8f9fa';

  return (
    <>
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
            <IconButton size='small' onClick={() => toggleExpand(id)}>
              {isOpen ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
            </IconButton>
          )}
        </TableCell>
        <TableCell
          sx={{ minWidth: 400, paddingLeft: level > 0 ? `${level * 32}px` : 0 }}
        >
          {name}
        </TableCell>

        <TableCell align='right'>{totalCards}</TableCell>

        <TableCell>
          {updatedAt ? new Date(updatedAt).toLocaleDateString() : '—'}
        </TableCell>

        {/* Actions */}
        <TableCell align='left'>
          <IconButton size='small' aria-label='more'>
            ⋯
          </IconButton>
        </TableCell>
      </TableRow>

      {isOpen &&
        hasChildren &&
        groups!.map((child) => {
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
