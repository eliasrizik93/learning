import type { Group } from '../Flashcards';
import { IconButton, TableCell, TableRow } from '@mui/material';
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
  const { id, name, updatedAt, groups, cards } = group;

  const getTotalCards = (group: Group): number => {
    let total = cards ? cards.length : 0;
    if (group.groups) {
      total += group.groups.reduce(
        (sum, subGroup) => sum + getTotalCards(subGroup),
        0
      );
    }
    return total;
  };

  const totalCards = getTotalCards(group);
  const hasChildren = groups && groups.length > 0;

  const getBackgroundColor = (level: number) => {
    if (level === 0) return '#ffffff'; // White for root level
    if (level === 1) return '#f8f9fa'; // Very light gray
    if (level === 2) return '#e9ecef'; // Light gray
    if (level === 3) return '#dee2e6'; // Medium light gray
    return level % 2 === 0 ? '#e9ecef' : '#f8f9fa'; // Alternate for deeper levels
  };

  return (
    <>
      <TableRow
        key={id}
        hover
        sx={{
          cursor: 'pointer',
          backgroundColor: getBackgroundColor(level),
          '&:hover': {
            backgroundColor: '#d3d3d3',
          },
        }}
      >
        <TableCell>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: `${level * 32}px`,
            }}
          >
            {hasChildren ? (
              <IconButton size='small' onClick={() => toggleExpand(id)}>
                {isOpen ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
              </IconButton>
            ) : (
              <div style={{ width: '40px' }} />
            )}
          </div>
        </TableCell>
        <TableCell>{name}</TableCell>
        <TableCell align='right'>{totalCards}</TableCell>
        <TableCell>{new Date(updatedAt).toLocaleDateString()}</TableCell>
        <TableCell>
          <IconButton size='small'>⋯</IconButton>
        </TableCell>
      </TableRow>
      {isOpen &&
        hasChildren &&
        groups.map((childGroup) => {
          const childIsOpen = expanded.has(childGroup.id);
          return (
            <GroupTable
              key={childGroup.id}
              group={childGroup}
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
