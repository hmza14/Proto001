import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const expediteurMapping = {
  'Carrefour Lyon': 'EXP001',
  'Auchan Paris': 'EXP002',
  'Leclerc Marseille': 'EXP003'
};

function AddOTDialog({ open, onClose, onSuccess }) {
  const [expediteur, setExpediteur] = useState('');
  const [libelleChargement, setLibelleChargement] = useState('');
  const [typeChargement, setTypeChargement] = useState('');
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form on close
  const handleClose = () => {
    setExpediteur('');
    setLibelleChargement('');
    setTypeChargement('');
    setErrors({});
    setIsSuccess(false);
    onClose();
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!expediteur || expediteur === 'sélectionner') {
      newErrors.expediteur = 'Veuillez sélectionner un expéditeur';
    }
    
    if (!libelleChargement) {
      newErrors.libelleChargement = 'Veuillez saisir un libellé de chargement';
    }
    
    if (!typeChargement || typeChargement === 'sélectionner') {
      newErrors.typeChargement = 'Veuillez sélectionner un type de chargement';
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
      // Get the expediteur code from mapping
      const expCode = expediteurMapping[expediteur];
      
      // Create OT data object to send to backend
      const otData = {
        exp_lib: expediteur,
        exp_code: expCode,
        oth_lib: libelleChargement,
        oth_typc: typeChargement,
        act_code: 'ACT001',
        oth_stat: '010'
      };
      
      console.log("Sending OT data:", otData);
      
      // Send data to backend
      const response = await axios.post('http://localhost:8800/ot', otData);
      
      if (response.data.status === 'success') {
        setIsSuccess(true);
        
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(response.data.data);
        }
      } else {
        alert('Une erreur est survenue lors de la création de l\'OT. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error creating OT:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la création de l\'OT.';
      
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
            Ajouter un nouvel ordre de transport
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
              {/* Expéditeur dropdown */}
              <FormControl fullWidth error={!!errors.expediteur}>
                <InputLabel id="expediteur-label">Expéditeur</InputLabel>
                <Select
                  labelId="expediteur-label"
                  value={expediteur}
                  label="Expéditeur"
                  onChange={(e) => setExpediteur(e.target.value)}
                >
                  <MenuItem value="sélectionner" disabled>Sélectionner un expéditeur</MenuItem>
                  <MenuItem value="Carrefour Lyon">Carrefour Lyon</MenuItem>
                  <MenuItem value="Leclerc Marseille">Leclerc Marseille</MenuItem>
                  <MenuItem value="Auchan Paris">Auchan Paris</MenuItem>
                </Select>
                {errors.expediteur && (
                  <Typography variant="caption" color="error">
                    {errors.expediteur}
                  </Typography>
                )}
              </FormControl>
              
              {/* Libellé chargement textbox */}
              <TextField
                label="Libellé chargement"
                fullWidth
                value={libelleChargement}
                onChange={(e) => setLibelleChargement(e.target.value)}
                error={!!errors.libelleChargement}
                helperText={errors.libelleChargement}
              />
              
              {/* Type chargement dropdown */}
              <FormControl fullWidth error={!!errors.typeChargement}>
                <InputLabel id="type-chargement-label">Type chargement</InputLabel>
                <Select
                  labelId="type-chargement-label"
                  value={typeChargement}
                  label="Type chargement"
                  onChange={(e) => setTypeChargement(e.target.value)}
                >
                  <MenuItem value="sélectionner" disabled>Sélectionner un type</MenuItem>
                  <MenuItem value="EXPRESS">EXPRESS</MenuItem>
                  <MenuItem value="FRIGO">FRIGO</MenuItem>
                  <MenuItem value="STANDARD">STANDARD</MenuItem>
                </Select>
                {errors.typeChargement && (
                  <Typography variant="caption" color="error">
                    {errors.typeChargement}
                  </Typography>
                )}
              </FormControl>
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
                OT créé avec succès
              </Typography>
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

export default AddOTDialog;