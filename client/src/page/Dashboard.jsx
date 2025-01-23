import React, { useState, useMemo, useContext, useEffect } from 'react';
import { ConversionContext } from '../context/ConversionContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config';
import ClicksConversionChart from '../components/charts/Clickconversion';
import CommissionsChart from '../components/charts/CommissionsChart';
import StatsCard from '../components/ui/StatsCards';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState('daily'); // 'monthly', 'yearly', or 'daily'
  const [clicksHistory, setClicksHistory] = useState([]);
  const [clicksLoading, setClicksLoading] = useState(false);
  const [clicksError, setClicksError] = useState(null);
  const [activeChart, setActiveChart] = useState('commissions'); // 'commissions', 'clicks', etc.
  const { theme, toggleTheme } = useTheme(); 

  useEffect(() => {
    const fetchTotalClicks = async () => {
      try {
        let params = {
          username: user,
          viewMode: viewMode
        };
  
        if (viewMode === 'monthly') {
          const endDate = new Date();
          const startDate = new Date();
          startDate.setMonth(endDate.getMonth() - monthRange + 1);
          
          params.startDate = startDate.toISOString();
          params.endDate = endDate.toISOString();
        } else if (viewMode === 'daily') {
          const currentDate = new Date();
          const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          const endOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          );
          
          params.startDate = startOfMonth.toISOString();
          params.endDate = endOfMonth.toISOString();
        }
  
        const response = await axios.get(`${API_BASE_URL}/cpc/total-clicks`, { params });
        setTotalClicks(response.data.totalClicks);
      } catch (error) {
        console.error('Errore nel recupero dei click totali:', error);
      }
    };
  
    fetchTotalClicks();
  }, [user, viewMode, monthRange]);

  useEffect(() => {
    const fetchClicksHistory = async () => {
      setClicksLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/cpc/clicks-history`, {
          params: {
            username: user,
            days: 30 // o 90 oil periodo che preferisci
          }
        });
        setClicksHistory(response.data.clicksHistory);
      } catch (error) {
        console.error('Errore nel recupero della cronologia dei click:', error);
        setClicksError(error.message);
      } finally {
        setClicksLoading(false);
      }
    };

    if (user) {
      fetchClicksHistory();
    }
  }, [user]);

  // First, update the yearFilteredData calculation to consider viewMode
  const yearFilteredData = useMemo(() => {
    const currentDate = new Date();
    let filteredConversions;
  
    if (viewMode === 'yearly') {
      filteredConversions = [...conversions];
    } else if (viewMode === 'daily') {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      filteredConversions = conversions.filter(conv => {
        const convDate = new Date(conv.date);
        return convDate.getMonth() === currentMonth && 
               convDate.getFullYear() === currentYear;
      });
    } else {
      const endDate = currentDate;
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
  }, [conversions, monthRange, viewMode]);

  // Update filteredData calculation
  const filteredData = useMemo(() => {
    const currentDate = new Date();

    if (viewMode === 'yearly') {
      // Per la vista annuale, restituiamo tutti i dati
      return [...conversions];
    } else if (viewMode === 'daily') {
      // Per la vista giornaliera, filtriamo per il mese corrente
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      return conversions.filter(conv => {
        const convDate = new Date(conv.date);
        return convDate.getMonth() === currentMonth &&
          convDate.getFullYear() === currentYear;
      });
    } else {
      // Per la vista mensile, manteniamo il filtro esistente
      const endDate = currentDate;
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - monthRange + 1);

      return conversions.filter(conv => {
        const convDate = new Date(conv.date);
        return convDate >= startDate && convDate <= endDate;
      });
    }
  }, [conversions, monthRange, viewMode]);

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

  // Funzione per generare gli anni mancanti
  const generateMissingYears = (data, minYears = 6) => {
    const currentYear = new Date().getFullYear();
    const firstYear = Math.min(...data.map(item => item.year));
    const years = new Set(data.map(item => item.year));

    // Aggiungi i 5 anni precedenti all'anno corrente
    for (let i = 0; i < minYears; i++) {
      years.add(currentYear - i);
    }

    // Aggiungi tutti gli anni successivi al primo anno di commissione
    for (let year = firstYear; year <= currentYear; year++) {
      years.add(year);
    }

    return Array.from(years).sort((a, b) => a - b).map(year => ({
      year,
      paidCommissions: 0,
      onholdCommissions: 0,
      validatedCommissions: 0
    }));
  };

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

    // Genera gli anni mancanti
    const completeData = generateMissingYears(Object.values(yearlyData));

    // Unisci i dati esistenti con gli anni mancanti
    return completeData.map(yearData => ({
      ...yearData,
      ...yearlyData[yearData.year]
    })).sort((a, b) => a.year - b.year);
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

  const dailyCommissions = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Create array for all days in current month
    const days = new Array(daysInMonth).fill(0).map((_, index) => {
      const day = index + 1;
      return {
        date: new Date(currentYear, currentMonth, day),
        dayLabel: `${day}/${currentMonth + 1}`,
        paidCommissions: 0,
        onholdCommissions: 0,
        validatedCommissions: 0
      };
    });

    // Filter conversions for current month
    const currentMonthConversions = conversions.filter(conversion => {
      const convDate = new Date(conversion.date);
      return convDate.getMonth() === currentMonth &&
        convDate.getFullYear() === currentYear;
    });

    // Populate daily data
    currentMonthConversions.forEach(conversion => {
      const convDate = new Date(conversion.date);
      const dayIndex = convDate.getDate() - 1;
      const commission = parseFloat(conversion.commission) || 0;

      if (conversion.status === 'paid') {
        days[dayIndex].paidCommissions += commission;
      } else if (conversion.status === 'onhold') {
        days[dayIndex].onholdCommissions += commission;
      } else if (conversion.status === 'validated') {
        days[dayIndex].validatedCommissions += commission;
      }
    });

    return days.map(day => ({
      ...day,
      paidCommissions: Number(day.paidCommissions.toFixed(2)),
      onholdCommissions: Number(day.onholdCommissions.toFixed(2)),
      validatedCommissions: Number(day.validatedCommissions.toFixed(2))
    }));
  }, [conversions]);

  // Componente per i tab dei grafici
  const ChartTabs = () => (
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => setActiveChart('commissions')}
        className={`px-4 py-2 rounded-lg transition-colors ${activeChart === 'commissions'
          ? 'bg-light-green text-dark-green'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
      >
        Commissions
      </button>
      <button
        onClick={() => setActiveChart('clicks')}
        className={`px-4 py-2 rounded-lg transition-colors ${activeChart === 'clicks'
          ? 'bg-light-green text-dark-green'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
      >
        Clicks & Conversions
      </button>
    </div>
  );

  // Componente per il contenuto del grafico attivo
  const ActiveChartContent = () => {
    switch (activeChart) {
      case 'commissions':
        return (
          <CommissionsChart
            data={
              viewMode === 'yearly'
                ? yearlyCommissions
                : viewMode === 'daily'
                  ? dailyCommissions
                  : monthlyCommissions
            }
            viewMode={viewMode}
          />
        );
      case 'clicks':
        return clicksLoading ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-gray-500">Loading data...</p>
          </div>
        ) : clicksError ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-red-500">Error: {clicksError}</p>
          </div>
        ) : (
          <ClicksConversionChart
            conversions={filteredData}
            clicksHistory={clicksHistory}
            days={30}
          />
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="p-4">Caricamento...</div>;
  if (error) return <div className="p-4 text-red-500">Errore: {error}</div>;

  // Main Page Content
  return (
    <div className="p-8 bg-white dark:bg-dark-bg text-black dark:text-dark-text rounded-xl transition-colors duration-300">
      {/* Header with Welcome, Logout, and Theme Toggle */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-dark-accent rounded-full" />
          {user && <h1 className="text-xl font-semibold">BENTORNATO, {user}</h1>}
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-gray-100 dark:bg-dark-accent hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          {user && (
            <button 
              onClick={logout} 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              •••
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard 
        title="Total Clicks" 
        value={totalClicks} 
      />
      <StatsCard 
        title="Sign up" 
        value={yearFilteredData.cplCount} 
      />
      <StatsCard 
        title="CPA" 
        value={yearFilteredData.cpaCount} 
      />
      <StatsCard 
        title="Profit" 
        value={`€ ${totalPeriodCommissions}`} 
      />
    </div>

      {/* View Toggle and Period Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'daily'
              ? 'bg-light-green text-dark-green'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'monthly'
              ? 'bg-light-green text-dark-green'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
          >
            Monthly View
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'yearly'
              ? 'bg-light-green text-dark-green'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
          >
            Yearly View
          </button>
        </div>

        {viewMode === 'monthly' && (
          <div className="flex gap-3">
            {monthRangeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setMonthRange(option.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${monthRange === option.value
                  ? 'bg-light-green text-dark-green'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Charts Section with Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Analytics</h2>
          <ChartTabs />
        </div>
        <ActiveChartContent />
      </div>

      {/* Latest Conversions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-6">Latest Commissions</h2>
          {filteredData.length > 0 ? (
            <div className="space-y-4">
              {filteredData
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
                .map((conv) => (
                  <div
                    key={conv.conversion_id}
                    className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{conv.campaign_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(conv.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">€ {parseFloat(conv.commission).toFixed(2)}</p>
                        <span className={`text-sm px-2 py-1 rounded-full ${conv.status === 'paid' ? 'bg-green-100 text-dark-green' :
                          conv.status === 'onhold' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-dark-blue'
                          }`}>
                          {conv.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">No conversions in selected period.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-6">Signup to deposit</h2>
          {/* Placeholder for signup to deposit chart - you'll need to implement this */}
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Signup/Deposit ratio visualization</p>
            <p className="text-sm text-gray-400">({yearFilteredData.cpaPercentage}%)</p>
            <p className="text-sm text-gray-400">({yearFilteredData.cplPercentage}%)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;