import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import TableSectionOT from './TableSectionOT';
import TableSectionCMD from './TableSectionCMD';
import KPIHeader from './KPIHeader'; // Import the KPIHeader component
import axios from 'axios';
import { sampleOTData } from './sampleData';

function DemoPageContent({ pathname, dividerPosition, setDividerPosition }) {
  const [cmdRows, setCmdRows] = useState([]);
  const [otAssignments, setOTAssignments] = useState({});
  const [_otIds, setOtIds] = useState([]);  
  const [otRows, setOtRows] = useState([]);

 
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        console.log("Fetching assignments...");
        const response = await axios.get('http://localhost:8800/assignments');
        if (response.data.status === 'success') {
          const assignments = response.data.data;
          console.log("Raw assignments from server:", assignments);
          
          
          const formattedAssignments = {};
          Object.keys(assignments).forEach(key => {
            const numericKey = Number(key);
            console.log(`Processing assignment key ${key} → ${numericKey}`);
            formattedAssignments[numericKey] = assignments[key];
          });
          
          console.log("Processed assignments:", formattedAssignments);
          setOTAssignments(formattedAssignments);
          
          // Update assignment counts for OT rows
          setOtRows(prevRows => {
            if (!prevRows || prevRows.length === 0) return prevRows;
            
            return prevRows.map(row => {
              const otId = row.oth_keyu;
              const assignmentCount = formattedAssignments[otId]?.length || 0;
              console.log(`OT ${otId} has ${assignmentCount} assignments`);
              
              return {
                ...row,
                assignmentCount: assignmentCount > 0 ? assignmentCount : 'Aucune'
              };
            });
          });
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };
  
    fetchAssignments();
  }, []);

  // Add function to synchronize OT data with otRows
  useEffect(() => {
    const syncOTRows = async () => {
      try {
        const response = await axios.get('http://localhost:8800/ot');
        const transformedData = response.data.data.map(row => ({
          id: row.oth_keyu,
          oth_keyu: row.oth_keyu,
          oth_icod: row.oth_icod,
          oth_lib: row.oth_lib,
          exp_lib: row.exp_lib
        }));
        setOtRows(transformedData);
      } catch (error) {
        console.error('Error fetching OT data:', error);
        // If API fails, use sample data
        const sampleData = sampleOTData.map(row => ({
          id: row.oth_keyu,
          oth_keyu: row.oth_keyu,
          oth_icod: row.oth_icod,
          oth_lib: row.oth_lib,
          exp_lib: row.exp_lib
        }));
        setOtRows(sampleData);
      }
    };

    syncOTRows();
  }, []);

  const handleMouseDown = (e) => {
    const startX = e.clientX;
    const startWidth = dividerPosition;

    const handleMouseMove = (e) => {
      const delta = ((e.clientX - startX) / window.innerWidth) * 100;
      setDividerPosition(Math.min(80, Math.max(20, startWidth + delta)));
    };

    const handleMouseUp = () => {
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Handler for assigning commands to an OT
  const handleAssignCMD = (otId, assignedCMDRows) => {
    // Update UI state
    setCmdRows((prevCmdRows) =>
      prevCmdRows.filter((cmd) => !assignedCMDRows.some((assigned) => assigned.otl_keyu === cmd.otl_keyu))
    );

    setOTAssignments((prevAssignments) => ({
      ...prevAssignments,
      [otId]: [...(prevAssignments[otId] || []), ...assignedCMDRows],
    }));
  };

  // Handler for unassigning commands from an OT
  const handleUnassignCMDFromOT = (otId, cmdRow) => {
    // Update UI state for assignments
    setOTAssignments((prevAssignments) => {
      const updatedAssignments = {
        ...prevAssignments,
        [otId]: prevAssignments[otId].filter((cmd) => cmd.otl_keyu !== cmdRow.otl_keyu),
      };
      
      return updatedAssignments;
    });
  
    const updatedCmdRow = {
      ...cmdRow,
      otl_stat: 'NEW' 
    };
    
  
    setCmdRows((prevCmdRows) => [...prevCmdRows, updatedCmdRow]);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        position: 'fixed',
        overflow: 'hidden'
      }}
    >
      {/* Give KPIHeader more room and prevent text truncation */}
      <Box sx={{ 
        minWidth: '100%',
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
        overflow: 'visible' // Allow content to overflow if needed
      }}>
        <KPIHeader />
      </Box>
      
      {/* Main content with split panels */}
      <Box 
        sx={{ 
          display: 'flex',
          width: '100%',
          height: 'calc(100% - 90px)', // Adjust height to account for KPIHeader
          overflow: 'hidden',
          flexGrow: 1
        }}
      >
        <Box 
          sx={{ 
            width: `${dividerPosition}%`,
            height: '100%',
            overflow: 'auto',
            flexShrink: 0,
            flexGrow: 0
          }}
        >
          <TableSectionOT
            otAssignments={otAssignments}
            onUnassignCMD={handleUnassignCMDFromOT}
            setOtIds={setOtIds}
            setOtRows={setOtRows}
          />
        </Box>

        <Box
          sx={{
            width: '10px',
            height: '100%',
            cursor: 'col-resize',
            backgroundColor: 'transparent',
            position: 'relative',
            flexShrink: 0,
            flexGrow: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onMouseDown={handleMouseDown}
        >
          <Box
            sx={{
              width: '2px',
              height: '100%',
              background: 'radial-gradient(circle, black 10%, transparent 10%)',
              backgroundSize: '2px 10px'
            }}
          />
        </Box>

        <Box 
          sx={{ 
            width: `${100 - dividerPosition}%`,
            height: '100%',
            overflow: 'auto',
            flexShrink: 0,
            flexGrow: 0
          }}
        >
          <TableSectionCMD 
            cmdRows={cmdRows} 
            setCmdRows={setCmdRows} 
            onAssignCMD={handleAssignCMD} 
            otRows={otRows}
          />
        </Box>
      </Box>
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
  dividerPosition: PropTypes.number.isRequired,
  setDividerPosition: PropTypes.func.isRequired,
};

export default DemoPageContent;