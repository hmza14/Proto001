import React, { useState } from 'react';
import DataTableOT from './DataTableOT'; // Adjust the import path as needed

const SuiviPage = () => {
  const [otIds, setOtIds] = useState([]);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <DataTableOT setOtIds={setOtIds} />
      </div>
    </div>
  );
};

export default SuiviPage;