import React from 'react';
import {
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { Button, TextField } from '@mui/material';

function CustomGridToolbarOT({ 
  onAddRow, 
  onDeleteSelectedRows, 
  onValidateSelectedRows,
  onEditRow,           // Added new prop for edit action
  selectedRowIds, 
  validateButtonDisabled, 
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
        Ajouter un OT
      </Button>

      {/* New Edit Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={onEditRow}
        disabled={isEditButtonDisabled}
        style={{ marginRight: '8px' }}
      >
        Modifier OT
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

      <Button
        variant="contained"
        color="success"
        onClick={onValidateSelectedRows}
        disabled={selectedRowIds.length === 0 || validateButtonDisabled}
        style={{ marginRight: '8px' }}
      >
        Valider OT
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

export default CustomGridToolbarOT;