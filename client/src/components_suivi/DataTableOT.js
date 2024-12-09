import React, { useEffect, useState } from 'react';

import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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

function DataTableOT({  setOtIds }) {
  const [otRows, setOTRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchOTRows = async () => {
      try {
        const response = await axios.get('http://localhost:8800/ot');
        setOTRows(response.data.data);
        setOtIds(response.data.data.map((row) => row.oth_keyu));
      } catch (err) {
        console.log('ERR:', err.message);

      }
    };

    fetchOTRows();
  }, [setOtIds]);



  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Custom empty state message component
  const EmptyRowsMessage = () => (
    <TableRow>
      <TableCell colSpan={6} align="center">
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
        Suivi des OTs:
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Code Chargement</TableCell>
              <TableCell>Libelle Chargement</TableCell>
              <TableCell>Expediteur</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {otRows.length === 0 ? (
              <EmptyRowsMessage />
            ) : (
              otRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <React.Fragment key={row.oth_keyu}>
                    {/* Main OT Row */}
                    <TableRow hover>
                      
                      <TableCell>{row.oth_keyu}</TableCell>
                      <TableCell>{row.oth_icod}</TableCell>
                      <TableCell>{row.oth_lib}</TableCell>
                      <TableCell>{row.exp_lib}</TableCell>
                    </TableRow>


                  </React.Fragment>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={otRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={frenchTableLabels.labelRowsPerPage}
          labelDisplayedRows={frenchTableLabels.labelDisplayedRows}
          getItemAriaLabel={frenchTableLabels.getItemAriaLabel}
        />
      </TableContainer>
    </Box>
  );
}

export default DataTableOT;