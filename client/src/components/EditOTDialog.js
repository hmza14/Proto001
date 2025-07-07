import React, { useState, useEffect } from 'react';
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
  Box,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from './apiConfig';

const expediteurMapping = {
  'Carrefour Lyon': 'EXP001',
  'Auchan Paris': 'EXP002',
  'Leclerc Marseille': 'EXP003'
};

// Input validation function - only allow letters and numbers (no special chars)
const validateInput = (input) => {
  // Allow only letters (including accented) and numbers
  return /^[a-zA-ZÀ-ÖØ-öø-ÿ0-9\s]+$/.test(input) || input === '';
};

function EditOTDialog({ open, onClose, onSuccess, otData }) {
  const [expediteur, setExpediteur] = useState('');
  const [libelleChargement, setLibelleChargement] = useState('');
  const [typeChargement, setTypeChargement] = useState('');
  
  // Form fields
  const [dateDepart, setDateDepart] = useState('');
  const [heureDepart, setHeureDepart] = useState('');
  const [siteDepart, setSiteDepart] = useState('');
  const [commentairesTransporteur, setCommentairesTransporteur] = useState('');
  const [conducteur01, setConducteur01] = useState('');
  const [conducteur02, setConducteur02] = useState('');
  const [conducteur03, setConducteur03] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load the OT data into the form when it changes
  useEffect(() => {
    if (otData && open) {
      fetchOTDetails(otData.id);
    }
  }, [otData, open]);

  // Debug effect to monitor date value
  useEffect(() => {
    console.log('Current dateDepart value:', dateDepart);
  }, [dateDepart]);

  // Fetch detailed OT data
  const fetchOTDetails = async (otId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.OT_BY_ID(otId)));
      //
      
      if (response.data.status === 'success') {
        const data = response.data.data;
        
        // Set form values from fetched data
        setExpediteur(data.exp_lib || '');
        setLibelleChargement(data.oth_lib || '');
        setTypeChargement(data.oth_typc || '');
        
        // Format date for the date input - critical for display
        if (data.oth_sidd) {
          console.log('Raw date from server:', data.oth_sidd);
          // Ensure it's in YYYY-MM-DD format
          try {
            // First try direct parsing if it's already in right format
            const isValidDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(data.oth_sidd);
            if (isValidDateFormat) {
              console.log('Date is already in YYYY-MM-DD format:', data.oth_sidd);
              setDateDepart(data.oth_sidd);
            } else {
              // Otherwise convert date to YYYY-MM-DD
              const date = new Date(data.oth_sidd);
              if (!isNaN(date.getTime())) {
                const formattedDate = date.toISOString().split('T')[0];
                console.log('Converted date to YYYY-MM-DD:', formattedDate);
                setDateDepart(formattedDate);
              } else {
                console.error('Invalid date:', data.oth_sidd);
                setDateDepart('');
              }
            }
          } catch (e) {
            console.error('Error parsing date:', e);
            setDateDepart('');
          }
        } else {
          setDateDepart('');
        }
        
        // Format time from HHMM to HH:MM
        const timeStr = data.oth_sihd || '';
        if (timeStr.length === 4) {
          setHeureDepart(`${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`);
        } else {
          setHeureDepart('');
        }
        
        setSiteDepart(data.oth_sitd || '');
        setCommentairesTransporteur(data.oth_cotr || '');
        setConducteur01(data.oth_cha1 || '');
        setConducteur02(data.oth_cha2 || '');
        setConducteur03(data.oth_cha3 || '');
      } else {
        alert('Erreur lors de la récupération des détails de l\'OT');
      }
    } catch (error) {
      console.error('Error fetching OT details:', error);
      alert('Erreur lors de la récupération des détails de l\'OT');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form on close
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Reset form values
  const resetForm = () => {
    setExpediteur('');
    setLibelleChargement('');
    setTypeChargement('');
    setDateDepart('');
    setHeureDepart('');
    setSiteDepart('');
    setCommentairesTransporteur('');
    setConducteur01('');
    setConducteur02('');
    setConducteur03('');
    setErrors({});
    setIsSuccess(false);
    setIsLoading(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!expediteur || expediteur === 'sélectionner') {
      newErrors.expediteur = 'Veuillez sélectionner un expéditeur';
    }
    
    // Validate libellé chargement (required, max 50 chars, no special chars)
    if (!libelleChargement) {
      newErrors.libelleChargement = 'Veuillez saisir un libellé de chargement';
    } else if (libelleChargement.length > 50) {
      newErrors.libelleChargement = 'Le libellé ne doit pas dépasser 50 caractères';
    } else if (!validateInput(libelleChargement)) {
      newErrors.libelleChargement = 'Caractères spéciaux non autorisés';
    }
    
    if (!typeChargement || typeChargement === 'sélectionner') {
      newErrors.typeChargement = 'Veuillez sélectionner un type de chargement';
    }
    
    // Validate date (required and must not be in the past)
    if (!dateDepart) {
      newErrors.dateDepart = 'Veuillez sélectionner une date de départ';
    } else {
      // Check if date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for proper comparison
      
      const selectedDate = new Date(dateDepart);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dateDepart = 'La date ne peut pas être dans le passé';
      }
    }
    
    if (!heureDepart) {
      newErrors.heureDepart = 'Veuillez sélectionner une heure de départ';
    }
    
    // Validate site de départ (required, max 35 chars, no special chars)
    if (!siteDepart) {
      newErrors.siteDepart = 'Veuillez saisir un site de départ';
    } else if (siteDepart.length > 35) {
      newErrors.siteDepart = 'Le site ne doit pas dépasser 35 caractères';
    } else if (!validateInput(siteDepart)) {
      newErrors.siteDepart = 'Caractères spéciaux non autorisés';
    }
    
    // Validate commentaires (max 250 chars, no special chars)
    if (commentairesTransporteur && !validateInput(commentairesTransporteur)) {
      newErrors.commentairesTransporteur = 'Caractères spéciaux non autorisés';
    } else if (commentairesTransporteur.length > 250) {
      newErrors.commentairesTransporteur = 'Les commentaires ne doivent pas dépasser 250 caractères';
    }
    
    // Validate conducteurs (max 50 chars each, no special chars)
    if (conducteur01 && !validateInput(conducteur01)) {
      newErrors.conducteur01 = 'Caractères spéciaux non autorisés';
    } else if (conducteur01.length > 50) {
      newErrors.conducteur01 = 'Le nom ne doit pas dépasser 50 caractères';
    }
    
    if (conducteur02 && !validateInput(conducteur02)) {
      newErrors.conducteur02 = 'Caractères spéciaux non autorisés';
    } else if (conducteur02.length > 50) {
      newErrors.conducteur02 = 'Le nom ne doit pas dépasser 50 caractères';
    }
    
    if (conducteur03 && !validateInput(conducteur03)) {
      newErrors.conducteur03 = 'Caractères spéciaux non autorisés';
    } else if (conducteur03.length > 50) {
      newErrors.conducteur03 = 'Le nom ne doit pas dépasser 50 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Submit form data
  const handleSubmit = async () => {
    if (!validateForm() || !otData) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the expediteur code from mapping
      const expCode = expediteurMapping[expediteur];
      
      // Create OT data object to send to backend
      const updatedOtData = {
        exp_lib: expediteur,
        exp_code: expCode,
        oth_lib: libelleChargement,
        oth_typc: typeChargement,
        // Format time from HH:MM to HHMM
        oth_sidd: dateDepart,
        oth_sihd: heureDepart.replace(':', ''),
        oth_sitd: siteDepart,
        oth_cotr: commentairesTransporteur,
        oth_cha1: conducteur01,
        oth_cha2: conducteur02,
        oth_cha3: conducteur03
      };
      
      console.log("Sending updated OT data:", updatedOtData);
      
      // Send update to backend
      const response = await axios.put(buildApiUrl(API_ENDPOINTS.OT_BY_ID(otData.id)), updatedOtData);
      
      if (response.data.status === 'success') {
        // Show success screen
        setIsSuccess(true);
        
        // Call success callback
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(response.data.data);
        }
      } else {
        alert('Une erreur est survenue lors de la mise à jour de l\'OT. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error updating OT:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la mise à jour de l\'OT.';
      
      if (error.response) {
        errorMessage += ` Erreur ${error.response.status}: ${error.response.data.message || error.response.statusText}`;
        console.error('Error response:', error.response);
      } else if (error.request) {
        errorMessage += ' Aucune réponse du serveur. Vérifiez que le serveur est en cours d\'exécution.';
        console.error('Error request:', error.request);
      }
      
      alert(errorMessage + ' Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        {!isSuccess ? (
          <>
            <DialogTitle>
              Modifier un ordre de transport
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
                <Grid container spacing={2}>
                  {/* Row 1 */}
                  <Grid item xs={12} md={6}>
                    {/* Expéditeur (Chargeur) dropdown */}
                    <FormControl fullWidth error={!!errors.expediteur}>
                      <InputLabel id="expediteur-label">Chargeur</InputLabel>
                      <Select
                        labelId="expediteur-label"
                        value={expediteur}
                        label="Chargeur"
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
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    {/* Libellé chargement textbox */}
                    <TextField
                      label="Libellé chargement"
                      fullWidth
                      value={libelleChargement}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setLibelleChargement(value);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!errors.libelleChargement}
                      helperText={errors.libelleChargement}
                    />
                  </Grid>
                  
                  {/* Row 2 */}
                  <Grid item xs={12} md={4}>
                    {/* Date de départ */}
                    <TextField
                      label="Date de départ"
                      type="date"
                      fullWidth
                      value={dateDepart}
                      onChange={(e) => setDateDepart(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ 
                        min: getTodayDate(),
                        placeholder: '' // Remove default placeholder
                      }}
                      error={!!errors.dateDepart}
                      helperText={errors.dateDepart}
                      // Force the date format display
                      sx={{
                        '& input::-webkit-datetime-edit-fields-wrapper': { 
                          visibility: dateDepart ? 'visible' : 'hidden' 
                        },
                        '& input:focus::-webkit-datetime-edit-fields-wrapper': { 
                          visibility: 'visible' 
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    {/* Heure départ */}
                    <TextField
                      label="Heure départ"
                      type="time"
                      fullWidth
                      value={heureDepart}
                      onChange={(e) => setHeureDepart(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.heureDepart}
                      helperText={errors.heureDepart}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
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
                  </Grid>
                  
                  {/* Row 3 */}
                  <Grid item xs={12} md={6}>
                    {/* Site de départ text input */}
                    <TextField
                      label="Site de départ"
                      fullWidth
                      value={siteDepart}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setSiteDepart(value);
                        }
                      }}
                      inputProps={{ maxLength: 35 }}
                      error={!!errors.siteDepart}
                      helperText={errors.siteDepart}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    {/* This space intentionally left blank for layout purposes */}
                    {/* It will be used for "Équipement" field as shown in the mockup, but not needed yet */}
                  </Grid>
                  
                  {/* Row 4 */}
                  <Grid item xs={12}>
                    {/* Commentaires transporteur */}
                    <TextField
                      label="Commentaires transporteur"
                      fullWidth
                      multiline
                      rows={2}
                      value={commentairesTransporteur}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setCommentairesTransporteur(value);
                        }
                      }}
                      inputProps={{ maxLength: 250 }}
                      error={!!errors.commentairesTransporteur}
                      helperText={errors.commentairesTransporteur}
                    />
                  </Grid>
                  
                  {/* Row 5 */}
                  <Grid item xs={12} md={4}>
                    {/* Conducteur 01 */}
                    <TextField
                      label="Conducteur 01"
                      fullWidth
                      value={conducteur01}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setConducteur01(value);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!errors.conducteur01}
                      helperText={errors.conducteur01}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    {/* Conducteur 02 */}
                    <TextField
                      label="Conducteur 02"
                      fullWidth
                      value={conducteur02}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setConducteur02(value);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!errors.conducteur02}
                      helperText={errors.conducteur02}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    {/* Conducteur 03 */}
                    <TextField
                      label="Conducteur 03"
                      fullWidth
                      value={conducteur03}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setConducteur03(value);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!errors.conducteur03}
                      helperText={errors.conducteur03}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ padding: 2, justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                onClick={handleClose} 
                variant="outlined" 
                color="inherit"
                sx={{ borderColor: '#ccc' }}
              >
                FERMER
              </Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained" 
                color="primary"
                disabled={isLoading}
                sx={{ 
                  backgroundColor: '#4CAF50', 
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#45a049',
                  }
                }}
              >
                ENREGISTRER
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
                  OT modifié avec succès
                </Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}

export default EditOTDialog;