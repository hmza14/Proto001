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
  Grid,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox
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

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) || email === '';
};

// Phone validation - allow numbers, spaces, dashes, parentheses
const validatePhone = (phone) => {
  const phoneRegex = /^[0-9\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) || phone === '';
};

// Number validation for TTC value
const validateNumber = (value) => {
  return /^\d*\.?\d*$/.test(value) || value === '';
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function EditCMDDialog({ open, onClose, onSuccess, cmdData }) {
  const [tabValue, setTabValue] = useState(0);
  
  // Form fields - Principal tab
  const [chargeur, setChargeur] = useState('');
  const [poChargeur, setPoChargeur] = useState('');
  const [blNumber, setBlNumber] = useState('');
  const [codeStop, setCodeStop] = useState('');
  const [nomStop, setNomStop] = useState('');
  const [dateLivraison, setDateLivraison] = useState('');
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [ville, setVille] = useState('');
  const [secteur, setSecteur] = useState('');
  const [codeRegroupement, setCodeRegroupement] = useState('');
  const [axe, setAxe] = useState('');
  const [nomContact, setNomContact] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [heureOuverture, setHeureOuverture] = useState('');
  const [heureFermeture, setHeureFermeture] = useState('');
  
  // Checkboxes for services
  const [hayon, setHayon] = useState(false);
  const [grue, setGrue] = useState(false);
  const [controleTemperature, setControleTemperature] = useState(false);
  const [transpalette, setTranspalette] = useState(false);
  const [retourBL, setRetourBL] = useState(false);
  const [retourFacture, setRetourFacture] = useState(false);
  const [retourCheque, setRetourCheque] = useState(false);
  
  const [valeurTTC, setValeurTTC] = useState('');
  const [devise, setDevise] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load the CMD data into the form when it changes
  useEffect(() => {
    if (cmdData && open) {
      console.log('Loading CMD data for editing:', cmdData);
      fetchCMDDetails(cmdData.id);
    }
  }, [cmdData, open]);

  // Fetch detailed CMD data
  const fetchCMDDetails = async (cmdId) => {
    try {
      setIsLoading(true);
      console.log('Fetching CMD details for ID:', cmdId);
      
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.CMD_BY_ID(cmdId)));
      //
      
      if (response.data.status === 'success') {
        const data = response.data.data;
        console.log('CMD details received:', data);
        
        // Set form values from fetched data
        setChargeur(data.exp_lib || '');
        setPoChargeur(data.otl_poch || '');
        setBlNumber(data.otl_rfcl || '');
        setCodeStop(data.loc_pdcd || '');
        setNomStop(data.otl_pdnm || '');
        
        // Format date for the date input
        if (data.otl_darp) {
          console.log('Raw date from server:', data.otl_darp);
          try {
            // Ensure it's in YYYY-MM-DD format
            const isValidDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(data.otl_darp);
            if (isValidDateFormat) {
              setDateLivraison(data.otl_darp);
            } else {
              const date = new Date(data.otl_darp);
              if (!isNaN(date.getTime())) {
                const formattedDate = date.toISOString().split('T')[0];
                setDateLivraison(formattedDate);
              } else {
                setDateLivraison('');
              }
            }
          } catch (e) {
            console.error('Error parsing date:', e);
            setDateLivraison('');
          }
        } else {
          setDateLivraison('');
        }
        
        setAdresseLivraison(data.otl_adr1 || '');
        setVille(data.otl_advl || '');
        setSecteur(data.otl_addp || '');
        setCodeRegroupement(data.otl_cgrp || '');
        setAxe(data.otl_caxe || '');
        setNomContact(data.otl_cont || '');
        setTelephone(data.otl_ntel || '');
        setEmail(data.loc_imel || '');
        
        // Format time from HHMM to HH:MM
        const openTimeStr = data.loc_hope || '';
        if (openTimeStr.length === 4) {
          setHeureOuverture(`${openTimeStr.substring(0, 2)}:${openTimeStr.substring(2, 4)}`);
        } else {
          setHeureOuverture('');
        }
        
        const closeTimeStr = data.loc_hclo || '';
        if (closeTimeStr.length === 4) {
          setHeureFermeture(`${closeTimeStr.substring(0, 2)}:${closeTimeStr.substring(2, 4)}`);
        } else {
          setHeureFermeture('');
        }
        
        // Set checkbox values
        setHayon(data.otl_thay || false);
        setGrue(data.otl_tgr || false);
        setControleTemperature(data.otl_ttco || false);
        setTranspalette(data.otl_ttpl || false);
        setRetourBL(data.otl_tbl || false);
        setRetourFacture(data.otl_tbil || false);
        setRetourCheque(data.otl_tchq || false);
        
        setValeurTTC(data.otl_tttc ? data.otl_tttc.toString() : '');
        setDevise(data.act_devi || '');
      } else {
        alert('Erreur lors de la récupération des détails de l\'arrêt');
      }
    } catch (error) {
      console.error('Error fetching CMD details:', error);
      alert('Erreur lors de la récupération des détails de l\'arrêt');
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
    setTabValue(0);
    setChargeur('');
    setPoChargeur('');
    setBlNumber('');
    setCodeStop('');
    setNomStop('');
    setDateLivraison('');
    setAdresseLivraison('');
    setVille('');
    setSecteur('');
    setCodeRegroupement('');
    setAxe('');
    setNomContact('');
    setTelephone('');
    setEmail('');
    setHeureOuverture('');
    setHeureFermeture('');
    setHayon(false);
    setGrue(false);
    setControleTemperature(false);
    setTranspalette(false);
    setRetourBL(false);
    setRetourFacture(false);
    setRetourCheque(false);
    setValeurTTC('');
    setDevise('');
    setErrors({});
    setIsSuccess(false);
    setIsLoading(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Mandatory fields
    if (!chargeur || chargeur === 'sélectionner') {
      newErrors.chargeur = 'Veuillez sélectionner un chargeur';
    }
    
    if (!poChargeur) {
      newErrors.poChargeur = 'Veuillez saisir le PO chargeur';
    } else if (poChargeur.length > 25) {
      newErrors.poChargeur = 'Le PO chargeur ne doit pas dépasser 25 caractères';
    } else if (!validateInput(poChargeur)) {
      newErrors.poChargeur = 'Caractères spéciaux non autorisés';
    }
    
    if (!nomStop) {
      newErrors.nomStop = 'Veuillez saisir le nom du stop';
    } else if (nomStop.length > 50) {
      newErrors.nomStop = 'Le nom ne doit pas dépasser 50 caractères';
    } else if (!validateInput(nomStop)) {
      newErrors.nomStop = 'Caractères spéciaux non autorisés';
    }
    
    if (!adresseLivraison) {
      newErrors.adresseLivraison = 'Veuillez saisir l\'adresse de livraison';
    } else if (adresseLivraison.length > 250) {
      newErrors.adresseLivraison = 'L\'adresse ne doit pas dépasser 250 caractères';
    } else if (!validateInput(adresseLivraison)) {
      newErrors.adresseLivraison = 'Caractères spéciaux non autorisés';
    }
    
    // Date validation
    if (dateLivraison) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const selectedDate = new Date(dateLivraison);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dateLivraison = 'La date ne peut pas être dans le passé';
      }
    }
    
    // Optional field validations
    if (blNumber && !validateInput(blNumber)) {
      newErrors.blNumber = 'Caractères spéciaux non autorisés';
    }
    
    if (codeStop && !validateInput(codeStop)) {
      newErrors.codeStop = 'Caractères spéciaux non autorisés';
    }
    
    if (ville && !validateInput(ville)) {
      newErrors.ville = 'Caractères spéciaux non autorisés';
    }
    
    if (secteur && !validateInput(secteur)) {
      newErrors.secteur = 'Caractères spéciaux non autorisés';
    }
    
    if (codeRegroupement && !validateInput(codeRegroupement)) {
      newErrors.codeRegroupement = 'Caractères spéciaux non autorisés';
    }
    
    if (axe && !validateInput(axe)) {
      newErrors.axe = 'Caractères spéciaux non autorisés';
    }
    
    if (nomContact && !validateInput(nomContact)) {
      newErrors.nomContact = 'Caractères spéciaux non autorisés';
    }
    
    if (telephone && !validatePhone(telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }
    
    if (email && !validateEmail(email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (valeurTTC && !validateNumber(valeurTTC)) {
      newErrors.valeurTTC = 'Veuillez saisir un nombre valide';
    }
    
    if (devise && !validateInput(devise)) {
      newErrors.devise = 'Caractères spéciaux non autorisés';
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
    if (!validateForm() || !cmdData) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the expediteur code from mapping
      const expCode = expediteurMapping[chargeur];
      
      // Create CMD data object to send to backend
      const updatedCmdData = {
        // Concatenate EXP_CODE and EXP_LIB for chargeur
        exp_code: expCode,
        exp_lib: chargeur,
        otl_poch: poChargeur,
        otl_rfcl: blNumber,
        loc_pdcd: codeStop,
        otl_pdnm: nomStop,
        otl_darp: dateLivraison,
        otl_adr1: adresseLivraison,
        otl_advl: ville,
        otl_addp: secteur,
        otl_cgrp: codeRegroupement,
        otl_caxe: axe,
        otl_cont: nomContact,
        otl_ntel: telephone,
        loc_imel: email,
        loc_hope: heureOuverture.replace(':', '') || null, // Convert HH:MM to HHMM
        loc_hclo: heureFermeture.replace(':', '') || null, // Convert HH:MM to HHMM
        otl_thay: hayon,
        otl_tgr: grue,
        otl_ttco: controleTemperature,
        otl_ttpl: transpalette,
        otl_tbl: retourBL,
        otl_tbil: retourFacture,
        otl_tchq: retourCheque,
        otl_tttc: valeurTTC ? parseFloat(valeurTTC) : null,
        act_devi: devise
      };
      
      console.log("Sending updated CMD data:", updatedCmdData);
      
      // Send update to backend
      const response = await axios.put(buildApiUrl(API_ENDPOINTS.CMD_BY_ID(cmdData.id)), updatedCmdData);
      
      if (response.data.status === 'success') {
        // Show success screen
        setIsSuccess(true);
        
        // Call success callback
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(response.data.data);
        }
      } else {
        alert('Une erreur est survenue lors de la mise à jour de l\'arrêt. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error updating CMD:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la mise à jour de l\'arrêt.';
      
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
        maxWidth="lg"
        fullWidth
      >
        {!isSuccess ? (
          <>
            <DialogTitle>
              Modifier un arrêt
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
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab label="Principale" />
                  <Tab label="Commentaire" disabled />
                  <Tab label="EDI" disabled />
                </Tabs>
              </Box>

              {/* Principal Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                  {/* Row 1 */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={!!errors.chargeur}>
                      <InputLabel id="chargeur-label">Chargeur *</InputLabel>
                      <Select
                        labelId="chargeur-label"
                        value={chargeur}
                        label="Chargeur *"
                        onChange={(e) => setChargeur(e.target.value)}
                      >
                        <MenuItem value="sélectionner" disabled>Sélectionner un chargeur</MenuItem>
                        <MenuItem value="Carrefour Lyon">Carrefour Lyon</MenuItem>
                        <MenuItem value="Leclerc Marseille">Leclerc Marseille</MenuItem>
                        <MenuItem value="Auchan Paris">Auchan Paris</MenuItem>
                      </Select>
                      {errors.chargeur && (
                        <Typography variant="caption" color="error">
                          {errors.chargeur}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="PO Chargeur *"
                      fullWidth
                      value={poChargeur}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setPoChargeur(value);
                        }
                      }}
                      inputProps={{ maxLength: 25 }}
                      error={!!errors.poChargeur}
                      helperText={errors.poChargeur}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="BL N°"
                      fullWidth
                      value={blNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setBlNumber(value);
                        }
                      }}
                      error={!!errors.blNumber}
                      helperText={errors.blNumber}
                    />
                  </Grid>

                  {/* Row 2 */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Code stop"
                      fullWidth
                      value={codeStop}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setCodeStop(value);
                        }
                      }}
                      error={!!errors.codeStop}
                      helperText={errors.codeStop}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Nom stop *"
                      fullWidth
                      value={nomStop}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setNomStop(value);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!errors.nomStop}
                      helperText={errors.nomStop}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Date de livraison"
                      type="date"
                      fullWidth
                      value={dateLivraison}
                      onChange={(e) => setDateLivraison(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: getTodayDate() }}
                      error={!!errors.dateLivraison}
                      helperText={errors.dateLivraison}
                    />
                  </Grid>

                  {/* Row 3 - Address */}
                  <Grid item xs={12}>
                    <TextField
                      label="Adresse de livraison *"
                      fullWidth
                      value={adresseLivraison}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setAdresseLivraison(value);
                        }
                      }}
                      inputProps={{ maxLength: 250 }}
                      error={!!errors.adresseLivraison}
                      helperText={errors.adresseLivraison}
                    />
                  </Grid>

                  {/* Row 4 */}
                  <Grid item xs={12} md={3}>
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
                      error={!!errors.ville}
                      helperText={errors.ville}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Secteur"
                      fullWidth
                      value={secteur}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setSecteur(value);
                        }
                      }}
                      error={!!errors.secteur}
                      helperText={errors.secteur}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Code Regroupement"
                      fullWidth
                      value={codeRegroupement}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setCodeRegroupement(value);
                        }
                      }}
                      error={!!errors.codeRegroupement}
                      helperText={errors.codeRegroupement}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Axe"
                      fullWidth
                      value={axe}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setAxe(value);
                        }
                      }}
                      error={!!errors.axe}
                      helperText={errors.axe}
                    />
                  </Grid>

                  {/* Row 5 */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Nom contact"
                      fullWidth
                      value={nomContact}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setNomContact(value);
                        }
                      }}
                      error={!!errors.nomContact}
                      helperText={errors.nomContact}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Tél"
                      fullWidth
                      value={telephone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validatePhone(value)) {
                          setTelephone(value);
                        }
                      }}
                      error={!!errors.telephone}
                      helperText={errors.telephone}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Email"
                      fullWidth
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>

                  {/* Row 6 - Hours */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Heure ouverture"
                      type="time"
                      fullWidth
                      value={heureOuverture}
                      onChange={(e) => setHeureOuverture(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Heure fermeture"
                      type="time"
                      fullWidth
                      value={heureFermeture}
                      onChange={(e) => setHeureFermeture(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {/* Row 7 - Checkboxes */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Services:</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6} md={3}>
                        <FormControlLabel
                          control={<Checkbox checked={hayon} onChange={(e) => setHayon(e.target.checked)} />}
                          label="Hayon"
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <FormControlLabel
                          control={<Checkbox checked={grue} onChange={(e) => setGrue(e.target.checked)} />}
                          label="Grue"
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <FormControlLabel
                          control={<Checkbox checked={controleTemperature} onChange={(e) => setControleTemperature(e.target.checked)} />}
                          label="Contrôle température"
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <FormControlLabel
                          control={<Checkbox checked={transpalette} onChange={(e) => setTranspalette(e.target.checked)} />}
                          label="Transpalette"
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <FormControlLabel
                          control={<Checkbox checked={retourBL} onChange={(e) => setRetourBL(e.target.checked)} />}
                          label="Retour BL"
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <FormControlLabel
                          control={<Checkbox checked={retourFacture} onChange={(e) => setRetourFacture(e.target.checked)} />}
                          label="Retour Facture"
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <FormControlLabel
                          control={<Checkbox checked={retourCheque} onChange={(e) => setRetourCheque(e.target.checked)} />}
                          label="Retour Chèque"
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Row 8 - Value and Currency */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Valeur TTC"
                      fullWidth
                      value={valeurTTC}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateNumber(value)) {
                          setValeurTTC(value);
                        }
                      }}
                      error={!!errors.valeurTTC}
                      helperText={errors.valeurTTC}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Devise"
                      fullWidth
                      value={devise}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || validateInput(value)) {
                          setDevise(value);
                        }
                      }}
                      error={!!errors.devise}
                      helperText={errors.devise}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Commentaire Tab - Disabled for now */}
              <TabPanel value={tabValue} index={1}>
                <Typography>Commentaire tab - À venir</Typography>
              </TabPanel>

              {/* EDI Tab - Disabled for now */}
              <TabPanel value={tabValue} index={2}>
                <Typography>EDI tab - À venir</Typography>
              </TabPanel>
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
                  Arrêt modifié avec succès
                </Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}

export default EditCMDDialog;