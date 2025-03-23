import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import GenericTable from '../components/common/GenericTable';
import GenericForm from '../components/common/GenericForm';

const ExternalBatches = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get id from URL if editing
  const [externalBatches, setExternalBatches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Table columns configuration
  const columns = [
    { 
      field: 'acceptanceDate', 
      header: 'Data Accettazione',
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('it-IT');
      }
    },
    { field: 'batchNumber', header: 'Numero Lotto' },
    { 
      field: 'ddtDate', 
      header: 'Data DDT',
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('it-IT');
      }
    },
    { field: 'ddtNumber', header: 'Numero DDT' },
    { field: 'origin', header: 'Origine' },
    { 
      field: 'foodDetails.foodName', 
      header: 'Alimento' 
    },
    { 
      field: 'foodDetails.supplier.name', 
      header: 'Fornitore',
      render: (_, item) => {
        return item.foodDetails?.supplier?.name || '-';
      }
    }
  ];

  // Form fields configuration
  const getFormFields = () => [
    {
      name: 'acceptanceDate',
      type: 'date',
      label: 'Data Accettazione',
      required: true,
      fullWidth: false
    },
    {
      name: 'batchNumber',
      type: 'text',
      label: 'Numero Lotto',
      required: true,
      fullWidth: false
    },
    {
      name: 'ddtDate',
      type: 'date',
      label: 'Data DDT',
      required: true,
      fullWidth: false
    },
    {
      name: 'ddtNumber',
      type: 'text',
      label: 'Numero DDT',
      required: true,
      fullWidth: false
    },
    {
      name: 'origin',
      type: 'text',
      label: 'Origine',
      required: true,
      fullWidth: true
    },
    {
      name: 'foodDetails.foodName',
      type: 'text',
      label: 'Nome Alimento',
      required: true,
      fullWidth: true
    },
    {
      name: 'foodDetails.unitOfMeasure',
      type: 'select',
      label: 'Unità di Misura',
      required: true,
      fullWidth: false,
      options: [
        { value: 'kg', label: 'Kilogrammi (kg)' },
        { value: 'g', label: 'Grammi (g)' },
        { value: 'l', label: 'Litri (l)' },
        { value: 'ml', label: 'Millilitri (ml)' },
        { value: 'pz', label: 'Pezzi (pz)' }
      ]
    },
    {
      name: 'foodDetails.quantity',
      type: 'number',
      label: 'Quantità',
      required: true,
      fullWidth: false,
      min: 0,
      step: 0.01
    },
    {
      name: 'foodDetails.expirationDate',
      type: 'date',
      label: 'Data di Scadenza',
      required: true,
      fullWidth: false
    },
    {
      name: 'foodDetails.supplier',
      type: 'select',
      label: 'Fornitore',
      required: true,
      fullWidth: true,
      options: suppliers.map(supplier => ({
        value: supplier._id,
        label: supplier.name
      }))
    }
  ];

  const fetchExternalBatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/external-batches`);
      setExternalBatches(response.data);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento dei lotti esterni. Riprova più tardi.');
      console.error('Error fetching external batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`/api/suppliers`);
      setSuppliers(response.data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  // Fetch a specific batch for editing if ID is provided
  const fetchBatchForEdit = async (batchId) => {
    try {
      const response = await axios.get(`/api/external-batches/${batchId}`);
      setEditingBatch(response.data);
      setIsFormOpen(true);
    } catch (err) {
      setError('Errore nel caricamento del lotto. Riprova più tardi.');
      console.error('Error fetching batch for edit:', err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchExternalBatches();
    
    // If id is provided in the URL, fetch that batch for editing
    if (id) {
      fetchBatchForEdit(id);
    }
  }, [id]);

  const handleAddBatch = () => {
    setEditingBatch(null);
    setIsFormOpen(true);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setIsFormOpen(true);
  };

  const handleViewDetails = (batch) => {
    navigate(`/external-batches/${batch._id}`);
  };

  const handleDeleteBatch = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo lotto esterno?')) {
      try {
        await axios.delete(`/api/external-batches/${id}`);
        setExternalBatches(externalBatches.filter(batch => batch._id !== id));
      } catch (err) {
        setError('Errore nell\'eliminazione del lotto esterno. Riprova più tardi.');
        console.error('Error deleting external batch:', err);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingBatch) {
        // Update existing batch
        const response = await axios.put(`/api/external-batches/${editingBatch._id}`, formData);
        setExternalBatches(externalBatches.map(batch => 
          batch._id === editingBatch._id ? response.data : batch
        ));
        // Clear the edit ID from URL if present
        if (id) {
          navigate('/external-batches');
        }
      } else {
        // Add new batch
        const response = await axios.post(`/api/external-batches`, formData);
        setExternalBatches([response.data, ...externalBatches]);
      }
      setIsFormOpen(false);
      setEditingBatch(null);
    } catch (err) {
      setError('Errore nel salvare il lotto esterno. Riprova più tardi.');
      console.error('Error saving external batch:', err);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBatch(null);
    // Clear the edit ID from URL if present
    if (id) {
      navigate('/external-batches');
    }
  };

  const filteredBatches = externalBatches.filter(batch => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      batch.batchNumber.toLowerCase().includes(searchTermLower) ||
      batch.ddtNumber.toLowerCase().includes(searchTermLower) ||
      batch.origin.toLowerCase().includes(searchTermLower) ||
      batch.foodDetails.foodName.toLowerCase().includes(searchTermLower) ||
      (batch.foodDetails.supplier?.name && 
        batch.foodDetails.supplier.name.toLowerCase().includes(searchTermLower))
    );
  });

  // Custom actions for the table
  const renderActions = (batch) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleViewDetails(batch)}
        className="text-primary-600 hover:text-primary-800 transition-colors"
        title="Visualizza dettagli"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={() => handleEditBatch(batch)}
        className="text-primary-600 hover:text-primary-800 transition-colors"
        title="Modifica"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      <button
        onClick={() => handleDeleteBatch(batch._id)}
        className="text-red-600 hover:text-red-900 transition-colors"
        title="Elimina"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary-800">Gestione Lotti Esterni</h1>
          <button
            onClick={handleAddBatch}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nuovo Lotto Esterno
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
              className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Cerca per numero lotto, numero DDT, origine, alimento o fornitore..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <GenericTable 
            data={filteredBatches}
            columns={columns}
            renderActions={renderActions}
            emptyMessage="Nessun lotto esterno trovato. Aggiungi un nuovo lotto per iniziare."
          />
        )}
      </div>
      
      {isFormOpen && (
        <GenericForm
          title={editingBatch ? 'Modifica Lotto Esterno' : 'Nuovo Lotto Esterno'}
          fields={getFormFields()}
          initialData={editingBatch}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
          submitButtonLabel={editingBatch ? 'Aggiorna' : 'Salva'}
        />
      )}
    </div>
  );
};

export default ExternalBatches; 