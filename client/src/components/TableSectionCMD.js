import React, { useState, useEffect } from 'react';
import { sampleCMDData } from './sampleData';
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

// Custom labels for the table pagination
const frenchTableLabels = {
  labelRowsPerPage: "Afficher par page:",
  labelDisplayedRows: ({ from, to, count }) =>
    `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`} entrées`,
  getItemAriaLabel: (type) => {
    if (type === 'first') return 'Première page';
    if (type === 'last') return 'Dernière page';
    if (type === 'next') return 'Page suivante';
    return 'Page précédente';
  }
};

function TableSectionCMD({ cmdRows, setCmdRows, onAssignCMD, otIds }) {
  const [selectedCMD, setSelectedCMD] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOTId, setSelectedOTId] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchCmdRows = async () => {
      try {
        const response = await axios.get('http://localhost:8800/cmd');
        setCmdRows(response.data.data);
      } catch (err) {
        console.log('Using sample data instead:', err.message);
        setCmdRows(sampleCMDData);
      }
    };

    fetchCmdRows();
  }, [setCmdRows]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const currentPageRows = cmdRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
      const newSelectedIds = currentPageRows.map(row => row.otl_keyu);
      setSelectedCMD(newSelectedIds);
      return;
    }
    setSelectedCMD([]);
  };

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

  // Get current page rows
  const currentPageRows = cmdRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  // Check if all rows on current page are selected
  const isAllCurrentPageSelected = currentPageRows.length > 0 && 
    currentPageRows.every(row => selectedCMD.includes(row.otl_keyu));
  // Check if some but not all rows are selected
  const isSomeSelected = selectedCMD.length > 0 && !isAllCurrentPageSelected;

  // Custom empty state message component
  const EmptyRowsMessage = () => (
    <TableRow>
      <TableCell colSpan={5} align="center">
        <Typography variant="body2" color="textSecondary">
          Aucune donnée disponible
        </Typography>
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={{ padding: 1 }}>
      <Typography
        sx={{ flex: '1 1 100%' }}
        variant="h6"
        component="div"
        gutterBottom
      >
        Les arrêts non planifiés:
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  indeterminate={isSomeSelected}
                  checked={isAllCurrentPageSelected}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Code Tâche</TableCell>
              <TableCell>Libellé Tâche</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cmdRows.length === 0 ? (
              <EmptyRowsMessage />
            ) : (
              currentPageRows.map((row) => (
                <TableRow key={row.otl_keyu} hover>
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
              ))
            )}
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
          labelRowsPerPage={frenchTableLabels.labelRowsPerPage}
          labelDisplayedRows={frenchTableLabels.labelDisplayedRows}
          getItemAriaLabel={frenchTableLabels.getItemAriaLabel}
        />
      </TableContainer>
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
        onClick={handleAssignClick}
        disabled={selectedCMD.length === 0}
      >
        Affecter à l'OT
      </Button>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Affectation à l'ordre de transport</DialogTitle>
        <DialogContent>
          <Select
            value={selectedOTId}
            onChange={(e) => setSelectedOTId(e.target.value)}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>
              Sélectionner un OT
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
            Affecter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TableSectionCMD;