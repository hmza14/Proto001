import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Select,
  MenuItem,
  TableContainer,
  Paper,
  TablePagination,
  Typography,
} from '@mui/material';
import axios from 'axios';

function TableSectionCMD({ cmdRows, setCmdRows, onAssignCMD, otIds }) {
  const [selectedCMD, setSelectedCMD] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOTId, setSelectedOTId] = useState('');
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page

  useEffect(() => {
    const fetchCmdRows = async () => {
      try {
        const response = await axios.get('http://localhost:8800/cmd');
        setCmdRows(response.data.data); // Assuming response.data contains the array of CMD rows
      } catch (err) {
        console.error('Error fetching CMD data:', err.message);
      }
    };

    fetchCmdRows();
  }, [setCmdRows]);

  const handleSelectCMD = (cmdId, isSelected) => {
    setSelectedCMD((prevSelected) =>
      isSelected ? [...prevSelected, cmdId] : prevSelected.filter((id) => id !== cmdId)
    );
  };

  const handleAssignClick = () => {
    setDialogOpen(true);
  };

  const handleDialogSubmit = () => {
    setCmdRows((prevCmdRows) =>
      prevCmdRows.filter((cmd) => !selectedCMD.includes(cmd.otl_keyu))
    );
    onAssignCMD(selectedOTId, selectedCMD.map((id) => cmdRows.find((cmd) => cmd.otl_keyu === id)));
    setDialogOpen(false);
    setSelectedCMD([]);
    setSelectedOTId('');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ padding: 1 }}>
      <Typography
        sx={{ flex: '1 1 100%' }}
        variant="h6"
        component="div"
        gutterBottom
      >
       Les arrêts non planifiées:
      </Typography>
      <TableContainer component={Paper}>
        <Table  size="small">
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Task Code</TableCell>
              <TableCell>Task Label</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cmdRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={row.otl_keyu} hover >
                <TableCell>
                  <Checkbox
                    checked={selectedCMD.includes(row.otl_keyu)}
                    onChange={(e) => handleSelectCMD(row.otl_keyu, e.target.checked)}
                  />
                </TableCell>
                <TableCell>{row.otl_keyu}</TableCell>
                <TableCell>{row.otl_code}</TableCell>
                <TableCell>{row.otl_lib}</TableCell>
                <TableCell>{row.otl_stat}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={cmdRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
        onClick={handleAssignClick}
        disabled={selectedCMD.length === 0}
      >
        Assign to OT
      </Button>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Affectation</DialogTitle>
        <DialogContent>
          <Select
            value={selectedOTId}
            onChange={(e) => setSelectedOTId(e.target.value)}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select OT
            </MenuItem>
            {otIds.map((id) => (
              <MenuItem key={id} value={id}>
                {id}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDialogSubmit} disabled={!selectedOTId}>
            Affecte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TableSectionCMD;
