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
  FormControlLabel,
  Checkbox,
  IconButton,
  Typography,
  Box,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from './apiConfig';

// Input validation function - only allow letters and numbers (no special chars)
const validateInput = (input) => {
  // Allow only letters (including accented) and numbers
  return /^[a-zA-ZÀ-ÖØ-öø-ÿ0-9\s]+$/.test(input) || input === '';
};

// Matricule validation function - allow letters, numbers, - and _
const validateMatricule = (input) => {
  return /^[a-zA-ZÀ-ÖØ-öø-ÿ0-9\s\-_]+$/.test(input) || input === '';
};

// Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

function AddUtilisateurDialog({ open, onClose, onSuccess }) {
  // Form fields
  const [actif, setActif] = useState(true); // New checkbox field
  const [nomComplet, setNomComplet] = useState('');
  const [matricule, setMatricule] = useState('');
  const [typeUtilisateur, setTypeUtilisateur] = useState('');
  const [langue, setLangue] = useState('');
  const [dateLimiteAcces, setDateLimiteAcces] = useState('');
  const [email, setEmail] = useState('');
  const [identifiantConnexion, setIdentifiantConnexion] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Type d'utilisateur options
  const typeOptions = ['Type1', 'Type2', 'Type3'];

  // Reset form on close
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Reset form values
  const resetForm = () => {
    setActif(true);
    setNomComplet('');
    setMatricule('');
    setTypeUtilisateur('');
    setLangue('');
    setDateLimiteAcces('');
    setEmail('');
    setIdentifiantConnexion('');
    setMotDePasse('');
    setErrors({});
    setIsSuccess(false);
    setIsLoading(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Validate nom complet (required, max 50 chars, no special chars)
    if (!nomComplet) {
      newErrors.nomComplet = 'Veuillez saisir un nom complet';
    } else if (nomComplet.length > 50) {
      newErrors.nomComplet = 'Le nom ne doit pas dépasser 50 caractères';
    } else if (!validateInput(nomComplet)) {
      newErrors.nomComplet = 'Caractères spéciaux non autorisés';
    }
    
    // Validate matricule (required, max 50 chars, allow - and _)
    if (!matricule) {
      newErrors.matricule = 'Veuillez saisir un matricule';
    } else if (matricule.length > 50) {
      newErrors.matricule = 'Le matricule ne doit pas dépasser 50 caractères';
    } else if (!validateMatricule(matricule)) {
      newErrors.matricule = 'Seuls les caractères alphanumériques, tirets (-) et underscores (_) sont autorisés';
    }
    
    // Validate type utilisateur (required)
    if (!typeUtilisateur) {
      newErrors.typeUtilisateur = 'Veuillez sélectionner un type d\'utilisateur';
    }
    
    // Validate langue (required, max 50 chars, no special chars)
    if (!langue) {
      newErrors.langue = 'Veuillez saisir une langue';
    } else if (langue.length > 50) {
      newErrors.langue = 'La langue ne doit pas dépasser 50 caractères';
    } else if (!validateInput(langue)) {
      newErrors.langue = 'Caractères spéciaux non autorisés';
    }
    
    // Validate date limite d'accès (required)
    if (!dateLimiteAcces) {
      newErrors.dateLimiteAcces = 'Veuillez sélectionner une date limite d\'accès';
    }
    
    // Validate email (required, max 128 chars, valid email format)
    if (!email) {
      newErrors.email = 'Veuillez saisir un email';
    } else if (email.length > 128) {
      newErrors.email = 'L\'email ne doit pas dépasser 128 caractères';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    // Validate identifiant connexion (required, max 20 chars, no special chars)
    if (!identifiantConnexion) {
      newErrors.identifiantConnexion = 'Veuillez saisir un identifiant de connexion';
    } else if (identifiantConnexion.length > 20) {
      newErrors.identifiantConnexion = 'L\'identifiant ne doit pas dépasser 20 caractères';
    } else if (!validateInput(identifiantConnexion)) {
      newErrors.identifiantConnexion = 'Caractères spéciaux non autorisés';
    }
    
    // Validate mot de passe (required, max 100 chars, no special chars)
    if (!motDePasse) {
      newErrors.motDePasse = 'Veuillez saisir un mot de passe';
    } else if (motDePasse.length > 100) {
      newErrors.motDePasse = 'Le mot de passe ne doit pas dépasser 100 caractères';
    } else if (!validateInput(motDePasse)) {
      newErrors.motDePasse = 'Caractères spéciaux non autorisés';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form data
  const handleSubmit = async (createAnother = false) => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create Utilisateur data object to send to backend
      const utilisateurData = {
        usr_actf: actif,
        usr_name: nomComplet,
        usr_mtrc: matricule,
        usr_type: typeUtilisateur,
        usr_lang: langue,
        usr_limi: dateLimiteAcces,
        usr_mail: email,
        usr_logn: identifiantConnexion,
        usr_pass: motDePasse
      };
      
      console.log("Sending Utilisateur data:", utilisateurData);
      
      // Send data to backend
      const response = await axios.post(buildApiUrl(API_ENDPOINTS.UTILISATEUR), utilisateurData);
      //
      
      if (response.data.status === 'success') {
        if (createAnother) {
          // Show success message in snackbar
          setShowSnackbar(true);
          
          // Reset form
          resetForm();
          
          // Call success callback
          if (onSuccess && typeof onSuccess === 'function') {
            onSuccess(response.data.data);
          }
        } else {
          // Show success screen
          setIsSuccess(true);
          
          // Call success callback
          if (onSuccess && typeof onSuccess === 'function') {
            onSuccess(response.data.data);
          }
        }
      } else {
        alert('Une erreur est survenue lors de la création de l\'utilisateur. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error creating Utilisateur:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la création de l\'utilisateur.';
      
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
              Ajouter un nouvel utilisateur
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
                  {/* Row 1 - Actif checkbox only */}
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={actif}
                          onChange={(e) => setActif(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Actif"
                    />
                  </Grid>
                  
                  {/* Row 2 - Nom complet and Matricule */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nom complet"
                      fullWidth
                      value={nomComplet}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setNomComplet(value);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!errors.nomComplet}
                      helperText={errors.nomComplet}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Matricule"
                      fullWidth
                      value={matricule}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateMatricule(value)) {
                          setMatricule(value);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!errors.matricule}
                      helperText={errors.matricule}
                    />
                  </Grid>
                  
                  {/* Row 3 - Type d'utilisateur and Langue */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.typeUtilisateur}>
                      <InputLabel id="type-utilisateur-label">Type d'utilisateur</InputLabel>
                      <Select
                        labelId="type-utilisateur-label"
                        value={typeUtilisateur}
                        label="Type d'utilisateur"
                        onChange={(e) => setTypeUtilisateur(e.target.value)}
                      >
                        <MenuItem value="">Sélectionner un type</MenuItem>
                        {typeOptions.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.typeUtilisateur && (
                        <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                          {errors.typeUtilisateur}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Langue"
                      fullWidth
                      value={langue}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setLangue(value);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!errors.langue}
                      helperText={errors.langue}
                    />
                  </Grid>
                  
                  {/* Row 4 - Date limite d'accès and Email */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Date limite d'accès"
                      type="date"
                      fullWidth
                      value={dateLimiteAcces}
                      onChange={(e) => setDateLimiteAcces(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateLimiteAcces}
                      helperText={errors.dateLimiteAcces}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email"
                      type="email"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      inputProps={{ maxLength: 128 }}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>
                  
                  {/* Row 5 - Identifiant de connexion and Mot de passe */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Identifiant de connexion"
                      fullWidth
                      value={identifiantConnexion}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setIdentifiantConnexion(value);
                        }
                      }}
                      inputProps={{ maxLength: 20 }}
                      error={!!errors.identifiantConnexion}
                      helperText={errors.identifiantConnexion}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Mot de passe"
                      type="password"
                      fullWidth
                      value={motDePasse}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setMotDePasse(value);
                        }
                      }}
                      inputProps={{ maxLength: 100 }}
                      error={!!errors.motDePasse}
                      helperText={errors.motDePasse}
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
                onClick={() => handleSubmit(true)} 
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
                ENREGISTRER ET NOUVEAU
              </Button>
              <Button 
                onClick={() => handleSubmit(false)} 
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
                  Utilisateur créé avec succès
                </Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
      
      {/* Success snackbar for "Enregistrer et nouveau" */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Utilisateur créé avec succès
        </Alert>
      </Snackbar>
    </>
  );
}

export default AddUtilisateurDialog;