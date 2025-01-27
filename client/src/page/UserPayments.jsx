import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';
import FilterSection from '../components/ui/FilterSection';
import PageHeader from '../components/ui/PageHeader';

const UserPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    method: '',
    startDate: '',
    endDate: ''
  });

  // Prepare filter options
  const filterOptions = {
    method: ['BTC', 'PayPal']
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/payments/${user}`);
        console.log('API Response:', response.data); // Aggiungi un log per controllare i dati
        setPayments(Array.isArray(response.data) ? response.data : []); // Garantisci che sia sempre un array
        setFilteredPayments(Array.isArray(response.data) ? response.data : []);
        setPayments(response.data);
        setFilteredPayments(response.data);
      } catch (err) {
        setError('Error fetching payments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, [user]);

  // Filtering logic
  useEffect(() => {
    let result = payments;

    // Search filter
    if (searchTerm) {
      result = result.filter(payment => 
        payment.amount.toString().includes(searchTerm) ||
        payment.currency.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Method filter
    if (filters.method) {
      result = result.filter(payment => payment.method === filters.method);
    }

    // Date range filter
    if (filters.startDate) {
      result = result.filter(payment => 
        new Date(payment.timestamp) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      result = result.filter(payment => 
        new Date(payment.timestamp) <= new Date(filters.endDate)
      );
    }

    setFilteredPayments(result);
  }, [searchTerm, filters, payments]);

  // Calculate total filtered amount
  const totalFilteredAmount = Array.isArray(filteredPayments)
  ? filteredPayments.reduce((total, payment) => total + payment.amount, 0)
  : 0;


  // Filter change handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      method: '',
      startDate: '',
      endDate: ''
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-gray-400 dark:bg-dark-bg dark:text-gray-500">
      Loading...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen text-red-500 dark:bg-dark-bg">
      {error}
    </div>
  );

  return (
    <div className="p-8 bg-white dark:bg-dark-bg rounded-xl">
      <div className="w-full">
      <PageHeader title="Payment History" />

        <FilterSection
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          resetFilters={resetFilters}
          searchPlaceholder="Search payments..."
          filterOptions={filterOptions}
        >
          {/* Additional date range inputs */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-accent rounded-lg bg-white dark:bg-dark-card dark:text-dark-text"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-accent rounded-lg bg-white dark:bg-dark-card dark:text-dark-text"
              />
            </div>
          </div>
        </FilterSection>

        {/* Total amount display */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-dark-accent text-gray-800 dark:text-dark-text font-medium">
          Total Amount: {totalFilteredAmount.toFixed(2)}
        </div>

        {filteredPayments.length === 0 ? (
          <div className="flex items-center justify-center h-[calc(100%-250px)] text-gray-400 dark:text-gray-500 dark:bg-dark-bg">
            No payments found.
          </div>
        ) : (
          <div className="overflow-y-auto h-[calc(100%-250px)] dark:bg-dark-bg">
            {filteredPayments.map((payment) => (
              <div 
                key={payment._id} 
                className="px-4 py-3 border-b border-gray-200 dark:border-dark-accent hover:bg-gray-50 dark:hover:bg-dark-accent"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-800 dark:text-dark-text">
                      {payment.amount} {payment.currency}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(payment.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Payment Method: {payment.method}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPayments;