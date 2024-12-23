import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography, Paper, Divider } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import axios from 'axios';

function DataTableOT({ setOtIds }) {
  const [otRows, setOTRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0); // Current page
  const [pageSize, setPageSize] = useState(5); // Rows per page

  // Fetch data on mount
  useEffect(() => {
    const fetchOTRows = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8800/ot';
        const response = await axios.get(API_URL);
        const data = response.data.data;

        if (data && data.length > 0) {
          const transformedData = data.map((row, index) => ({
            id: row.oth_keyu || index, // Ensure a unique `id` field for each row
            ...row,
          }));
          setOTRows(transformedData);
          setOtIds(data.map((row) => row.oth_keyu));
          setError(null);
        } else {
          setError('Aucune donnée trouvée.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Une erreur est survenue lors de la récupération des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchOTRows();
  }, [setOtIds]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when page size changes
  };

  return (
    <Box
      component={Paper}
      elevation={3}
      sx={{
        padding: 2,
        margin: 2,
        borderRadius: 2,
        backgroundColor: '#f9f9f9',
      }}
    >
      <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 600 }}>
        Suivi des OTs
      </Typography>
      <Divider sx={{ marginBottom: 2 }} />

      {/* Error Message */}
      {error && (
        <Typography
          variant="body2"
          color="error"
          align="center"
          sx={{
            marginBottom: 2,
            padding: 1,
            border: '1px solid #f44336',
            borderRadius: '4px',
            backgroundColor: '#fdecea',
          }}
        >
          {error}
        </Typography>
      )}

      {/* DataGrid */}
      <Box
        sx={{
          height: 480,
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: 1,
          overflow: 'hidden',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={32} />
          </Box>
        ) : otRows.length === 0 ? (
          <Typography variant="body2" color="textSecondary" align="center" sx={{ paddingTop: 5 }}>
            Aucun résultat trouvé.
          </Typography>
        ) : (
          <DataGrid
            rows={otRows}
            columns={[
              { field: 'oth_keyu', headerName: 'ID', width: 100 },
              { field: 'oth_icod', headerName: 'Code Chargement', width: 150 },
              { field: 'oth_lib', headerName: 'Libelle Chargement', width: 200 },
              { field: 'exp_lib', headerName: 'Expediteur', width: 200 },
            ]}
            disableSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            pagination
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            rowCount={otRows.length}
            paginationMode="server" // Server-side pagination (optional if you handle server-side)
          />
        )}
      </Box>
    </Box>
  );
}

DataTableOT.propTypes = {
  setOtIds: PropTypes.func.isRequired,
};

export default DataTableOT;
