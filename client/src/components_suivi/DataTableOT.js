import * as React from 'react';
//import {Button} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';


import axios from 'axios';

// Custom Toolbar with styled buttons
function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton slotProps={{ button: { color: 'secondary' } }} />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export default function DataTableOT({ setOtIds }) {
  const [data, setData] = React.useState({ rows: [], columns: [] });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8800/ot';
        const response = await axios.get(API_URL);
        const result = response.data.data;

        if (Array.isArray(result)) {
          const rows = result.map((row, index) => ({
            id: row.oth_keyu || index, // Ensure unique IDs for each row
            oth_keyu: row.oth_keyu,
            oth_icod: row.oth_icod,
            oth_lib: row.oth_lib,
            exp_lib: row.exp_lib,
          }));

          const columns = [
            { field: 'oth_keyu', headerName: 'ID', width: 100 },
            { field: 'oth_icod', headerName: 'Code Chargement', width: 150 },
            { field: 'oth_lib', headerName: 'Libelle Chargement', flex: 1 },
            { field: 'exp_lib', headerName: 'Expediteur', flex: 1 },
          ];

          setData({ rows, columns });
          setOtIds(result.map((row) => row.oth_keyu));
        } else {
          console.error('Aucune donnée trouvée.');
        }
      } catch (err) {
        console.error(err.response?.data?.message || 'Une erreur est survenue lors de la récupération des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setOtIds]);

  return (
    <div style={{ height: 600, width: '100%' }}>
    <DataGrid
      rows={data.rows}
      columns={data.columns}
      loading={loading}
      slots={{
        toolbar: CustomToolbar, // Use the custom toolbar
      }}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
      }}
      pageSizeOptions={[5, 10, 25, 50]}
    />
  </div>
  );
}


