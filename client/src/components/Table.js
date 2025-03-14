import React from 'react';

// Componente Table riutilizzabile
const Table = ({ 
  columns, 
  data, 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  setCurrentPage,
  emptyMessage = "No data available." 
}) => {
  return (
    <div className="bg-secondary-900 rounded-lg overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-800">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="p-4 text-left text-sm text-secondary-400">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-800">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-secondary-800/50">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="p-4">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-secondary-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="p-4 mt-2 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-secondary-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
          </div>
          <div className="flex items-center gap-2">
            <button
              className="bg-secondary-800 hover:bg-secondary-700 px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              First
            </button>
            <button
              className="bg-secondary-800 hover:bg-secondary-700 px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(pageNum => {
                  return (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  );
                })
                .map((pageNum, index, array) => (
                  <React.Fragment key={pageNum}>
                    {index > 0 && array[index - 1] !== pageNum - 1 && (
                      <span className="text-secondary-400">...</span>
                    )}
                    <button
                      className={`px-4 py-2 rounded transition-colors ${pageNum === currentPage
                        ? 'bg-primary-600'
                        : 'bg-secondary-800 hover:bg-secondary-700'
                        }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              className="bg-secondary-800 hover:bg-secondary-700 px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
            <button
              className="bg-secondary-800 hover:bg-secondary-700 px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;