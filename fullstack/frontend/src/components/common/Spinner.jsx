import React from 'react';

/**
 * Componente Spinner para mostrar un indicador de carga
 * @returns {JSX.Element} Componente Spinner
 */
const Spinner = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default Spinner;
