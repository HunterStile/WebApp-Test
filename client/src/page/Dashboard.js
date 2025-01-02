import React, { useState, useMemo, useContext, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ConversionContext } from '../context/ConversionContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config';

const monthNames = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const monthShortNames = [
  'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
  'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
];

const monthRangeOptions = [
  { value: 6, label: '6 mesi' },
  { value: 12, label: '12 mesi' },
  { value: 18, label: '18 mesi' },
  { value: 24, label: '24 mesi' }
];

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { conversions, loading, error } = useContext(ConversionContext);
  const [monthRange, setMonthRange] = useState(12);
  const [totalClicks, setTotalClicks] = useState(0);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'yearly'

  useEffect(() => {
    const fetchTotalClicks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/cpc/total-clicks`, {
          params: { username: user }
        });
        setTotalClicks(response.data.totalClicks);
      } catch (error) {
        console.error('Errore nel recupero dei click totali:', error);
      }
    };
    fetchTotalClicks();
  }, [user]);

  // First, update the yearFilteredData calculation to consider viewMode
  const yearFilteredData = useMemo(() => {
    // Per la vista annuale, prendiamo tutti i dati
    let filteredConversions;
    if (viewMode === 'yearly') {
      filteredConversions = [...conversions]; // Tutti i dati
    } else {
      // Per la vista mensile, manteniamo il filtro esistente
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - monthRange + 1);

      filteredConversions = conversions.filter(conv => {
        const convDate = new Date(conv.date);
        return convDate >= startDate && convDate <= endDate;
      });
    }

    const cplCount = filteredConversions.filter(conv => conv.type === 'cpl').length;
    const cpaCount = filteredConversions.filter(conv => conv.type === 'cpa').length;
    const totalConversions = cplCount + cpaCount;

    return {
      cplCount,
      cpaCount,
      totalConversions,
      cplPercentage: totalConversions > 0 ? ((cplCount / totalConversions) * 100).toFixed(2) : 0,
      cpaPercentage: totalConversions > 0 ? ((cpaCount / totalConversions) * 100).toFixed(2) : 0,
    };
  }, [conversions, monthRange, viewMode]); // Aggiunto viewMode alle dipendenze

  // Update filteredData calculation
  const filteredData = useMemo(() => {
    if (viewMode === 'yearly') {
      // Per la vista annuale, restituiamo tutti i dati
      return [...conversions];
    } else {
      // Per la vista mensile, manteniamo il filtro esistente
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - monthRange + 1);

      return conversions.filter(conv => {
        const convDate = new Date(conv.date);
        return convDate >= startDate && convDate <= endDate;
      });
    }
  }, [conversions, monthRange, viewMode]); // Aggiunto viewMode alle dipendenze

  // Update totalPeriodCommissions calculation
  const totalPeriodCommissions = useMemo(() => {
    if (viewMode === 'yearly') {
      // Per la vista annuale, sommiamo tutte le commissioni
      return conversions.reduce((sum, conv) => sum + (parseFloat(conv.commission) || 0), 0).toFixed(2);
    } else {
      // Per la vista mensile, manteniamo il calcolo esistente
      return filteredData.reduce((sum, conv) => sum + (parseFloat(conv.commission) || 0), 0).toFixed(2);
    }
  }, [conversions, filteredData, viewMode]); // Aggiunto viewMode e conversions alle dipendenze

  const yearlyCommissions = useMemo(() => {
    const yearlyData = {};

    conversions.forEach(conversion => {
      const year = new Date(conversion.date).getFullYear();
      if (!yearlyData[year]) {
        yearlyData[year] = {
          year,
          paidCommissions: 0,
          onholdCommissions: 0,
          validatedCommissions: 0
        };
      }

      const commission = parseFloat(conversion.commission) || 0;
      if (conversion.status === 'paid') {
        yearlyData[year].paidCommissions += commission;
      } else if (conversion.status === 'onhold') {
        yearlyData[year].onholdCommissions += commission;
      } else if (conversion.status === 'validated') {
        yearlyData[year].validatedCommissions += commission;
      }
    });

    return Object.values(yearlyData)
      .map(data => ({
        ...data,
        paidCommissions: Number(data.paidCommissions.toFixed(2)),
        onholdCommissions: Number(data.onholdCommissions.toFixed(2)),
        validatedCommissions: Number(data.validatedCommissions.toFixed(2))
      }))
      .sort((a, b) => a.year - b.year);
  }, [conversions]);

  const monthlyCommissions = useMemo(() => {
    const months = new Array(monthRange).fill(0).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (monthRange - 1) + index);
      return {
        monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        monthName: monthShortNames[date.getMonth()],
        year: date.getFullYear(),
        paidCommissions: 0,
        onholdCommissions: 0,
        validatedCommissions: 0
      };
    });

    filteredData.forEach(conversion => {
      const date = new Date(conversion.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthIndex = months.findIndex(m => m.monthKey === monthKey);

      if (monthIndex !== -1) {
        if (conversion.status === 'paid') {
          months[monthIndex].paidCommissions += parseFloat(conversion.commission) || 0;
        } else if (conversion.status === 'onhold') {
          months[monthIndex].onholdCommissions += parseFloat(conversion.commission) || 0;
        } else if (conversion.status === 'validated') {
          months[monthIndex].validatedCommissions += parseFloat(conversion.commission) || 0;
        }
      }
    });

    return months.map(month => ({
      ...month,
      monthLabel: `${month.monthName} ${month.year}`,
      paidCommissions: Number(month.paidCommissions.toFixed(2)),
      onholdCommissions: Number(month.onholdCommissions.toFixed(2)),
      validatedCommissions: Number(month.validatedCommissions.toFixed(2))
    }));
  }, [filteredData, monthRange]);

  const renderChart = () => {
    const data = viewMode === 'yearly' ? yearlyCommissions : monthlyCommissions;
    const xDataKey = viewMode === 'yearly' ? 'year' : 'monthLabel';

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey={xDataKey}
            tick={{ fill: 'white' }}
            angle={viewMode === 'yearly' ? 0 : -45}
            textAnchor={viewMode === 'yearly' ? 'middle' : 'end'}
            height={viewMode === 'yearly' ? 30 : 70}
          />
          <YAxis
            tick={{ fill: 'white' }}
            label={{ value: '€', angle: -90, position: 'insideLeft', fill: 'white' }}
          />
          <Tooltip
            formatter={(value, name) => [
              `€ ${value}`,
              name === 'paidCommissions' ? 'Pagate' :
                name === 'onholdCommissions' ? 'In Attesa' : 'Convalidate'
            ]}
            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend
            formatter={(value) =>
              value === 'paidCommissions' ? 'Pagate' :
                value === 'onholdCommissions' ? 'In Attesa' : 'Convalidate'
            }
          />
          <Bar dataKey="paidCommissions" stackId="a" fill="#09895e" />
          <Bar dataKey="onholdCommissions" stackId="a" fill="#F59E0B" />
          <Bar dataKey="validatedCommissions" stackId="a" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) return <div className="p-4">Caricamento...</div>;
  if (error) return <div className="p-4 text-red-500">Errore: {error}</div>;

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      {/* Header con Welcome e Logout */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Cliente</h1>
          {user && <p className="text-lg mt-2">Benvenuto, {user}!</p>}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-lg">
            Totale Periodo: <span className="font-bold text-green-400">€ {totalPeriodCommissions}</span>
          </span>
          {user && (
            <button onClick={logout} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
              Logout
            </button>
          )}
        </div>
      </div>

      {/* View Toggle Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded transition-colors ${viewMode === 'monthly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            Vista Mensile
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-4 py-2 rounded transition-colors ${viewMode === 'yearly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            Vista Annuale
          </button>
        </div>
      </div>

      {/* Filtri Periodo (solo per vista mensile) */}
      {viewMode === 'monthly' && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Visualizza:</span>
            {monthRangeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setMonthRange(option.value)}
                className={`px-3 py-1 rounded transition-colors ${monthRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Totale Click</h3>
          <p className="text-2xl font-bold text-green-400">{totalClicks}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">CPL</h3>
          <p className="text-2xl font-bold text-green-400">{yearFilteredData.cplCount}</p>
          <p className="text-sm text-gray-400">({yearFilteredData.cplPercentage}%)</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">CPA</h3>
          <p className="text-2xl font-bold text-green-400">{yearFilteredData.cpaCount}</p>
          <p className="text-sm text-gray-400">({yearFilteredData.cpaPercentage}%)</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Totale Conversioni</h3>
          <p className="text-2xl font-bold text-green-400">{yearFilteredData.totalConversions}</p>
        </div>
      </div>

      {/* Grafico */}
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {viewMode === 'yearly' ? 'Andamento Annuale Commissioni' : 'Andamento Mensile Commissioni'}
        </h2>
        <div className="h-96">
          {renderChart()}
        </div>
      </div>

      {/* Lista Conversioni */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Ultime Conversioni</h2>
        {filteredData.length > 0 ? (
          <div className="space-y-2">
            {filteredData
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 5)
              .map((conv) => (
                <div
                  key={conv.conversion_id}
                  className={`p-3 rounded ${conv.status === 'paid' ? 'bg-green-700' :
                    conv.status === 'onhold' ? 'bg-yellow-700' :
                      conv.status === 'validated' ? 'bg-green-400' : 'bg-gray-700'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{conv.campaign_name}</p>
                      <p className="text-sm text-gray-300">
                        {new Date(conv.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">€ {parseFloat(conv.commission).toFixed(2)}</p>
                      <p className="text-sm text-gray-300">{conv.type.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p>Nessuna conversione nel periodo selezionato.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;