import React from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import rows from '../data/rows';

function TableSection({ section }) {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">{section} Table</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box sx={{ marginTop: 2 }}>
        <Button variant="contained" color="primary" sx={{ marginRight: 1 }}>
          Add Row
        </Button>
        <Button variant="outlined" color="secondary">
          Delete Row
        </Button>
      </Box>
    </Box>
  );
}

export default TableSection;
