import React, { useEffect, useState } from 'react';
import { sampleOTData } from './sampleData';
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Collapse,
  IconButton,
  Button,
  TableContainer,
  Paper,
  TablePagination,
  Typography,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import axios from 'axios';

function TableSectionOT({ otAssignments, onUnassignCMD, setOtIds }) {
  const [otRows, setOTRows] = useState([]);
  const [openRows, setOpenRows] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchOTRows = async () => {
      try {
        const response = await axios.get('http://localhost:8800/ot');
        setOTRows(response.data.data); // Set the OT rows
        setOtIds(response.data.data.map((row) => row.oth_keyu)); // Extract and set OT IDs
      } catch (err) {
        //console.error('Error fetching OT data:', err.message);
        console.log('Using sample data instead:', err.message);
        // Fallback to sample data if API fails
        setOTRows(sampleOTData);
        setOtIds(sampleOTData.map((row) => row.oth_keyu));
      }
    };

    fetchOTRows();
  }, [setOtIds]);

  const toggleRow = (otId) => {
    setOpenRows((prevOpenRows) => ({
      ...prevOpenRows,
      [otId]: !prevOpenRows[otId],
    }));
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
        Planification des ordres de transport:
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>ID</TableCell>
              <TableCell>Code Chargement</TableCell>
              <TableCell>Libelle Chargement</TableCell>
              <TableCell>Expediteur</TableCell>
              <TableCell># Affectation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {otRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <React.Fragment key={row.oth_keyu}>
                {/* Main OT Row */}
                <TableRow hover>
                  <TableCell>
                    <IconButton size="small" onClick={() => toggleRow(row.oth_keyu)}>
                      {openRows[row.oth_keyu] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{row.oth_keyu}</TableCell>
                  <TableCell>{row.oth_icod}</TableCell>
                  <TableCell>{row.oth_lib}</TableCell>
                  <TableCell>{row.exp_lib}</TableCell>
                  <TableCell>
                    {(otAssignments[row.oth_keyu]?.length || 0) > 0
                      ? `${otAssignments[row.oth_keyu].length}`
                      : 'Aucune'}
                  </TableCell>
                </TableRow>

                {/* Collapsible CMD Row Details */}
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={openRows[row.oth_keyu]} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                      <Typography
                        sx={{ flex: '1 1 100%' }}
                        variant="subtitle2"
                        component="div"
                        gutterBottom
                      >
                        Commandes affectés:
                      </Typography>
                        <Table size="small" aria-label="assigned-cmd">
                          <TableHead>
                            <TableRow>
                              <TableCell>ID</TableCell>
                              <TableCell>Task Code</TableCell>
                              <TableCell>Task Label</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(otAssignments[row.oth_keyu] || []).map((cmdRow) => (
                              <TableRow key={cmdRow.otl_keyu}>
                                <TableCell>{cmdRow.otl_keyu}</TableCell>
                                <TableCell>{cmdRow.otl_code}</TableCell>
                                <TableCell>{cmdRow.otl_lib}</TableCell>
                                <TableCell>{cmdRow.otl_stat}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => onUnassignCMD(row.oth_keyu, cmdRow)}
                                  >
                                    Unassign
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
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
        />
      </TableContainer>
    </Box>
  );
}

export default TableSectionOT;
