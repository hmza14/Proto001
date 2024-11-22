import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import TableSectionOT from './TableSectionOT';
import TableSectionCMD from './TableSectionCMD';

function DemoPageContent({ pathname, dividerPosition, setDividerPosition }) {
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

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', height: '100%' }}>
      <div style={{ flex: `0 0 ${dividerPosition}%`, overflow: 'auto' }}>
        <TableSectionOT />
        
      </div>

      <div
        style={{
          flex: '0 0 10px',
          position: 'relative',
          cursor: 'col-resize',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          style={{
            width: '2px',
            height: '100%',
            background: 'radial-gradient(circle, black 10%, transparent 10%)',
            backgroundSize: '2px 10px',
          }}
        />
      </div>

      <div style={{ flex: `0 0 ${100 - dividerPosition}%`, overflow: 'auto' }}>
        <TableSectionCMD />
      </div>
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
  dividerPosition: PropTypes.number.isRequired,
  setDividerPosition: PropTypes.func.isRequired,
};

export default DemoPageContent;
