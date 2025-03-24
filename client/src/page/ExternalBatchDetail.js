import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ExternalBatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext);
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/external-batches/${id}`, {
          params: { userId }
        });
        setBatch(response.data);
        setError(null);
      } catch (err) {
        setError('Errore nel caricamento dei dati del lotto. Riprova più tardi.');
        console.error('Error fetching batch:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id && userId) {
      fetchBatchData();
    }
  }, [id, userId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error || 'Lotto non trovato'}</p>
          </div>
          <button
            onClick={() => navigate('/external-batches')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Torna alla lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary-800">
            Dettaglio Lotto: {batch.batchNumber}
          </h1>
          <button
            onClick={() => navigate('/external-batches')}
            className="text-primary-600 hover:text-primary-800 flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Torna alla lista
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informazioni generali del lotto */}
          <div className="bg-primary-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-primary-700 mb-4 border-b border-primary-100 pb-2">Informazioni Generali</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-primary-600">Numero Lotto</p>
                <p className="text-base">{batch.batchNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600">Data Accettazione</p>
                <p className="text-base">{formatDate(batch.acceptanceDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600">Numero DDT</p>
                <p className="text-base">{batch.ddtNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600">Data DDT</p>
                <p className="text-base">{formatDate(batch.ddtDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600">Origine</p>
                <p className="text-base">{batch.origin}</p>
              </div>
            </div>
          </div>

          {/* Dettagli dell'alimento */}
          <div className="bg-primary-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-primary-700 mb-4 border-b border-primary-100 pb-2">Dettagli Alimento</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-primary-600">Nome Alimento</p>
                <p className="text-base">{batch.foodDetails.foodName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600">Quantità</p>
                <p className="text-base">{batch.foodDetails.quantity} {batch.foodDetails.unitOfMeasure}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600">Data di Scadenza</p>
                <p className="text-base">{formatDate(batch.foodDetails.expirationDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600">Fornitore</p>
                <p className="text-base">{batch.foodDetails.supplier?.name || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metadati e azioni */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <p>Creato il: {formatDate(batch.createdAt)}</p>
              <p>Ultimo aggiornamento: {formatDate(batch.updatedAt)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/external-batches/edit/${batch._id}`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Modifica
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Sei sicuro di voler eliminare questo lotto?')) {
                    axios.delete(`/api/external-batches/${batch._id}`, {
                      params: { userId }
                    })
                      .then(() => navigate('/external-batches'))
                      .catch(err => {
                        console.error('Error deleting batch:', err);
                        setError('Errore nell\'eliminazione del lotto. Riprova più tardi.');
                      });
                  }
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Elimina
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalBatchDetail; 