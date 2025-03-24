import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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

function ValidateOTDialog({ open, onClose, onSuccess, selectedOTIds }) {
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [equipmentList, setEquipmentList] = useState([]);
  
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchEquipment();
    }
  }, [open]);

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8800/equipment');
      if (response.data.status === 'success') {
        setEquipmentList(response.data.data);
      } else {
        setError('Erreur lors du chargement des équipements');
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Erreur lors du chargement des équipements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEquipment) {
      setError('Veuillez sélectionner un équipement');
      return;
    }
    
    if (!selectedOTIds || selectedOTIds.length === 0) {
      setError('Aucun OT sélectionné pour validation');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await axios.put('http://localhost:8800/validate-ot', {
        otIds: selectedOTIds,
        equipmentId: selectedEquipment
      });

      if (response.data.status === 'success') {
        setIsSuccess(true);
      } else {
        setError(response.data.message || 'Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Error validating OT:', error);
      setError('Erreur lors de la validation. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedEquipment('');
    setError('');
    setIsSuccess(false);
    onClose();
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
            Valider OT
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
              <FormControl fullWidth error={!!error}>
                <InputLabel id="equipment-label">Équipement</InputLabel>
                <Select
                  labelId="equipment-label"
                  value={selectedEquipment}
                  label="Équipement"
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  disabled={isLoading}
                >
                  <MenuItem value="" disabled>Sélectionner un équipement</MenuItem>
                  {equipmentList.map((equipment) => (
                    <MenuItem key={equipment.eqp_keyu} value={equipment.eqp_keyu}>
                      {equipment.eqp_name}
                    </MenuItem>
                  ))}
                </Select>
                {error && (
                  <Typography variant="caption" color="error">
                    {error}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Fermer</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disabled={isLoading}
            >
              Soumettre
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>
            <IconButton
              aria-label="close"
              onClick={() => {
                handleClose();
                if (typeof onSuccess === 'function') {
                  onSuccess();
                }
              }}
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
                OT validé avec succès
              </Typography>
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

export default ValidateOTDialog;