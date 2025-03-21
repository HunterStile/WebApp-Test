import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GenericTable from '../components/common/GenericTable';
import GenericForm from '../components/common/GenericForm';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Table columns configuration
  const columns = [
    { field: 'name', header: 'Nome' },
    { field: 'vatId', header: 'Partita IVA' },
    { field: 'address', header: 'Indirizzo' },
    { field: 'phone', header: 'Telefono' }
  ];

  // Form fields configuration
  const formFields = [
    {
      name: 'vatId',
      type: 'text',
      label: 'Partita IVA',
      placeholder: 'Inserisci la partita IVA',
      required: true,
      fullWidth: false,
      validate: (value) => {
        if (!/^[0-9]{11}$/.test(value)) {
          return 'La Partita IVA deve essere di 11 cifre';
        }
        return null;
      }
    },
    {
      name: 'name',
      type: 'text',
      label: 'Nome',
      placeholder: 'Inserisci il nome del fornitore',
      required: true,
      fullWidth: false
    },
    {
      name: 'address',
      type: 'text',
      label: 'Indirizzo',
      placeholder: "Inserisci l'indirizzo",
      required: true,
      fullWidth: true
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefono',
      placeholder: 'Inserisci il numero di telefono',
      required: true,
      fullWidth: false
    }
  ];
  
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/suppliers`);
      setSuppliers(response.data);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento dei fornitori. Riprova più tardi.');
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo fornitore?')) {
      try {
        await axios.delete(`/api/suppliers/${id}`);
        setSuppliers(suppliers.filter(supplier => supplier._id !== id));
      } catch (err) {
        setError('Errore nell\'eliminazione del fornitore. Riprova più tardi.');
        console.error('Error deleting supplier:', err);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingSupplier) {
        // Update existing supplier
        const response = await axios.put(`/api/suppliers/${editingSupplier._id}`, formData);
        setSuppliers(suppliers.map(s => s._id === editingSupplier._id ? response.data : s));
      } else {
        // Add new supplier
        const response = await axios.post(`/api/suppliers`, formData);
        setSuppliers([...suppliers, response.data]);
      }
      setIsFormOpen(false);
      setEditingSupplier(null);
    } catch (err) {
      setError('Errore nel salvare il fornitore. Riprova più tardi.');
      console.error('Error saving supplier:', err);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.vatId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestione Fornitori</h1>
          <button
            onClick={handleAddSupplier}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nuovo Fornitore
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="text"
              className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Cerca per nome o partita IVA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <GenericTable 
            data={filteredSuppliers}
            columns={columns}
            onEdit={handleEditSupplier}
            onDelete={handleDeleteSupplier}
            emptyMessage="Nessun fornitore trovato. Aggiungi un nuovo fornitore per iniziare."
          />
        )}
      </div>
      
      {isFormOpen && (
        <GenericForm
          title={editingSupplier ? 'Modifica Fornitore' : 'Nuovo Fornitore'}
          fields={formFields}
          initialData={editingSupplier}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
          submitButtonLabel={editingSupplier ? 'Aggiorna' : 'Salva'}
        />
      )}
    </div>
  );
};

export default Suppliers; 