import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConversionContext } from '../../context/ConversionContext';

const ConversionsPage = () => {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { updateConversions } = useContext(ConversionContext);
  const [updating, setUpdating] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [userCommissions, setUserCommissions] = useState(null);
  const [userList, setUserList] = useState([]);
  const [userListLoading, setUserListLoading] = useState(false);
  const [userListError, setUserListError] = useState(null);
  const [userListCurrentPage, setUserListCurrentPage] = useState(1);
  const [userListTotalPages, setUserListTotalPages] = useState(0);
  const [userListTotal, setUserListTotal] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage] = useState(10);

  // Filters state
  const [userListFilters, setUserListFilters] = useState({
    sortBy: 'username',
    sortOrder: 'asc',
    minValidatedCommissions: '',
    minTotalPayments: '',
    validatedCommissionsSortOrder: 'desc',
    totalPaymentsSortOrder: ''
  });

  // Filters state
  const [filters, setFilters] = useState({
    aff_var: '',
    status: '',
    campaign_name: '',
    type: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });



  const [total, setTotal] = useState(0);

  // Fetch user list for payments
  const fetchUserList = async (page = userListCurrentPage) => {
    setUserListLoading(true);
    setUserListError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/gambling/user-payment-list`, {
        params: {
          page,
          limit: 10,
          ...userListFilters
        }
      });

      setUserList(response.data.users);
      setUserListTotal(response.data.total);
      setUserListTotalPages(response.data.totalPages);
    } catch (err) {
      setUserListError(err.response?.data?.message || "Errore nel recupero degli utenti");
    } finally {
      setUserListLoading(false);
    }
  };

  // Pagination for user list
  const renderUserListPagination = () => {
    const maxVisiblePages = 3;
    let startPage = Math.max(1, userListCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(userListTotalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => {
            setUserListCurrentPage(i);
            fetchUserList(i);
          }}
          className={`px-3 py-1 mx-1 rounded ${userListCurrentPage === i
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          onClick={() => {
            setUserListCurrentPage(userListCurrentPage - 1);
            fetchUserList(userListCurrentPage - 1);
          }}
          disabled={userListCurrentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Precedente
        </button>
        {pages}
        <button
          onClick={() => {
            setUserListCurrentPage(userListCurrentPage + 1);
            fetchUserList(userListCurrentPage + 1);
          }}
          disabled={userListCurrentPage === userListTotalPages}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 flex items-center"
        >
          Successivo
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  };

  // Modify existing user commission section
  const [activeTab, setActiveTab] = useState('list'); // 'search' or 'list'

  // Initial fetch for user list
  useEffect(() => {
    fetchUserList();
  }, []);

  // Fetch conversions
  const fetchConversions = async (page = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const { aff_var, status, campaign_name, type, startDate, endDate } = filters;
      const response = await axios.get(`${API_BASE_URL}/gambling/all-conversions`, {
        params: {
          aff_var,
          status,
          campaign_name,
          type,
          startDate,
          endDate,
          page,
          limit: itemsPerPage
        },
      });

      setConversions(response.data.conversions);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };


  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchConversions(newPage);
  };

  const renderPagination = () => {
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${currentPage === i
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Precedente
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 flex items-center"
        >
          Successivo
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const newCount = await updateConversions();
      alert(`Aggiornamento completato. Nuove conversioni: ${newCount}`);
    } catch (err) {
      alert('Errore durante l\'aggiornamento');
    } finally {
      setUpdating(false);
    }
  };

  // Error handling
  const handleError = (err) => {
    console.error('Errore:', err);
    setError(
      err.response?.data?.message ||
      "Si è verificato un errore nel recupero delle conversioni"
    );
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      aff_var: '',
      status: '',
      campaign_name: '',
      type: '',
      startDate: '',
      endDate: '',
    });
  };

  // Reset to first page when filters change
  const handleFilterSubmit = () => {
    setCurrentPage(1);
    fetchConversions(1);
  };

  // Function to fetch user commissions
  const fetchUserCommissions = async (username) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/gambling/user-commissions/${username}`);
      setUserCommissions(response.data);
    } catch (error) {
      console.error('Errore nel recupero delle commissioni:', error);
      setUserCommissions(null);
    }
  };

  // Function to mark conversions as paid
  const markConversionsPaid = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/gambling/mark-conversions-paid`, {
        username: selectedUser,
        amount: userCommissions.total_validated_commission
      });

      alert(`Pagamento completato per ${selectedUser}. ${response.data.updatedCount} conversioni marcate come pagate.`);

      // Refresh commissions and conversions
      fetchUserCommissions(selectedUser);
      fetchConversions();
    } catch (error) {
      console.error('Errore nel marcare le conversioni:', error);
      alert('Errore nel completare il pagamento');
    }
  };

  // Initial and filter application effects
  useEffect(() => {
    fetchConversions();
  }, []);

  // MAIN PAGE
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestione Conversioni</h1>

      {/* Error Handling */}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg">
          {error}
        </div>
      )}
      {/* AGGIORNA CONVERSIONI */}
      <button
        onClick={handleUpdate}
        disabled={updating}
        className={`
            px-4 py-2 rounded 
            ${updating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}
          `}
      >
        {updating ? 'Aggiornamento...' : 'Aggiorna Conversioni'}
      </button>

      {/* User Commissions Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            Lista Utenti
          </h2>
          <p className="text-gray-600">
            Totale Utenti Filtrati: <span className="font-bold">{userListTotal}</span>
          </p>
        </div>

        <div className="flex space-x-4 mb-4 flex-wrap">
          {/* Username Sort */}
          <div className="flex items-center space-x-2">
            <label className="text-sm">Username</label>
            <select
              value={userListFilters.sortOrder}
              onChange={(e) => setUserListFilters(prev => ({
                ...prev,
                sortOrder: e.target.value
              }))}
              className="p-2 border rounded-lg"
            >
              <option value="">Nessun Ordine</option>
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>

          {/* Validated Commissions Sort */}
          <div className="flex items-center space-x-2">
            <label className="text-sm">Comm. Validate</label>
            <select
              value={userListFilters.validatedCommissionsSortOrder}
              onChange={(e) => setUserListFilters(prev => ({
                ...prev,
                validatedCommissionsSortOrder: e.target.value
              }))}
              className="p-2 border rounded-lg"
            >
              <option value="">Nessun Ordine</option>
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>

          {/* Total Payments Sort */}
          <div className="flex items-center space-x-2">
            <label className="text-sm">Totale Pagamenti</label>
            <select
              value={userListFilters.totalPaymentsSortOrder}
              onChange={(e) => setUserListFilters(prev => ({
                ...prev,
                totalPaymentsSortOrder: e.target.value
              }))}
              className="p-2 border rounded-lg"
            >
              <option value="">Nessun Ordine</option>
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>

          {/* Min Validated Commissions */}
          <input
            type="number"
            placeholder="Min Comm. Validate"
            value={userListFilters.minValidatedCommissions}
            onChange={(e) => setUserListFilters(prev => ({
              ...prev,
              minValidatedCommissions: e.target.value
            }))}
            className="p-2 border rounded-lg"
          />

          {/* Min Total Payments */}
          <input
            type="number"
            placeholder="Min Totale Pagamenti"
            value={userListFilters.minTotalPayments}
            onChange={(e) => setUserListFilters(prev => ({
              ...prev,
              minTotalPayments: e.target.value
            }))}
            className="p-2 border rounded-lg"
          />

          <button
            onClick={() => fetchUserList(1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Applica Filtri
          </button>
        </div>
        {/* Tab navigation */}
        <div className="flex mb-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 ${activeTab === 'search'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'} mr-2 rounded`}
          >
            Cerca Utente
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 ${activeTab === 'list'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'} rounded`}
          >
            Lista Utenti
          </button>
        </div>

        {activeTab === 'search' ? (
          // Existing search functionality
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              placeholder="Inserisci username"
              className="w-full p-2 border rounded-lg"
            />
            <button
              onClick={() => fetchUserCommissions(selectedUser)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Calcola Commissioni
            </button>
          </div>
        ) : (
          // User List Tab
          <div>
            {userListLoading ? (
              <p>Caricamento lista utenti...</p>
            ) : userListError ? (
              <p className="text-red-500">{userListError}</p>
            ) : (
              <>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left">Username</th>
                      <th className="p-3 text-left">Metodo Pagamento</th>
                      <th className="p-3 text-right">Commissioni Validate</th>
                      <th className="p-3 text-right">Totale Pagamenti</th>
                      <th className="p-3 text-center">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((user) => (
                      <tr key={user.username} className="border-b hover:bg-gray-50">
                        <td className="p-3">{user.username}</td>
                        <td className="p-3">{user.paymentMethod ? user.paymentMethod.toUpperCase() : 'N/A'}</td>
                        <td className="p-3 text-right">€{user.totalValidatedCommissions?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-right">€{user.totalPayments?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedUser(user.username);
                              fetchUserCommissions(user.username);
                              setActiveTab('search');
                            }}
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
                          >
                            Dettagli
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {renderUserListPagination()}
              </>
            )}
          </div>
        )}

        {userCommissions && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Dettagli Commissioni</h3>
            <p>Username: {userCommissions.username}</p>
            <p>Metodo di Pagamento: {userCommissions.payment_method.toUpperCase()}</p>
            <p>Indirizzo: {userCommissions.payment_address}</p>
            <p>Commissioni Validate: €{userCommissions.total_validated_commission}</p>
            <p>Numero Conversioni Validate: {userCommissions.validated_conversions_count}</p>

            {userCommissions.total_validated_commission > 0 && (
              <button
                onClick={markConversionsPaid}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                Marca Conversioni come Pagate
              </button>
            )}
          </div>
        )}
      </div>


      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Filtri</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Aff Var */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aff Var</label>
            <input
              type="text"
              name="aff_var"
              value={filters.aff_var}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filtra per Aff Var"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <input
              type="text"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filtra per Status"
            />
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Campagna</label>
            <input
              type="text"
              name="campaign_name"
              value={filters.campaign_name}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filtra per Nome Campagna"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <input
              type="text"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filtra per Tipo"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Inizio</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fine</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={resetFilters}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Resetta Filtri
          </button>
          <button
            onClick={handleFilterSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center"
          >
            <Search className="w-5 h-5 mr-2" /> Applica Filtri
          </button>
        </div>
      </div>

      {/* Conversions Results */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            Risultati Conversioni
          </h2>
          <p className="text-gray-600">
            Totale: <span className="font-bold">{total} conversioni</span>
          </p>
          <p className="text-sm">
            Pagina {currentPage} di {totalPages}
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-4">Caricamento...</div>
        ) : conversions.length === 0 ? (
          <p className="text-gray-500 text-center">Nessuna conversione trovata</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="text-white p-3 text-left">Utente</th>
                    <th className="text-white p-3 text-left">Campagna</th>
                    <th className="text-white p-3 text-left">Status</th>
                    <th className="text-white p-3 text-right">Importo</th>
                    <th className="text-white p-3 text-left">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((conversion, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-black-50 transition"
                    >
                      <td className="p-3">{conversion.aff_var}</td>
                      <td className="p-3">{conversion.campaign_name}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${conversion.status === 'paid'
                            ? 'bg-green-300 text-green-800'
                            : conversion.status === 'validated'
                              ? 'bg-green-100 text-green-800'
                              : conversion.status === 'refused'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          {conversion.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">{conversion.commission}</td>
                      <td className="p-3">{new Date(conversion.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        )}

      </div>
    </div>
  );
};

export default ConversionsPage;