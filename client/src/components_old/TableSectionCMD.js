import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import axios from 'axios'

function TableSectionCMD() {
  const [rows, setRows] = useState([]); // State to hold table data

  useEffect(() => {
    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        const result = await axios.get("http://localhost:8800/cmd") // Fetch data from the /ot endpoint
        
        setRows(result.data.data); // Update rows with fetched data
        //console.log('Fetched Data:', result.data.data); 
      } catch (err) {
        console.log(err)
      }
    }

    fetchData();
  }, []);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">CMD Table</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Task Code</TableCell>
            <TableCell>Task Label</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Creation Date</TableCell>
            <TableCell>Created By</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(rows) && rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.otl_keyu}>
                <TableCell>{row.otl_keyu}</TableCell>
                <TableCell>{row.otl_code}</TableCell>
                <TableCell>{row.otl_lib}</TableCell>
                <TableCell>{row.otl_stat}</TableCell>
                <TableCell>{new Date(row.otl_crda).toLocaleString()}</TableCell>
                <TableCell>{row.otl_crqi}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                {rows.length === 0 ? 'No data available' : 'Loading...'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Box sx={{ marginTop: 2 }}>
        <Button variant="contained" color="primary" sx={{ marginRight: 1 }}>
          Add Row
        </Button>
        <Button variant="outlined" color="secondary">
          Delete Row
        </Button>
      </Box>
    </Box>
  );
}

export default TableSectionCMD;