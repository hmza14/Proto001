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

// Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

function AddLocationDialog({ open, onClose, onSuccess }) {
  // Form fields
  const [codePointLivraison, setCodePointLivraison] = useState('');
  const [nomPointLivraison, setNomPointLivraison] = useState('');
  const [adresseLivraison1, setAdresseLivraison1] = useState('');
  const [adresseLivraison2, setAdresseLivraison2] = useState('');
  const [adresseLivraison3, setAdresseLivraison3] = useState('');
  const [adresseLivraison4, setAdresseLivraison4] = useState('');
  const [telephone, setTelephone] = useState('');
  const [faxContact, setFaxContact] = useState('');
  const [emailContact, setEmailContact] = useState('');
  const [ville, setVille] = useState('');
  const [departement, setDepartement] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [geocodage, setGeocodage] = useState('');
  const [contactCommande, setContactCommande] = useState('');
  const [codePays, setCodePays] = useState('');
  const [heureOuverture, setHeureOuverture] = useState('');
  const [heureFermeture, setHeureFermeture] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Reset form on close
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Reset form values
  const resetForm = () => {
    setCodePointLivraison('');
    setNomPointLivraison('');
    setAdresseLivraison1('');
    setAdresseLivraison2('');
    setAdresseLivraison3('');
    setAdresseLivraison4('');
    setTelephone('');
    setFaxContact('');
    setEmailContact('');
    setVille('');
    setDepartement('');
    setCodePostal('');
    setGeocodage('');
    setContactCommande('');
    setCodePays('');
    setHeureOuverture('');
    setHeureFermeture('');
    setErrors({});
    setIsSuccess(false);
    setIsLoading(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Validate code point livraison (required, max 50 chars, no special chars)
    if (!codePointLivraison) {
      newErrors.codePointLivraison = 'Veuillez saisir un code point de livraison';
    } else if (codePointLivraison.length > 50) {
      newErrors.codePointLivraison = 'Le code ne doit pas dépasser 50 caractères';
    } else if (!validateInput(codePointLivraison)) {
      newErrors.codePointLivraison = 'Caractères spéciaux non autorisés';
    }
    
    // Validate nom point livraison (required, max 50 chars, no special chars)
    if (!nomPointLivraison) {
      newErrors.nomPointLivraison = 'Veuillez saisir un nom point de livraison';
    } else if (nomPointLivraison.length > 50) {
      newErrors.nomPointLivraison = 'Le nom ne doit pas dépasser 50 caractères';
    } else if (!validateInput(nomPointLivraison)) {
      newErrors.nomPointLivraison = 'Caractères spéciaux non autorisés';
    }
    
    // Validate adresse livraison 1 (required, max 250 chars, no special chars)
    if (!adresseLivraison1) {
      newErrors.adresseLivraison1 = 'Veuillez saisir une adresse de livraison';
    } else if (adresseLivraison1.length > 250) {
      newErrors.adresseLivraison1 = 'L\'adresse ne doit pas dépasser 250 caractères';
    } else if (!validateInput(adresseLivraison1)) {
      newErrors.adresseLivraison1 = 'Caractères spéciaux non autorisés';
    }
    
    // Validate adresse livraison 2 (max 250 chars, no special chars)
    if (adresseLivraison2 && adresseLivraison2.length > 250) {
      newErrors.adresseLivraison2 = 'L\'adresse ne doit pas dépasser 250 caractères';
    } else if (adresseLivraison2 && !validateInput(adresseLivraison2)) {
      newErrors.adresseLivraison2 = 'Caractères spéciaux non autorisés';
    }
    
    // Validate adresse livraison 3 (max 50 chars, no special chars)
    if (adresseLivraison3 && adresseLivraison3.length > 50) {
      newErrors.adresseLivraison3 = 'L\'adresse ne doit pas dépasser 50 caractères';
    } else if (adresseLivraison3 && !validateInput(adresseLivraison3)) {
      newErrors.adresseLivraison3 = 'Caractères spéciaux non autorisés';
    }
    
    // Validate adresse livraison 4 (max 50 chars, no special chars)
    if (adresseLivraison4 && adresseLivraison4.length > 50) {
      newErrors.adresseLivraison4 = 'L\'adresse ne doit pas dépasser 50 caractères';
    } else if (adresseLivraison4 && !validateInput(adresseLivraison4)) {
      newErrors.adresseLivraison4 = 'Caractères spéciaux non autorisés';
    }
    
    // Validate telephone (max 15 chars, no special chars)
    if (telephone && telephone.length > 15) {
      newErrors.telephone = 'Le téléphone ne doit pas dépasser 15 caractères';
    } else if (telephone && !validateInput(telephone)) {
      newErrors.telephone = 'Caractères spéciaux non autorisés';
    }
    
    // Validate fax contact (max 20 chars, no special chars)
    if (faxContact && faxContact.length > 20) {
      newErrors.faxContact = 'Le fax ne doit pas dépasser 20 caractères';
    } else if (faxContact && !validateInput(faxContact)) {
      newErrors.faxContact = 'Caractères spéciaux non autorisés';
    }
    
    // Validate email contact (max 100 chars, valid email format)
    if (emailContact && emailContact.length > 100) {
      newErrors.emailContact = 'L\'email ne doit pas dépasser 100 caractères';
    } else if (emailContact && !validateEmail(emailContact)) {
      newErrors.emailContact = 'Format d\'email invalide';
    }
    
    // Validate ville (required, max 25 chars, no special chars)
    if (!ville) {
      newErrors.ville = 'Veuillez saisir une ville';
    } else if (ville.length > 25) {
      newErrors.ville = 'La ville ne doit pas dépasser 25 caractères';
    } else if (!validateInput(ville)) {
      newErrors.ville = 'Caractères spéciaux non autorisés';
    }
    
    // Validate departement (max 5 chars, no special chars)
    if (departement && departement.length > 5) {
      newErrors.departement = 'Le département ne doit pas dépasser 5 caractères';
    } else if (departement && !validateInput(departement)) {
      newErrors.departement = 'Caractères spéciaux non autorisés';
    }
    
    // Validate code postal (required, max 15 chars, no special chars)
    if (!codePostal) {
      newErrors.codePostal = 'Veuillez saisir un code postal';
    } else if (codePostal.length > 15) {
      newErrors.codePostal = 'Le code postal ne doit pas dépasser 15 caractères';
    } else if (!validateInput(codePostal)) {
      newErrors.codePostal = 'Caractères spéciaux non autorisés';
    }
    
    // Validate geocodage (max 15 chars, no special chars)
    if (geocodage && geocodage.length > 15) {
      newErrors.geocodage = 'Le géocodage ne doit pas dépasser 15 caractères';
    } else if (geocodage && !validateInput(geocodage)) {
      newErrors.geocodage = 'Caractères spéciaux non autorisés';
    }
    
    // Validate contact commande (max 150 chars, no special chars)
    if (contactCommande && contactCommande.length > 150) {
      newErrors.contactCommande = 'Le contact ne doit pas dépasser 150 caractères';
    } else if (contactCommande && !validateInput(contactCommande)) {
      newErrors.contactCommande = 'Caractères spéciaux non autorisés';
    }
    
    // Validate code pays (max 6 chars, no special chars)
    if (codePays && codePays.length > 6) {
      newErrors.codePays = 'Le code pays ne doit pas dépasser 6 caractères';
    } else if (codePays && !validateInput(codePays)) {
      newErrors.codePays = 'Caractères spéciaux non autorisés';
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
      // Create Location data object to send to backend
      const locationData = {
        loc_pdcd: codePointLivraison,
        loc_pdnm: nomPointLivraison,
        loc_adr1: adresseLivraison1,
        loc_adr2: adresseLivraison2,
        loc_adr3: adresseLivraison3,
        loc_adr4: adresseLivraison4,
        loc_ntel: telephone,
        loc_fax: faxContact,
        loc_imel: emailContact,
        loc_advl: ville,
        loc_addp: departement,
        loc_adcp: codePostal,
        loc_geoc: geocodage,
        loc_cont: contactCommande,
        loc_cpay: codePays,
        loc_hope: heureOuverture.replace(':', ''),
        loc_hclo: heureFermeture.replace(':', '')
      };
      
      console.log("Sending Location data:", locationData);
      
      // Send data to backend
      const response = await axios.post(buildApiUrl(API_ENDPOINTS.LOCATION), locationData);
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
        alert('Une erreur est survenue lors de la création de la localisation. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error creating Location:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la création de la localisation.';
      
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
              Ajouter une nouvelle localisation
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
                    <TextField
                      label="Code point de livraison"
                      fullWidth
                      value={codePointLivraison}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setCodePointLivraison(value);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!errors.codePointLivraison}
                      helperText={errors.codePointLivraison}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nom point de livraison"
                      fullWidth
                      value={nomPointLivraison}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setNomPointLivraison(value);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!errors.nomPointLivraison}
                      helperText={errors.nomPointLivraison}
                    />
                  </Grid>
                  
                  {/* Row 2 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Adresse livraison 1"
                      fullWidth
                      value={adresseLivraison1}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setAdresseLivraison1(value);
                        }
                      }}
                      inputProps={{ maxLength: 250 }}
                      error={!!errors.adresseLivraison1}
                      helperText={errors.adresseLivraison1}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Adresse livraison 2"
                      fullWidth
                      value={adresseLivraison2}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setAdresseLivraison2(value);
                        }
                      }}
                      inputProps={{ maxLength: 250 }}
                      error={!!errors.adresseLivraison2}
                      helperText={errors.adresseLivraison2}
                    />
                  </Grid>
                  
                  {/* Row 3 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Adresse livraison 3"
                      fullWidth
                      value={adresseLivraison3}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setAdresseLivraison3(value);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!errors.adresseLivraison3}
                      helperText={errors.adresseLivraison3}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Adresse livraison 4"
                      fullWidth
                      value={adresseLivraison4}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setAdresseLivraison4(value);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!errors.adresseLivraison4}
                      helperText={errors.adresseLivraison4}
                    />
                  </Grid>
                  
                  {/* Row 4 */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Ville"
                      fullWidth
                      value={ville}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setVille(value);
                        }
                      }}
                      inputProps={{ maxLength: 25 }}
                      error={!!errors.ville}
                      helperText={errors.ville}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Département"
                      fullWidth
                      value={departement}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setDepartement(value);
                        }
                      }}
                      inputProps={{ maxLength: 5 }}
                      error={!!errors.departement}
                      helperText={errors.departement}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Code postal"
                      fullWidth
                      value={codePostal}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setCodePostal(value);
                        }
                      }}
                      inputProps={{ maxLength: 15 }}
                      error={!!errors.codePostal}
                      helperText={errors.codePostal}
                    />
                  </Grid>
                  
                  {/* Row 5 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Téléphone"
                      fullWidth
                      value={telephone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setTelephone(value);
                        }
                      }}
                      inputProps={{ maxLength: 15 }}
                      error={!!errors.telephone}
                      helperText={errors.telephone}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Fax du contact"
                      fullWidth
                      value={faxContact}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setFaxContact(value);
                        }
                      }}
                      inputProps={{ maxLength: 20 }}
                      error={!!errors.faxContact}
                      helperText={errors.faxContact}
                    />
                  </Grid>
                  
                  {/* Row 6 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email du contact"
                      type="email"
                      fullWidth
                      value={emailContact}
                      onChange={(e) => setEmailContact(e.target.value)}
                      inputProps={{ maxLength: 100 }}
                      error={!!errors.emailContact}
                      helperText={errors.emailContact}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Contact de la commande"
                      fullWidth
                      value={contactCommande}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setContactCommande(value);
                        }
                      }}
                      inputProps={{ maxLength: 150 }}
                      error={!!errors.contactCommande}
                      helperText={errors.contactCommande}
                    />
                  </Grid>
                  
                  {/* Row 7 */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Code pays"
                      fullWidth
                      value={codePays}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setCodePays(value);
                        }
                      }}
                      inputProps={{ maxLength: 6 }}
                      error={!!errors.codePays}
                      helperText={errors.codePays}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Heure d'ouverture"
                      type="time"
                      fullWidth
                      value={heureOuverture}
                      onChange={(e) => setHeureOuverture(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.heureOuverture}
                      helperText={errors.heureOuverture}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Heure de fermeture"
                      type="time"
                      fullWidth
                      value={heureFermeture}
                      onChange={(e) => setHeureFermeture(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.heureFermeture}
                      helperText={errors.heureFermeture}
                    />
                  </Grid>
                  
                  {/* Row 8 */}
                  <Grid item xs={12}>
                    <TextField
                      label="Géocodage"
                      fullWidth
                      value={geocodage}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setGeocodage(value);
                        }
                      }}
                      inputProps={{ maxLength: 15 }}
                      error={!!errors.geocodage}
                      helperText={errors.geocodage}
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
                  Localisation créée avec succès
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
          Localisation créée avec succès
        </Alert>
      </Snackbar>
    </>
  );
}

export default AddLocationDialog;