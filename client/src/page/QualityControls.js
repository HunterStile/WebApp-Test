import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GenericTable from '../components/common/GenericTable';
import GenericForm from '../components/common/GenericForm';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const QualityControls = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [qualityControls, setQualityControls] = useState([]);
  const [externalBatches, setExternalBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingControl, setEditingControl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Table columns configuration
  const columns = [
    { 
      field: 'controlDate', 
      header: 'Data Controllo',
      render: (value, rowData) => {
        console.log("Data render params:", { value, rowData });
        if (!value) return 'N/A';
        try {
            // Make sure we're handling the date correctly
            return format(new Date(value), 'dd/MM/yyyy', { locale: it });
          } catch (error) {
            console.error('Invalid date format:', value);
            return 'Data invalida';
          }
        }
    },
    { field: 'protocolNumber', header: 'Numero Protocollo' },
    { 
      field: 'externalBatch', 
      header: 'Lotto Esterno',
      render: (value, rowData) => {
        console.log("Render params:", { value, rowData });
        
        // Se il valore è direttamente l'oggetto externalBatch
        if (!value) return 'N/A';
        
        // Se è un ID stringa
        if (typeof value === 'string') {
          return (
            <span 
              className="text-primary-600 cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/external-batches/${value}`);
              }}
            >
              {value} (ID)
            </span>
          );
        }
        
        // Se è un oggetto ma senza foodDetails
        if (!value.foodDetails) {
          return (
            <span 
              className="text-primary-600 cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/external-batches/${value._id}`);
              }}
            >
              {value.batchNumber || 'N/A'}
            </span>
          );
        }
        
        // Se è un oggetto completo
        return (
          <span 
            className="text-primary-600 cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/external-batches/${value._id}`);
            }}
          >
            {value.foodDetails?.foodName || 'N/A'} - {value.batchNumber || 'N/A'}
          </span>
        );
      }
    },
    { field: 'checkedQuantity', header: 'Quantità Controllata' },
    { field: 'nonConformingQuantity', header: 'Quantità Non Conforme' },
    { field: 'dimensions', header: 'Dimensioni/Calibrazione' }
  ];

  // Funzione per caricare i lotti esterni
  const fetchExternalBatches = async () => {
    try {
      const response = await axios.get(`/api/external-batches`, {
        params: { userId }
      });
      setExternalBatches(response.data);
    } catch (err) {
      console.error('Error fetching external batches:', err);
      setError('Errore nel caricamento dei lotti esterni. Riprova più tardi.');
    }
  };
  
  // Funzione per caricare i controlli qualità
  const fetchQualityControls = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/quality-controls`, {
        params: { userId }
      });
      setQualityControls(response.data);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento dei controlli. Riprova più tardi.');
      console.error('Error fetching quality controls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchExternalBatches();
      fetchQualityControls();
    }
  }, [userId]);
  
  // Form fields configuration
  const getFormFields = () => [
    {
      name: 'controlDate',
      type: 'date',
      label: 'Data Controllo',
      required: true,
      fullWidth: false
    },
    {
      name: 'protocolNumber',
      type: 'text',
      label: 'Numero Protocollo',
      placeholder: 'Inserisci il numero di protocollo',
      required: true,
      fullWidth: false
    },
    {
      name: 'externalBatch',
      type: 'select',
      label: 'Lotto Esterno',
      options: externalBatches.map(batch => ({
        value: batch._id,
        label: `${batch.batchNumber} - ${batch.foodDetails.foodName} (${batch.foodDetails.quantity} ${batch.foodDetails.unitOfMeasure})`
      })),
      required: true,
      fullWidth: false
    },
    {
      name: 'checkedQuantity',
      type: 'number',
      label: 'Quantità Controllata',
      placeholder: 'Inserisci la quantità controllata',
      required: true,
      fullWidth: false,
      min: 0
    },
    {
      name: 'nonConformingQuantity',
      type: 'number',
      label: 'Quantità Non Conforme',
      placeholder: 'Inserisci la quantità non conforme',
      required: true,
      fullWidth: false,
      min: 0,
    },
    {
      name: 'dimensions',
      type: 'text',
      label: 'Dimensioni/Calibrazione',
      placeholder: 'Inserisci dimensioni o calibrazione',
      required: false,
      fullWidth: true
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Note',
      placeholder: 'Inserisci eventuali note',
      required: false,
      fullWidth: true
    }
  ];

  const handleAddControl = () => {
    setEditingControl(null);
    setIsFormOpen(true);
  };

  const handleEditControl = (control) => {
    setEditingControl(control);
    setIsFormOpen(true);
  };

  const handleViewDetails = (control) => {
    navigate(`/quality-controls/${control._id}`);
  };

  const handleDeleteControl = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo controllo?')) {
      try {
        await axios.delete(`/api/quality-controls/${id}`, {
          params: { userId }
        });
        setQualityControls(qualityControls.filter(control => control._id !== id));
      } catch (err) {
        setError('Errore nell\'eliminazione del controllo. Riprova più tardi.');
        console.error('Error deleting quality control:', err);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Aggiungi l'userId al formData
      const controlData = {
        ...formData,
        userId
      };

      if (editingControl) {
        // Update existing control
        const response = await axios.put(`/api/quality-controls/${editingControl._id}`, controlData);
        setQualityControls(qualityControls.map(c => c._id === editingControl._id ? response.data : c));
      } else {
        // Add new control
        const response = await axios.post(`/api/quality-controls`, controlData);
        setQualityControls([...qualityControls, response.data]);
      }
      setIsFormOpen(false);
      setEditingControl(null);
    } catch (err) {
      setError('Errore nel salvare il controllo. Riprova più tardi.');
      console.error('Error saving quality control:', err);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingControl(null);
  };

  const filteredControls = qualityControls.filter(control =>
    control.protocolNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (control.externalBatch && (
      (control.externalBatch.batchNumber && 
       control.externalBatch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (control.externalBatch.foodDetails?.foodName && 
       control.externalBatch.foodDetails.foodName.toLowerCase().includes(searchTerm.toLowerCase()))
    ))
  );

  // Preparazione dei dati iniziali per il form di modifica
  const prepareInitialData = (control) => {
    if (!control) return null;
    
    try {
      return {
        ...control,
        controlDate: control.controlDate ? format(new Date(control.controlDate), 'yyyy-MM-dd') : '',
        externalBatch: control.externalBatch?._id || control.externalBatch
      };
    } catch (error) {
      console.error('Error preparing date:', error);
      return {
        ...control,
        controlDate: '',
        externalBatch: control.externalBatch?._id || control.externalBatch
      };
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary-800">Gestione Controlli Qualità</h1>
          <button
            onClick={handleAddControl}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nuovo Controllo
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
              placeholder="Cerca per numero protocollo o numero lotto..."
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
            data={filteredControls}
            columns={columns}
            onEdit={handleEditControl}
            onDelete={handleDeleteControl}
            onView={handleViewDetails}
            emptyMessage="Nessun controllo qualità trovato. Aggiungi un nuovo controllo per iniziare."
          />
        )}
      </div>
      
      {isFormOpen && (
        <GenericForm
          title={editingControl ? 'Modifica Controllo' : 'Nuovo Controllo'}
          fields={getFormFields()}
          initialData={prepareInitialData(editingControl)}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
          submitButtonLabel={editingControl ? 'Aggiorna' : 'Salva'}
        />
      )}
    </div>
  );
};

export default QualityControls; 