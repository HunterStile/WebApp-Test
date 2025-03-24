import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Store, 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Layers,
  AlertTriangle 
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user, userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    suppliers: 0,
    customers: 0,
    externalBatches: 0,
    qualityControls: 0,
    recentQualityControls: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/login2');
    } else {
      fetchStats();
    }
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Recupera le statistiche necessarie tramite chiamate API parallele
      const [suppliersRes, customersRes, batchesRes, controlsRes] = await Promise.all([
        axios.get('/api/suppliers', { params: { userId } }),
        axios.get('/api/customers', { params: { userId } }),
        axios.get('/api/external-batches', { params: { userId } }),
        axios.get('/api/quality-controls', { params: { userId } })
      ]);

      // Imposta le statistiche
      setStats({
        suppliers: suppliersRes.data.length,
        customers: customersRes.data.length,
        externalBatches: batchesRes.data.length,
        qualityControls: controlsRes.data.length,
        recentQualityControls: controlsRes.data.slice(0, 3) // Ultimi 3 controlli
      });
      
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento delle statistiche:', err);
      setError('Si è verificato un errore nel caricamento dei dati. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Stat Card Render Helper
  const StatCard = ({ title, value, icon, color, path }) => {
    const Icon = icon;
    return (
      <Link 
        to={path}
        className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-${color}-500 flex flex-col`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
            <Icon size={24} />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <header className="bg-primary-700 text-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold">Benvenuto, {user}!</h1>
        <p className="mt-2 opacity-90">Ecco una panoramica del tuo sistema HACCP</p>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard 
              title="Fornitori" 
              value={stats.suppliers} 
              icon={Store} 
              color="primary" 
              path="/suppliers" 
            />
            <StatCard 
              title="Clienti" 
              value={stats.customers} 
              icon={Users} 
              color="tertiary" 
              path="/customers" 
            />
            <StatCard 
              title="Lotti Esterni" 
              value={stats.externalBatches} 
              icon={Briefcase} 
              color="secondary" 
              path="/external-batches" 
            />
            <StatCard 
              title="Controlli Qualità" 
              value={stats.qualityControls} 
              icon={FileText} 
              color="success" 
              path="/quality-controls" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Overview */}
            <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Ultimi Controlli Qualità</h2>
                <Link to="/quality-controls" className="text-sm text-primary-600 hover:text-primary-800">
                  Vedi tutti
                </Link>
              </div>
              
              {stats.recentQualityControls.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentQualityControls.map(control => (
                    <div 
                      key={control._id} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded border-l-4 border-primary-500 hover:bg-gray-100 transition"
                      onClick={() => navigate(`/quality-controls/${control._id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div>
                        <h3 className="font-medium">{control.protocolNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {control.externalBatch?.batchNumber || 'N/A'} - 
                          {control.externalBatch?.foodDetails?.foodName && ` ${control.externalBatch.foodDetails.foodName}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(control.controlDate).toLocaleDateString('it-IT')}
                        </p>
                        <div className="flex items-center text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            Number(control.nonConformingQuantity) > 0 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {Number(control.nonConformingQuantity) > 0 
                              ? `${control.nonConformingQuantity} non conformi` 
                              : 'Tutto conforme'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>Nessun controllo qualità registrato</p>
                  <Link 
                    to="/quality-controls" 
                    className="mt-2 inline-block text-primary-600 hover:text-primary-800"
                  >
                    Aggiungi il tuo primo controllo
                  </Link>
                </div>
              )}
            </div>

            {/* Summary Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Panoramica Sistema</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-primary-100 text-primary-600 mr-3">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data Oggi</p>
                    <p className="font-medium">{new Date().toLocaleDateString('it-IT')}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-tertiary-100 text-tertiary-600 mr-3">
                    <Layers size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Versione Sistema</p>
                    <p className="font-medium">HACCP 1.0</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-success-100 text-success-600 mr-3">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stato Sistema</p>
                    <p className="font-medium">Attivo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;