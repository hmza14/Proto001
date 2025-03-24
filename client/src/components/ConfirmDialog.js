import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {title || "Confirmation"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {message || "Êtes-vous sûr de vouloir supprimer cet enregistrement ?"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Non
        </Button>
        <Button onClick={onConfirm} color="secondary" variant="contained">
          Oui
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;