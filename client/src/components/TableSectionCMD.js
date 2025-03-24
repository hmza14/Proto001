import React, { useState, useEffect, useCallback } from 'react';
import { sampleCMDData } from './sampleData';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  TableContainer,
  Paper,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import CustomGridToolbar from './CustomGridToolbarCMD';
import AddCMDDialog from './AddCMDDialog';
import ConfirmDialog from './ConfirmDialog';
import frenchTableLabels from './frenchTableLabels'; 

function TableSectionCMD({ cmdRows, setCmdRows, onAssignCMD, otRows }) {
  const [selectedCMD, setSelectedCMD] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOTId, setSelectedOTId] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [originalRows, setOriginalRows] = useState([]);

  const [isAddCMDDialogOpen, setIsAddCMDDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState(false);


  const fetchCmdRows = useCallback(async () => {
    try {
      console.log("Fetching CMD rows...");
      const response = await axios.get('http://localhost:8800/cmd');
      // Filter out commands that are already assigned to an OT
      const transformedData = response.data.data
        .filter(row => !row.oth_keyu)
        .map(row => ({
          id: row.otl_keyu,
          ...row
        }));
      console.log("Unassigned CMDs:", transformedData);
      setCmdRows(transformedData);
      setOriginalRows(transformedData); 
    } catch (err) {
      console.log('Using sample data instead:', err.message);
      const transformedSampleData = sampleCMDData.map(row => ({
        id: row.otl_keyu,
        ...row
      }));
      setCmdRows(transformedSampleData);
      setOriginalRows(transformedSampleData); 
    }
  }, [setCmdRows]);

  useEffect(() => {
    fetchCmdRows();
  }, [fetchCmdRows]);

  
  const handleAddRow = () => {
    setIsAddCMDDialogOpen(true);
  };

  // Handle successful CMD creation
  const handleCMDCreationSuccess = (newCMDData) => {
    // Refresh the data from the backend instead of just adding to state
    fetchCmdRows();
  };

  // Show confirmation dialog before delete
  const handleDeleteSelectedRows = () => {
    setIsConfirmDeleteOpen(true);
  };
  
  // Handle actual deletion after confirmation
  const handleConfirmDelete = async () => {
    if (selectedRowIds.length === 0) {
      setIsConfirmDeleteOpen(false);
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Send delete request to backend
      await axios.delete('http://localhost:8800/cmd', { 
        data: { ids: selectedRowIds } 
      });
      
      // Refresh data
      await fetchCmdRows();
      
      // Clear selection
      setSelectedRowIds([]);
      setSelectedCMD([]);
      
    } catch (error) {
      console.error('Error archiving CMDs:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la suppression des commandes.';
      
      if (error.response) {
        errorMessage += ` ${error.response.data.message || error.response.statusText}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsConfirmDeleteOpen(false);
      setIsDeleting(false);
    }
  };

  // Add new handler function for filtering
  const handleFilterChange = (value) => {
    setFilterValue(value);
    
    // If value is empty, show all rows
    if (!value.trim()) {
      setCmdRows(originalRows);
      return;
    }

    // Filter rows based on all fields
    const filteredRows = originalRows.filter(row => {
      const searchStr = value.toLowerCase();
      return (
        row.otl_code?.toLowerCase().includes(searchStr) ||
        row.otl_lib?.toLowerCase().includes(searchStr) ||
        String(row.otl_stat)?.toLowerCase().includes(searchStr)
      );
    });

    setCmdRows(filteredRows);
  };

  const handleAssignClick = () => {
    setDialogOpen(true);
  };

  const handleDialogSubmit = async () => {
    try {
      // Call the backend API to assign commands to OT
      await axios.put('http://localhost:8800/assign-cmd-to-ot', {
        otId: selectedOTId,
        cmdIds: selectedCMD
      });
      
      const selectedCmdRows = selectedCMD.map((id) => cmdRows.find((cmd) => cmd.id === id));
      
      // Update UI state - keep this exactly as original
      setCmdRows((prevCmdRows) =>
        prevCmdRows.filter((cmd) => !selectedCMD.includes(cmd.id))
      );
      onAssignCMD(selectedOTId, selectedCmdRows);
      
      // Reset selections
      setDialogOpen(false);
      setSelectedCMD([]);
      setSelectedRowIds([]);
      setSelectedOTId('');
    } catch (error) {
      console.error('Error assigning CMD to OT:', error);
      alert('Une erreur est survenue lors de l\'affectation. Veuillez réessayer.');
    }
  };

  const columns = [
    { field: 'otl_code', headerName: 'Code Tâche', width: 150 },
    { field: 'otl_lib', headerName: 'Libellé Tâche', width: 200 },
    { 
      field: 'otl_stat', 
      headerName: 'Statut', 
      width: 130,
      renderCell: (params) => {
        // Handle both status codes properly
        const statusValue = params.value;
        
        if (statusValue === 'NEW') {
          return (
            <Box
              sx={{
                backgroundColor: '#FFC107', // Yellow for Initial
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              Initial
            </Box>
          );
        } else if (statusValue === '020') {
          return (
            <Box
              sx={{
                backgroundColor: '#4CAF50', // Green for Affecté
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              Affecté
            </Box>
          );
        } else {
          // Fallback for any other status
          return (
            <Box
              sx={{
                backgroundColor: '#FFC107', // Default to yellow
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              Initial
            </Box>
          );
        }
      }
    }
  ];

  return (
    <Box sx={{ padding: 1 }}>
      <Typography variant="h6" component="div" gutterBottom>
        Les arrêts non planifiés:
      </Typography>
      <TableContainer component={Paper}>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={cmdRows}
            columns={columns}
            autoHeight
            checkboxSelection
            slots={{
              toolbar: CustomGridToolbar,
            }}
            slotProps={{
              toolbar: {
                onAddRow: handleAddRow,
                onDeleteSelectedRows: handleDeleteSelectedRows,
                selectedRowIds: selectedRowIds,
                onFilterChange: handleFilterChange,
                onAssignClick: handleAssignClick,
                assignButtonDisabled: selectedCMD.length === 0
              }
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
            onRowSelectionModelChange={(newSelection) => {
              setSelectedCMD(newSelection);
              setSelectedRowIds(newSelection); 
            }}
            localeText={frenchTableLabels}
            getRowHeight={() => 'auto'}
            sx={{
              '& .MuiDataGrid-cell': { py: 1 },
            }}
            loading={isDeleting}
          />
        </Box>
      </TableContainer>

      {/* Assignment Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Affectation à l'ordre de transport</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Select
            value={selectedOTId}
            onChange={(e) => setSelectedOTId(e.target.value)}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>
              Sélectionner un OT
            </MenuItem>
            {otRows.map((ot) => (
              <MenuItem key={ot.oth_keyu} value={ot.oth_keyu}>
                {ot.oth_icod} : {ot.oth_lib}
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
      
      {/* Add CMD Dialog */}
      <AddCMDDialog
        open={isAddCMDDialogOpen}
        onClose={() => setIsAddCMDDialogOpen(false)}
        onSuccess={handleCMDCreationSuccess}
      />
      
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message={
          selectedRowIds.length === 1
            ? "Êtes-vous sûr de vouloir supprimer cette commande ?"
            : `Êtes-vous sûr de vouloir supprimer ces ${selectedRowIds.length} commandes ?`
        }
      />
    </Box>
  );
}

export default TableSectionCMD;