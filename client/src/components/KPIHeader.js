import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Chip,
  CircularProgress
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import axios from 'axios';

function KPIHeader() {
  const [kpis, setKpis] = useState({
    validatedOTs: 0,
    processedCommands: 0,
    availableEquipment: 0,
    exploitedEquipment: 0 // New KPI
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8800/kpis');
        
        if (response.data.status === 'success') {
          setKpis(response.data.data);
        } else {
          setError('Erreur lors du chargement des KPIs');
        }
      } catch (error) {
        console.error('Error fetching KPIs:', error);
        setError('Erreur lors du chargement des KPIs');
        
        // Use fallback sample data in development
        if (process.env.NODE_ENV === 'development') {
          setKpis({
            validatedOTs: 12,
            processedCommands: 45,
            availableEquipment: 8,
            exploitedEquipment: 5
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
    
    // Refresh KPIs every 10 minutes
    const refreshInterval = setInterval(fetchKPIs, 600000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ padding: 1, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={16} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 1 }}>
        <Typography color="error" variant="caption">{error}</Typography>
      </Box>
    );
  }

  // Common styles for KPI cards
  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    borderRadius: '4px',
    paddingLeft: 1,
    paddingRight: 1
  };

  // Common styles for chips
  const chipStyle = {
    height: '22px',
    fontSize: '0.65rem',
    fontWeight: 'bold'
  };

  return (
    <Box sx={{ padding: '8px 16px', marginBottom: 1 }}>
      <Box sx={{ maxWidth: '100%', margin: '0 auto' }}>
        <Grid container spacing={1} sx={{ height: '70px' }}>
          {/* KPI 1: Validated OTs */}
          <Grid item xs={2.85} sx={{ height: '100%' }}>
            <Paper 
              elevation={1}
              sx={{ 
                ...cardStyle,
                borderLeft: '4px solid #4caf50'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20, marginRight: 1 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    OTs validés
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    {kpis.validatedOTs}
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label="Total" 
                size="small"
                sx={{ 
                  ...chipStyle,
                  backgroundColor: '#e8f5e9', 
                  color: '#2e7d32'
                }} 
              />
            </Paper>
          </Grid>
          
          {/* KPI 2: Processed Commands */}
          <Grid item xs={2.85} sx={{ height: '100%' }}>
            <Paper 
              elevation={1}
              sx={{ 
                ...cardStyle,
                borderLeft: '4px solid #2196f3'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <InventoryIcon sx={{ color: '#2196f3', fontSize: 20, marginRight: 1 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Commandes traitées
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    {kpis.processedCommands}
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label="Total" 
                size="small"
                sx={{ 
                  ...chipStyle,
                  backgroundColor: '#e3f2fd', 
                  color: '#0d47a1'
                }} 
              />
            </Paper>
          </Grid>
          
          {/* KPI 3: Available Equipment */}
          <Grid item xs={2.85} sx={{ height: '100%' }}>
            <Paper 
              elevation={1}
              sx={{ 
                ...cardStyle,
                borderLeft: '4px solid #ff9800'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <LocalShippingIcon sx={{ color: '#ff9800', fontSize: 20, marginRight: 1 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Équipements libres
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    {kpis.availableEquipment}
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label="Disp" 
                size="small"
                sx={{ 
                  ...chipStyle,
                  backgroundColor: '#fff3e0', 
                  color: '#e65100'
                }} 
              />
            </Paper>
          </Grid>

          {/* KPI 4: Exploited Equipment - NEW */}
          <Grid item xs={2.85} sx={{ height: '100%' }}>
            <Paper 
              elevation={1}
              sx={{ 
                ...cardStyle,
                borderLeft: '4px solid #9c27b0' // Purple for exploited equipment
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <DirectionsCarIcon sx={{ color: '#9c27b0', fontSize: 20, marginRight: 1 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Équipements exploités
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    {kpis.exploitedEquipment}
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label="Actif" 
                size="small"
                sx={{ 
                  ...chipStyle,
                  backgroundColor: '#f3e5f5', 
                  color: '#6a1b9a'
                }} 
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default KPIHeader;