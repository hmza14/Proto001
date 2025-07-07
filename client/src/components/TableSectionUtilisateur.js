import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  TableContainer,
  Paper,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import CustomGridToolbarUtilisateur from './CustomGridToolbarUtilisateur';
import AddUtilisateurDialog from './AddUtilisateurDialog';
import EditUtilisateurDialog from './EditUtilisateurDialog';
import ConfirmDialog from './ConfirmDialog';
import frenchTableLabels from './frenchTableLabels'; 
import { buildApiUrl, API_ENDPOINTS } from './apiConfig';

function TableSectionUtilisateur() {
  const [utilisateurRows, setUtilisateurRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [originalRows, setOriginalRows] = useState([]);
  const [isAddUtilisateurDialogOpen, setIsAddUtilisateurDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State for EditUtilisateurDialog
  const [isEditUtilisateurDialogOpen, setIsEditUtilisateurDialogOpen] = useState(false);
  const [selectedUtilisateurForEdit, setSelectedUtilisateurForEdit] = useState(null);

  const fetchUtilisateurRows = useCallback(async () => {
    try {
      console.log("Fetching Utilisateur data");
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.UTILISATEUR));
      //
      
      const transformedData = response.data.data.map(row => ({
        id: Number(row.usr_keyu),
        usr_keyu: Number(row.usr_keyu),
        usr_actf: row.usr_actf,  // Add this line
        usr_name: row.usr_name || '',
        usr_mtrc: row.usr_mtrc || '',
        usr_type: row.usr_type || '',
        usr_lang: row.usr_lang || '',
        usr_limi: row.usr_limi || '',
        usr_mail: row.usr_mail || '',
        usr_logn: row.usr_logn || ''
      }));
      
      console.log("Transformed Utilisateur data:", transformedData);
      setUtilisateurRows(transformedData);
      setOriginalRows(transformedData);
    } catch (err) {
      console.error('Error fetching Utilisateur data:', err);
      // Fallback to empty array
      setUtilisateurRows([]);
      setOriginalRows([]);
    }
  }, []);

  useEffect(() => {
    fetchUtilisateurRows();
  }, [fetchUtilisateurRows]);

  // Handle add button click
  const handleAddRow = () => {
    setIsAddUtilisateurDialogOpen(true);
  };

  // Handle edit button click
  const handleEditRow = () => {
    if (selectedRowIds.length === 1) {
      const selectedUtilisateur = utilisateurRows.find(row => row.id === selectedRowIds[0]);
      if (selectedUtilisateur) {
        setSelectedUtilisateurForEdit(selectedUtilisateur);
        setIsEditUtilisateurDialogOpen(true);
      }
    }
  };

  // Handle successful Utilisateur creation
  const handleUtilisateurCreationSuccess = () => {
    fetchUtilisateurRows();
  };
  
  // Handle successful Utilisateur edit
  const handleUtilisateurEditSuccess = () => {
    fetchUtilisateurRows();
    setSelectedUtilisateurForEdit(null);
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
      await axios.delete(buildApiUrl(API_ENDPOINTS.UTILISATEUR), { 
        data: { ids: selectedRowIds } 
      });
      
      // Refresh data
      await fetchUtilisateurRows();
      
      // Clear selection
      setSelectedRowIds([]);
      
    } catch (error) {
      console.error('Error deleting Utilisateurs:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la suppression des utilisateurs.';
      
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
      setUtilisateurRows(originalRows);
      return;
    }

    // Filter rows based on all fields
    const filteredRows = originalRows.filter(row => {
      const searchStr = value.toLowerCase();
      return (
        row.usr_name?.toLowerCase().includes(searchStr) ||
        row.usr_mtrc?.toLowerCase().includes(searchStr) ||
        row.usr_type?.toLowerCase().includes(searchStr) ||
        row.usr_lang?.toLowerCase().includes(searchStr) ||
        row.usr_mail?.toLowerCase().includes(searchStr) ||
        row.usr_logn?.toLowerCase().includes(searchStr)
      );
    });

    setUtilisateurRows(filteredRows);
  };

const columns = [
  { 
    field: 'usr_actf', 
    headerName: 'Actif', 
    width: 80,
    renderCell: (params) => (
      <span style={{ 
        color: params.value ? '#4CAF50' : '#f44336',
        fontWeight: 'bold'
      }}>
        {params.value ? '✓' : '✗'}
      </span>
    )
  },
  { field: 'usr_name', headerName: 'Nom complet', width: 200 },
  { field: 'usr_mtrc', headerName: 'Matricule', width: 150 },
  { field: 'usr_type', headerName: 'Type d\'utilisateur', width: 180 },
  { field: 'usr_lang', headerName: 'Langue', width: 120 },
  { field: 'usr_mail', headerName: 'Email', width: 200 },
  { field: 'usr_logn', headerName: 'Identifiant', width: 150 }
];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestion des utilisateurs
      </Typography>
      <TableContainer component={Paper}>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={utilisateurRows}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick={false} 
            checkboxSelection 
            slots={{
              toolbar: CustomGridToolbarUtilisateur,
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
      
      {/* Add Utilisateur Dialog */}
      <AddUtilisateurDialog
        open={isAddUtilisateurDialogOpen}
        onClose={() => setIsAddUtilisateurDialogOpen(false)}
        onSuccess={handleUtilisateurCreationSuccess}
      />
      
      {/* Edit Utilisateur Dialog */}
      <EditUtilisateurDialog
        open={isEditUtilisateurDialogOpen}
        onClose={() => {
          setIsEditUtilisateurDialogOpen(false);
          setSelectedUtilisateurForEdit(null);
        }}
        onSuccess={handleUtilisateurEditSuccess}
        utilisateurData={selectedUtilisateurForEdit}
      />
      
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message={
          selectedRowIds.length === 1
            ? "Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
            : `Êtes-vous sûr de vouloir supprimer ces ${selectedRowIds.length} utilisateurs ?`
        }
      />
    </Box>
  );
}

export default TableSectionUtilisateur;