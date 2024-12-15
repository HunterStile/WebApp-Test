import React, { useContext, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ConversionContext } from '../context/ConversionContext';

const monthNames = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const monthShortNames = [
  'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 
  'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
];

const Dashboard = () => {
  const { conversions, loading, error } = useContext(ConversionContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
    const allMonths = Array.from({length: 12}, (_, index) => {
      const monthKey = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
      return {
        month: monthKey,
        monthName: monthNames[index],
        paidCommissions: 0,
        onholdCommissions: 0
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
        }
      });

    return allMonths.map(month => ({
      ...month,
      paidCommissions: Number(month.paidCommissions.toFixed(2)),
      onholdCommissions: Number(month.onholdCommissions.toFixed(2))
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

  return (
    <div className="dashboard p-4 bg-gray-900 text-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Dashboard Cliente</h1>
      
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

      <div className="monthly-chart bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-4">Commissioni Mensili {selectedYear}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyCommissions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="monthName" 
              tick={{fill: 'white'}}
            />
            <YAxis 
              label={{ value: '€', angle: -90, position: 'insideLeft', fill: 'white' }} 
              tick={{fill: 'white'}}
            />
            <Tooltip 
              formatter={(value) => [`€ ${value.toFixed(2)}`, 'Commissioni']}
              labelFormatter={(monthName) => monthName}
            />
            <Legend />
            <Bar 
              dataKey="paidCommissions" 
              fill="#10B981" 
              stackId="commissions"
            />
            <Bar 
              dataKey="onholdCommissions"
              fill="#F59E0B"
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
              .map((conv) => (
              <li 
                key={conv.conversion_id} 
                className={`
                  p-2 rounded
                  ${conv.status === 'paid' ? 'bg-green-700' : 
                    conv.status === 'onhold' ? 'bg-yellow-700' : 'bg-gray-600'}
                `}
              >
                <p><strong>Campagna:</strong> {conv.campaign_name}</p>
                <p><strong>Data:</strong> {new Date(conv.date).toLocaleDateString()}</p>
                <p><strong>Commissione:</strong> € {parseFloat(conv.commission).toFixed(2)}</p>
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