import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import axios from 'axios'

function TableSectionOT() {
  const [rows, setRows] = useState([]); // State to hold table data

  useEffect(() => {
    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        const result = await axios.get("http://localhost:8800/ot") // Fetch data from the /ot endpoint
        
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
      <Typography variant="h6">OT Table</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Activity Code</TableCell>
            <TableCell>Export Code</TableCell>
            <TableCell>Order Label</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Creation Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.oth_keyu}>
              <TableCell>{row.oth_keyu}</TableCell>
              <TableCell>{row.act_code}</TableCell>
              <TableCell>{row.exp_code}</TableCell>
              <TableCell>{row.oth_lib}</TableCell>
              <TableCell>{row.oth_stat}</TableCell>
              <TableCell>{new Date(row.oth_crda).toLocaleString()}</TableCell>
            </TableRow>
          ))}
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

export default TableSectionOT;
