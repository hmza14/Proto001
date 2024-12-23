import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { DataGridPro, GridToolbar, GridLogicOperator } from '@mui/x-data-grid-pro';
import PropTypes from 'prop-types';
import axios from 'axios';

const VISIBLE_FIELDS = ['oth_keyu', 'oth_icod', 'oth_lib', 'exp_lib'];

function DataTableOT_P({ setOtIds }) {
  const [otRows, setOTRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOTRows = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8800/ot');
        const data = response.data.data;
        if (data && data.length > 0) {
          const transformedData = data.map((row, index) => ({
            id: row.oth_keyu || index, // Use 'oth_keyu' as 'id' if available, else use the index
            ...row,
          }));
          setOTRows(transformedData);
          setOtIds(data.map((row) => row.oth_keyu));
          setError(null);
        } else {
          setError('Aucune donnée trouvée.');
        }
      } catch (err) {
        setError('Une erreur est survenue lors de la récupération des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchOTRows();
  }, [setOtIds]);

  return (
    <Box sx={{ padding: 1 }}>
      <Typography
        sx={{ flex: '1 1 100%' }}
        variant="h6"
        component="div"
        gutterBottom
      >
        Suivi des OTs:
      </Typography>

      {error && (
        <Typography variant="body2" color="error" align="center">
          {error}
        </Typography>
      )}

      <div style={{ height: 500, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <DataGridPro
            rows={otRows}
            columns={[
              { field: 'oth_keyu', headerName: 'ID', width: 100 },
              { field: 'oth_icod', headerName: 'Code Chargement', width: 150 },
              { field: 'oth_lib', headerName: 'Libelle Chargement', width: 200 },
              { field: 'exp_lib', headerName: 'Expediteur', width: 200 },
            ]}
            loading={loading}
            slots={{
              toolbar: GridToolbar,
            }}
            slotProps={{
              filterPanel: {
                logicOperators: [GridLogicOperator.And],
                columnsSort: 'asc',
                filterFormProps: {
                  logicOperatorInputProps: {
                    variant: 'outlined',
                    size: 'small',
                  },
                  columnInputProps: {
                    variant: 'outlined',
                    size: 'small',
                    sx: { mt: 'auto' },
                  },
                  operatorInputProps: {
                    variant: 'outlined',
                    size: 'small',
                    sx: { mt: 'auto' },
                  },
                  valueInputProps: {
                    InputComponentProps: {
                      variant: 'outlined',
                      size: 'small',
                    },
                  },
                  deleteIconProps: {
                    sx: {
                      '& .MuiSvgIcon-root': { color: '#d32f2f' },
                    },
                  },
                },
                sx: {
                  '& .MuiDataGrid-filterForm': { p: 2 },
                  '& .MuiDataGrid-filterForm:nth-child(even)': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? '#444' : '#f5f5f5',
                  },
                  '& .MuiDataGrid-filterFormLogicOperatorInput': { mr: 2 },
                  '& .MuiDataGrid-filterFormColumnInput': { mr: 2, width: 150 },
                  '& .MuiDataGrid-filterFormOperatorInput': { mr: 2 },
                  '& .MuiDataGrid-filterFormValueInput': { width: 200 },
                },
              },
            }}
          />
        )}
      </div>
    </Box>
  );
}

DataTableOT_P.propTypes = {
  setOtIds: PropTypes.func.isRequired,
};

export default DataTableOT_P;
