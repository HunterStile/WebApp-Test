import React from 'react';

const GenericTable = ({ data, columns, onEdit, onDelete, renderActions, emptyMessage }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="mt-2 text-gray-500">{emptyMessage || 'Nessun dato trovato.'}</p>
      </div>
    );
  }

  // Function to safely get nested object properties
  const getNestedValue = (obj, path) => {
    const keys = path.split('.');
    return keys.reduce((o, key) => (o && o[key] !== undefined) ? o[key] : null, obj);
  };

  // Function to render a cell based on column config
  const renderCell = (item, column) => {
    // Get raw value
    const value = getNestedValue(item, column.field);
    
    // If a custom renderer is provided, use it
    if (column.render) {
      return column.render(value, item);
    }
    
    // Default formatting based on data type
    if (value === null || value === undefined) {
      return '-';
    } else if (value instanceof Date) {
      return value.toLocaleDateString('it-IT');
    } else if (typeof value === 'boolean') {
      return value ? 'Sì' : 'No';
    } else if (column.field.includes('supplier') && value && typeof value === 'object') {
      return value.name || '-';
    }
    
    return value.toString();
  };

  // Check if we need to show the actions column
  const showActions = renderActions || onEdit || onDelete;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th 
                key={column.field} 
                scope="col" 
                className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${column.headerAlign || 'text-left'}`}
              >
                {column.header}
              </th>
            ))}
            {showActions && (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={`${item._id}-${column.field}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {renderCell(item, column)}
                </td>
              ))}
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {renderActions ? (
                    renderActions(item)
                  ) : (
                    <>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GenericTable; 