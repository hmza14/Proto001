import React, { useEffect, useState, useCallback } from 'react';
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
  Typography,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import CustomGridToolbar from './CustomGridToolbarOT';
import AddOTDialog from './AddOTDialog';
import ConfirmDialog from './ConfirmDialog';
import ValidateOTDialog from './ValidateOTDialog';
import frenchTableLabels from './frenchTableLabels'; 

function TableSectionOT({ otAssignments, onUnassignCMD, setOtIds, setOtRows }) {
  const [otRows, setOTRows] = useState([]);
  const [openRows, setOpenRows] = useState({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [originalRows, setOriginalRows] = useState([]);
  const [isAddOTDialogOpen, setIsAddOTDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isValidateOTDialogOpen, setIsValidateOTDialogOpen] = useState(false);

  useEffect(() => {
    console.log("TableSectionOT - otAssignments updated:", otAssignments);
  }, [otAssignments]);

  const fetchOTRows = useCallback(async () => {
    try {
      console.log("Fetching OT data with assignments:", Object.keys(otAssignments));
      const response = await axios.get('http://localhost:8800/ot');
      
      // The backend will now exclude OTs with status '030'
      const transformedData = response.data.data.map(row => {
        const otId = Number(row.oth_keyu);
        
        // Check if this OT has assignments - make sure we check using numbers
        const hasAssignments = otAssignments[otId] && otAssignments[otId].length > 0;
        const assignmentCount = hasAssignments ? otAssignments[otId].length : 0;
        
        console.log(`OT ${otId} has assignments: ${hasAssignments} (count: ${assignmentCount})`);
        
        return {
          id: otId,
          oth_keyu: otId,
          oth_icod: row.oth_icod,
          oth_lib: row.oth_lib,
          exp_lib: row.exp_lib,
          assignmentCount: assignmentCount > 0 ? assignmentCount : 'Aucune',
          OTH_STAT: row.oth_stat 
        };
      });
      
      console.log("Transformed OT data:", transformedData);
      setOTRows(transformedData);
      setOriginalRows(transformedData);
      
      if (typeof setOtIds === 'function') {
        setOtIds(response.data.data.map(row => Number(row.oth_keyu)));
      }
      
      if (typeof setOtRows === 'function') {
        setOtRows(transformedData);
      }
    } catch (err) {
      console.error('Error fetching OT data:', err);
      // Fallback to sample data
      const transformedSampleData = sampleOTData
        .filter(row => row.oth_stat !== '030') 
        .map(row => {
          const otId = Number(row.oth_keyu);
          const hasAssignments = otAssignments[otId] && otAssignments[otId].length > 0;
          const assignmentCount = hasAssignments ? otAssignments[otId].length : 0;
          
          return {
            id: otId,
            oth_keyu: otId,
            oth_icod: row.oth_icod,
            oth_lib: row.oth_lib,
            exp_lib: row.exp_lib,
            assignmentCount: assignmentCount > 0 ? assignmentCount : 'Aucune',
            OTH_STAT: row.oth_stat
          };
        });
      
      setOTRows(transformedSampleData);
      setOriginalRows(transformedSampleData);
      
      if (typeof setOtIds === 'function') {
        setOtIds(transformedSampleData.map(row => Number(row.oth_keyu)));
      }
      
      if (typeof setOtRows === 'function') {
        setOtRows(transformedSampleData);
      }
    }
  }, [otAssignments, setOtIds, setOtRows]);

  useEffect(() => {
    fetchOTRows();
  }, [fetchOTRows]);

  // Update the handleAddRow function to open the dialog
  const handleAddRow = () => {
    setIsAddOTDialogOpen(true);
  };

  // Handle successful OT creation
  const handleOTCreationSuccess = () => {
    // Refresh OT data from backend
    fetchOTRows();
  };

  // Show confirmation dialog before delete
  const handleDeleteSelectedRows = () => {
    setIsConfirmDeleteOpen(true);
  };
  
  // Handler for validate button
  const handleValidateSelectedRows = () => {
    setIsValidateOTDialogOpen(true);
  };
  
  // Check if selected OTs have assignments
  const isValidateButtonDisabled = () => {
    // If no rows are selected, disable the button
    if (selectedRowIds.length === 0) return true;
    
    // Check each selected OT to see if it has assignments
    return selectedRowIds.some(id => {
      const row = otRows.find(row => row.id === id);
      return !row || row.assignmentCount === 'Aucune';
    });
  };
  
  // Handle successful OT validation
  const handleOTValidationSuccess = () => {
    // Refresh OT data from backend
    fetchOTRows();
    // Clear selection
    setSelectedRowIds([]);
  };
  
  // Handle actual deletion after confirmation
  const handleConfirmDelete = async () => {
    if (selectedRowIds.length === 0) {
      setIsConfirmDeleteOpen(false);
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Check if any selected OT has assignments
      const hasAssignments = selectedRowIds.some(id => {
        const otId = Number(id);
        return otAssignments[otId] && otAssignments[otId].length > 0;
      });
      
      if (hasAssignments) {
        alert('Impossible de supprimer un OT avec des commandes affectées. Veuillez d\'abord désaffecter toutes les commandes.');
        setIsConfirmDeleteOpen(false);
        setIsDeleting(false);
        return;
      }
      
      // Send delete request to backend
      await axios.delete('http://localhost:8800/ot', { 
        data: { ids: selectedRowIds } 
      });
      
      // Refresh data
      await fetchOTRows();
      
      // Clear selection
      setSelectedRowIds([]);
      
    } catch (error) {
      console.error('Error archiving OTs:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la suppression des OTs.';
      
      if (error.response) {
        errorMessage += ` ${error.response.data.message || error.response.statusText}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsConfirmDeleteOpen(false);
      setIsDeleting(false);
    }
  };

  const handleFilterChange = (value) => {
    setFilterValue(value);
    
    // If value is empty, show all rows
    if (!value.trim()) {
      setOTRows(originalRows);
      return;
    }

    // Filter rows based on all fields
    const filteredRows = originalRows.filter(row => {
      const searchStr = value.toLowerCase();
      return (
        row.oth_icod?.toLowerCase().includes(searchStr) ||
        row.oth_lib?.toLowerCase().includes(searchStr) ||
        row.exp_lib?.toLowerCase().includes(searchStr) ||
        String(row.assignmentCount)?.toLowerCase().includes(searchStr)
      );
    });

    setOTRows(filteredRows);
  };

  const toggleRow = (otId) => {
    setOpenRows((prevOpenRows) => {
      if (prevOpenRows[otId]) {
        return {};
      }
      
      return { [otId]: true };
    });
  };

  const handleUnassignCMD = async (otId, cmdRow) => {
    try {
      // Call the backend API to unassign the command
      await axios.put('http://localhost:8800/unassign-cmd-from-ot', {
        otId: otId,
        cmdId: cmdRow.otl_keyu
      });
      
      // Create an updated command row with status set to NEW
      const updatedCmdRow = {
        ...cmdRow,
        otl_stat: 'NEW' // Ensure the status is reset to NEW
      };
      
      // Call the parent component's handler with the updated command row
      onUnassignCMD(otId, updatedCmdRow);
    } catch (error) {
      console.error('Error unassigning CMD from OT:', error);
      alert('Une erreur est survenue lors de la désaffectation. Veuillez réessayer.');
    }
  };

  const columns = [
    {
      field: 'actions',
      headerName: '',
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            toggleRow(params.row.oth_keyu);
          }}
        >
          {openRows[params.row.oth_keyu] ? (
            <KeyboardArrowUp />
          ) : (
            <KeyboardArrowDown />
          )}
        </IconButton>
      ),
    },
    { field: 'oth_icod', headerName: 'Code Chargement', width: 150 },
    { field: 'oth_lib', headerName: 'Libelle Chargement', width: 200 },
    { field: 'exp_lib', headerName: 'Expediteur', width: 150 },
    { 
      field: 'assignmentCount', 
      headerName: '# Affectation', 
      width: 120,
    }
  ];

  const DetailPanel = ({ row }) => {
    const otId = Number(row.oth_keyu);
    const assignments = otAssignments[otId] || [];
    
    console.log(`Rendering detail panel for OT ${otId} with ${assignments.length} assignments:`, assignments);
    
    return (
      <Box margin={1}>
        <Typography variant="subtitle2" component="div" gutterBottom>
          Commandes affectés: {assignments.length > 0 ? assignments.length : 'Aucune'}
        </Typography>
        {assignments.length > 0 ? (
          <Table size="small" aria-label="assigned-cmd">
            <TableHead>
              <TableRow>
                <TableCell>Code Tâche</TableCell>
                <TableCell>Libellé Tâche</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((cmdRow) => (
                <TableRow key={cmdRow.otl_keyu}>
                  <TableCell>{cmdRow.otl_code}</TableCell>
                  <TableCell>{cmdRow.otl_lib}</TableCell>
                  <TableCell>
                    {cmdRow.otl_stat === '020' ? (
                      <Box
                        sx={{
                          backgroundColor: '#4CAF50',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          display: 'inline-block'
                        }}
                      >
                        Affecté
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          backgroundColor: '#FFC107',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          display: 'inline-block'
                        }}
                      >
                        Initial
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleUnassignCMD(otId, cmdRow)}
                    >
                      Désaffecter
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2">Aucune commande affectée</Typography>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ padding: 1 }}>
      <Typography variant="h6" component="div" gutterBottom>
        Planification des ordres de transport:
      </Typography>
      <TableContainer component={Paper}>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={otRows}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick={false} 
            checkboxSelection 
            slots={{
              toolbar: CustomGridToolbar,
            }}
            slotProps={{
              toolbar: {
                onAddRow: handleAddRow,
                onDeleteSelectedRows: handleDeleteSelectedRows,
                onValidateSelectedRows: handleValidateSelectedRows, 
                selectedRowIds: selectedRowIds,
                validateButtonDisabled: isValidateButtonDisabled(), 
                onFilterChange: handleFilterChange
              }
            }}
            onRowSelectionModelChange={(newSelection) => {
              setSelectedRowIds(newSelection);
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize, page }
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            localeText={frenchTableLabels}
            getRowHeight={() => 'auto'}
            sx={{
              '& .MuiDataGrid-cell': { py: 1 },
            }}
            loading={isDeleting}
          />
        </Box>
        {otRows.map((row) => (
          openRows[row.oth_keyu] && (
            <Collapse key={row.oth_keyu} in={true}>
              <DetailPanel row={row} />
            </Collapse>
          )
        ))}
      </TableContainer>
      
      {/* Add OT Dialog */}
      <AddOTDialog
        open={isAddOTDialogOpen}
        onClose={() => setIsAddOTDialogOpen(false)}
        onSuccess={handleOTCreationSuccess}
      />
      
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message={
          selectedRowIds.length === 1
            ? "Êtes-vous sûr de vouloir supprimer cet ordre de transport ?"
            : `Êtes-vous sûr de vouloir supprimer ces ${selectedRowIds.length} ordres de transport ?`
        }
      />
      
      {/* Validate OT Dialog - NEW */}
      <ValidateOTDialog
        open={isValidateOTDialogOpen}
        onClose={() => setIsValidateOTDialogOpen(false)}
        onSuccess={handleOTValidationSuccess}
        selectedOTIds={selectedRowIds}
      />
    </Box>
  );
}

export default TableSectionOT;