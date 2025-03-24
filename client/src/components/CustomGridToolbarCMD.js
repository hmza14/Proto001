import React from 'react';
import {
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { Button, TextField } from '@mui/material';

function CustomGridToolbarCMD({ 
  onAddRow, 
  onDeleteSelectedRows, 
  selectedRowIds, 
  onFilterChange, 
  onAssignClick, 
  assignButtonDisabled 
}) {
  return (
    <GridToolbarContainer>
      <Button
        variant="contained"
        color="primary"
        onClick={onAddRow}
        style={{ marginRight: '8px' }}
      >
        Ajouter une commande
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
        color="primary"
        onClick={onAssignClick}
        disabled={assignButtonDisabled}
        style={{ marginRight: '8px' }}
      >
        Affecter à l'OT
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

export default CustomGridToolbarCMD;