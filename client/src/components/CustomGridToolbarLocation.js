import React from 'react';
import {
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { Button, TextField } from '@mui/material';

function CustomGridToolbarLocation({ 
  onAddRow, 
  onDeleteSelectedRows, 
  onEditRow,
  selectedRowIds, 
  onFilterChange 
}) {
  // Check if exactly one row is selected for edit button
  const isEditButtonDisabled = selectedRowIds.length !== 1;

  return (
    <GridToolbarContainer>
      <Button
        variant="contained"
        color="primary"
        onClick={onAddRow}
        style={{ marginRight: '8px' }}
      >
        Ajouter une localisation
      </Button>

      <Button
        variant="contained"
        color="primary"
        onClick={onEditRow}
        disabled={isEditButtonDisabled}
        style={{ marginRight: '8px' }}
      >
        Modifier localisation
      </Button>

      <Button
        variant="contained"
        color="secondary"
        onClick={onDeleteSelectedRows}
        disabled={selectedRowIds.length === 0}
        style={{ marginRight: '8px' }}
      >
        Supprimer
      </Button>

      <TextField
        label="Filtre"
        variant="outlined"
        size="small"
        onChange={(e) => onFilterChange(e.target.value)}
        style={{ marginRight: '8px' }}
      />

      {/* Export Button */}
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export default CustomGridToolbarLocation;