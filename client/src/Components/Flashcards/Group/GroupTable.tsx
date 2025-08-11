import React, { useState } from 'react';
import type { Group } from '../Flashcards';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
type Props = { group: Group };

const GroupTable: React.FC<Props> = ({ group }) => {
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen((prev) => !prev);
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size='small' aria-label='a dense table'>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align='right'>Total Cards</TableCell>
            <TableCell align='right'>Updated At</TableCell>
            <TableCell>
              {group.groups && group.groups.length > 0 && (
                <IconButton size='small' onClick={handleOpen}>
                  {open ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
                </IconButton>
              )}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {open &&
            group.groups?.map((row) => (
              <TableRow key={row.name}>
                <TableCell component='th' scope='row'>
                  {row.name}
                </TableCell>
                <TableCell align='right'>{row.name}</TableCell>
                <TableCell align='right'>{row.cards?.length}</TableCell>
                <TableCell align='right'>{row.updatedAt}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GroupTable;
