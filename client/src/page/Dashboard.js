import React, { useContext, useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ConversionContext } from '../context/ConversionContext';
import { AuthContext } from '../context/AuthContext'; // Importiamo il contesto Auth
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

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { conversions, loading, error } = useContext(ConversionContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalClicks, setTotalClicks] = useState(0);
  const [cplCount, setCplCount] = useState(0);
  const [cpaCount, setCpaCount] = useState(0);

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
  }, []);

  useEffect(() => {
    const cpl = conversions.filter(conv => conv.type === 'cpl').length;
    const cpa = conversions.filter(conv => conv.type === 'cpa').length;
    setCplCount(cpl);
    setCpaCount(cpa);
  }, [conversions]);
  // Calcolo del totale delle commissioni
  const totalCommission = useMemo(() => {
    return conversions
      .filter(conversion => new Date(conversion.date).getFullYear() === selectedYear)
      .reduce((sum, conversion) => {
        return sum + (parseFloat(conversion.commission) || 0);
      }, 0).toFixed(2);
  }, [conversions, selectedYear]);

  // Calcolo delle commissioni per mese con stato
  const monthlyCommissions = useMemo(() => {
    // Genera tutti i mesi dell'anno
    const allMonths = Array.from({ length: 12 }, (_, index) => {
      const monthKey = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
      return {
        month: monthKey,
        monthName: monthNames[index],
        paidCommissions: 0,
        onholdCommissions: 0,
        validatedCommissions: 0
      };
    });

    conversions
      .filter(conversion => new Date(conversion.date).getFullYear() === selectedYear)
      .forEach((conversion) => {
        const date = new Date(conversion.date);
        const monthKey = `${selectedYear}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthIndex = allMonths.findIndex(m => m.month === monthKey);

        if (monthIndex !== -1) {
          if (conversion.status === 'paid') {
            allMonths[monthIndex].paidCommissions += parseFloat(conversion.commission) || 0;
          } else if (conversion.status === 'onhold') {
            allMonths[monthIndex].onholdCommissions += parseFloat(conversion.commission) || 0;
          }
          else if (conversion.status === 'validated') {
            allMonths[monthIndex].validatedCommissions += parseFloat(conversion.commission) || 0;
          }
        }
      });

    return allMonths.map(month => ({
      ...month,
      paidCommissions: Number(month.paidCommissions.toFixed(2)),
      onholdCommissions: Number(month.onholdCommissions.toFixed(2)),
      validatedCommissions: Number(month.validatedCommissions.toFixed(2)),
      paidLabel: 'Pagate',
      onholdLabel: 'In Attesa',
      validatedLabel: 'Convalidate'
    }));
  }, [conversions, selectedYear]);

  // Calcola gli anni disponibili
  const availableYears = useMemo(() => {
    const years = [...new Set(conversions.map(conv => new Date(conv.date).getFullYear()))];
    return years.sort((a, b) => a - b);
  }, [conversions]);

  if (loading) {
    return <div>Caricamento delle conversioni...</div>;
  }

  if (error) {
    return <div>Errore: {error}</div>;
  }

  const totalConversions = cplCount + cpaCount;
  const cplPercentage = totalConversions > 0 ? ((cplCount / totalConversions) * 100).toFixed(2) : 0;
  const cpaPercentage = totalConversions > 0 ? ((cpaCount / totalConversions) * 100).toFixed(2) : 0;

  return (
    <div className="dashboard p-4 bg-gray-900 text-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Dashboard Cliente</h1>

      {/* Messaggio di Benvenuto */}
      {user ? (
        <div className="mb-4">
          <p className="text-lg">Benvenuto, {user}!</p>
          <button
            onClick={logout}
            className="mt-2 bg-red-600 text-white py-1 px-3 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-lg">Non sei loggato. Per favore accedi per visualizzare il tuo dashboard.</p>
        </div>
      )}

      {/* Selettore Anno */}
      <div className="year-selector mb-4 flex items-center">
        <span className="mr-2 text-gray-400">Anno:</span>
        {availableYears.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`
              px-3 py-1 rounded mr-2 
              ${selectedYear === year ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}
            `}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="stat bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold">Totale Commissioni Maturate</h2>
        <p className="text-3xl font-bold text-green-400">€ {totalCommission}</p>
      </div>

      <div className="stat bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold">Totale Clicks</h2>
        <p className="text-3xl font-bold text-green-400">{totalClicks}</p>
      </div>

      <div className="stat bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold">Totale Conversioni CPL</h2>
        <p className="text-3xl font-bold text-green-400">{cplCount}</p>
      </div>

      <div className="stat bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold">Totale Conversioni CPA</h2>
        <p className="text-3xl font-bold text-green-400">{cpaCount}</p>
      </div>

      <div className="stat bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold">Distribuzione Conversioni</h2>
        <p className="text-3xl font-bold text-green-400">CPL: {cplPercentage}%</p>
        <p className="text-3xl font-bold text-green-400">CPA: {cpaPercentage}%</p>
      </div>

      <div className="monthly-chart bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-4">Commissioni Mensili {selectedYear}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyCommissions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="monthName"
              tick={{ fill: 'white' }}
            />
            <YAxis
              label={{ value: '€', angle: -90, position: 'insideLeft', fill: 'white' }}
              tick={{ fill: 'white' }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'paidCommissions') {
                  return [`€ ${value.toFixed(2)}`, 'Pagate'];
                } else if (name === 'onholdCommissions') {
                  return [`€ ${value.toFixed(2)}`, 'In Attesa'];
                } else if (name === 'validatedCommissions') {
                  return [`€ ${value.toFixed(2)}`, 'Convalidate'];
                }
                return [`€ ${value.toFixed(2)}`, name];
              }}
              labelFormatter={(monthName) => monthName}
            />
            <Legend
              formatter={(value) => {
                if (value === 'paidCommissions') {
                  return 'Pagate';
                } else if (value === 'onholdCommissions') {
                  return 'In Attesa';
                } else if (value === 'validatedCommissions') {
                  return 'Convalidate';
                }

                return value;
              }}
            />
            <Bar
              dataKey="paidCommissions"
              fill="#09895e"
              stackId="commissions"
            />
            <Bar
              dataKey="onholdCommissions"
              fill="#F59E0B"
              stackId="commissions"
            />
            <Bar
              dataKey="validatedCommissions"
              fill="#10B981"
              stackId="commissions"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lista Conversioni - opzionale, puoi commentare se non serve */}
      <div className="conversion-list bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Dettaglio Conversioni</h2>
        {conversions.filter(conv => new Date(conv.date).getFullYear() === selectedYear).length > 0 ? (
          <ul className="space-y-2">
            {conversions
              .filter(conv => new Date(conv.date).getFullYear() === selectedYear)
              .sort((a, b) => new Date(b.date) - new Date(a.date)) // Ordina per data, più recente prima
              .slice(0, 5) // Prendi solo le prime 5 conversioni
              .map((conv) => (
                <li
                  key={conv.conversion_id}
                  className={`
              p-2 rounded
              ${conv.status === 'paid' ? 'bg-green-700' :
                      conv.status === 'onhold' ? 'bg-yellow-700' :
                        conv.status === 'validated' ? 'bg-green-400' : 'bg-yellow-70'}
            `}
                >
                  <p><strong>Campagna:</strong> {conv.campaign_name}</p>
                  <p><strong>Data:</strong> {new Date(conv.date).toLocaleDateString()}</p>
                  <p><strong>Commissione:</strong> € {parseFloat(conv.commission).toFixed(2)}</p>
                  <p><strong>Tipo:</strong> {conv.type}</p>
                  <p><strong>Stato:</strong> {conv.status}</p>
                </li>
              ))}
          </ul>
        ) : (
          <p>Nessuna conversione trovata per l'anno {selectedYear}.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;