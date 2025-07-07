import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  TableContainer,
  Paper,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import CustomGridToolbarLocation from './CustomGridToolbarLocation';
import AddLocationDialog from './AddLocationDialog';
import EditLocationDialog from './EditLocationDialog';
import ConfirmDialog from './ConfirmDialog';
import frenchTableLabels from './frenchTableLabels'; 
import { buildApiUrl, API_ENDPOINTS } from './apiConfig';

function TableSectionLocation() {
  const [locationRows, setLocationRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [originalRows, setOriginalRows] = useState([]);
  const [isAddLocationDialogOpen, setIsAddLocationDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State for EditLocationDialog
  const [isEditLocationDialogOpen, setIsEditLocationDialogOpen] = useState(false);
  const [selectedLocationForEdit, setSelectedLocationForEdit] = useState(null);

  const fetchLocationRows = useCallback(async () => {
    try {
      console.log("Fetching Location data");
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.LOCATION));
      //
      
      const transformedData = response.data.data.map(row => ({
        id: Number(row.loc_keyu),
        loc_keyu: Number(row.loc_keyu),
        loc_pdcd: row.loc_pdcd || '',
        loc_pdnm: row.loc_pdnm || '',
        loc_adr1: row.loc_adr1 || '',
        loc_adr2: row.loc_adr2 || '',
        loc_advl: row.loc_advl || '',
        loc_adcp: row.loc_adcp || '',
        loc_ntel: row.loc_ntel || '',
        loc_imel: row.loc_imel || ''
      }));
      
      console.log("Transformed Location data:", transformedData);
      setLocationRows(transformedData);
      setOriginalRows(transformedData);
    } catch (err) {
      console.error('Error fetching Location data:', err);
      // Fallback to empty array
      setLocationRows([]);
      setOriginalRows([]);
    }
  }, []);

  useEffect(() => {
    fetchLocationRows();
  }, [fetchLocationRows]);

  // Handle add button click
  const handleAddRow = () => {
    setIsAddLocationDialogOpen(true);
  };

  // Handle edit button click
  const handleEditRow = () => {
    if (selectedRowIds.length === 1) {
      const selectedLocation = locationRows.find(row => row.id === selectedRowIds[0]);
      if (selectedLocation) {
        setSelectedLocationForEdit(selectedLocation);
        setIsEditLocationDialogOpen(true);
      }
    }
  };

  // Handle successful Location creation
  const handleLocationCreationSuccess = () => {
    fetchLocationRows();
  };
  
  // Handle successful Location edit
  const handleLocationEditSuccess = () => {
    fetchLocationRows();
    setSelectedLocationForEdit(null);
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
      await axios.delete(buildApiUrl(API_ENDPOINTS.LOCATION), {  
        data: { ids: selectedRowIds } 
      });
      
      // Refresh data
      await fetchLocationRows();
      
      // Clear selection
      setSelectedRowIds([]);
      
    } catch (error) {
      console.error('Error deleting Locations:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la suppression des localisations.';
      
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
      setLocationRows(originalRows);
      return;
    }

    // Filter rows based on all fields
    const filteredRows = originalRows.filter(row => {
      const searchStr = value.toLowerCase();
      return (
        row.loc_pdcd?.toLowerCase().includes(searchStr) ||
        row.loc_pdnm?.toLowerCase().includes(searchStr) ||
        row.loc_adr1?.toLowerCase().includes(searchStr) ||
        row.loc_adr2?.toLowerCase().includes(searchStr) ||
        row.loc_advl?.toLowerCase().includes(searchStr) ||
        row.loc_adcp?.toLowerCase().includes(searchStr) ||
        row.loc_ntel?.toLowerCase().includes(searchStr) ||
        row.loc_imel?.toLowerCase().includes(searchStr)
      );
    });

    setLocationRows(filteredRows);
  };

  const columns = [
    { field: 'loc_pdcd', headerName: 'Code point livraison', width: 150 },
    { field: 'loc_pdnm', headerName: 'Nom point livraison', width: 200 },
    { field: 'loc_adr1', headerName: 'Adresse 1', width: 200 },
    { field: 'loc_advl', headerName: 'Ville', width: 150 },
    { field: 'loc_adcp', headerName: 'Code postal', width: 120 },
    { field: 'loc_ntel', headerName: 'Téléphone', width: 150 },
    { field: 'loc_imel', headerName: 'Email', width: 200 }
  ];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestion des localisations
      </Typography>
      <TableContainer component={Paper}>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={locationRows}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick={false} 
            checkboxSelection 
            slots={{
              toolbar: CustomGridToolbarLocation,
            }}
            slotProps={{
              toolbar: {
                onAddRow: handleAddRow,
                onEditRow: handleEditRow,
                onDeleteSelectedRows: handleDeleteSelectedRows,
                selectedRowIds: selectedRowIds,
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
            loading={isDeleting}
          />
        </Box>
      </TableContainer>
      
      {/* Add Location Dialog */}
      <AddLocationDialog
        open={isAddLocationDialogOpen}
        onClose={() => setIsAddLocationDialogOpen(false)}
        onSuccess={handleLocationCreationSuccess}
      />
      
      {/* Edit Location Dialog */}
      <EditLocationDialog
        open={isEditLocationDialogOpen}
        onClose={() => {
          setIsEditLocationDialogOpen(false);
          setSelectedLocationForEdit(null);
        }}
        onSuccess={handleLocationEditSuccess}
        locationData={selectedLocationForEdit}
      />
      
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message={
          selectedRowIds.length === 1
            ? "Êtes-vous sûr de vouloir supprimer cette localisation ?"
            : `Êtes-vous sûr de vouloir supprimer ces ${selectedRowIds.length} localisations ?`
        }
      />
    </Box>
  );
}

export default TableSectionLocation;