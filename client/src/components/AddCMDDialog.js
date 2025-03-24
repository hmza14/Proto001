import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

function AddCMDDialog({ open, onClose, onSuccess }) {
  const [libelleTache, setLibelleTache] = useState('');
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form on close
  const handleClose = () => {
    setLibelleTache('');
    setErrors({});
    setIsSuccess(false);
    onClose();
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!libelleTache) {
      newErrors.libelleTache = 'Veuillez saisir un libellé de tâche';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form data
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      console.log("Sending CMD data with libellé:", libelleTache);
      
      // Create CMD data object to send to backend
      const cmdData = {
        otl_lib: libelleTache
      };
      
      // Send data to backend
      const response = await axios.post('http://localhost:8800/cmd', cmdData);
      
      if (response.data.status === 'success') {
        setIsSuccess(true);
        
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(response.data.data);
        }
      } else {
        alert('Une erreur est survenue lors de la création de la commande. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error creating CMD:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la création de la commande.';
      
      if (error.response) {
        errorMessage += ` Erreur ${error.response.status}: ${error.response.data.message || error.response.statusText}`;
        console.error('Error response:', error.response);
      } else if (error.request) {
        errorMessage += ' Aucune réponse du serveur. Vérifiez que le serveur est en cours d\'exécution.';
        console.error('Error request:', error.request);
      }
      
      alert(errorMessage + ' Veuillez réessayer.');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      {!isSuccess ? (
        <>
          <DialogTitle>
            Ajouter une nouvelle commande
            <IconButton
              aria-label="close"
              onClick={handleClose}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {/* Libellé tâche textbox */}
              <TextField
                label="Libellé tâche"
                fullWidth
                value={libelleTache}
                onChange={(e) => setLibelleTache(e.target.value)}
                error={!!errors.libelleTache}
                helperText={errors.libelleTache}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Fermer</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Soumettre
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                left: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '200px',
                gap: 2
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main' }} />
              <Typography variant="h6" align="center">
                Commande créée avec succès
              </Typography>
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

export default AddCMDDialog;