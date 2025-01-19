import React, { useContext, useState, useEffect } from 'react';
import { ConversionContext } from '../context/ConversionContext';
import { Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const ConversionList = () => {
  const { conversions, loading, error } = useContext(ConversionContext);
  const [filteredConversions, setFilteredConversions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    campaign_status: '',
    dateRange: ''
  });
  const itemsPerPage = 10;

  useEffect(() => {
    if (!conversions) return;

    const filtered = conversions.filter(conv => {
      const matchesSearch = conv.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.conversion_id.toString().includes(searchTerm);

      const matchesStatus = !filters.status || conv.status === filters.status;
      const matchesType = !filters.type || conv.type === filters.type;
      const matchesCampaignStatus = !filters.campaign_status || conv.campaign_status === filters.campaign_status;

      let matchesDateRange = true;
      if (filters.dateRange) {
        const convDate = new Date(conv.date);
        const today = new Date();
        switch (filters.dateRange) {
          case '7days':
            matchesDateRange = (today - convDate) <= 7 * 24 * 60 * 60 * 1000;
            break;
          case '30days':
            matchesDateRange = (today - convDate) <= 30 * 24 * 60 * 60 * 1000;
            break;
          case '90days':
            matchesDateRange = (today - convDate) <= 90 * 24 * 60 * 60 * 1000;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesCampaignStatus && matchesDateRange;
    });

    setFilteredConversions(filtered);
    setCurrentPage(1);
  }, [filters, searchTerm, conversions]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-600">Loading conversions...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-red-600">Error: {error}</div>
    </div>
  );

  const uniqueTypes = [...new Set(conversions?.map(c => c.type) || [])];
  const uniqueStatuses = [...new Set(conversions?.map(c => c.status) || [])];
  const uniqueCampaignStatuses = [...new Set(conversions?.map(c => c.campaign_status) || [])];

  // Calcola statistiche per le card
  const getTotalCommission = () => {
    return filteredConversions.reduce((sum, conv) => sum + parseFloat(conv.commission), 0).toFixed(2);
  };

  const getStatusCount = (status) => {
    return filteredConversions.filter(conv => conv.status === status).length;
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      type: '',
      campaign_status: '',
      dateRange: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredConversions.length / itemsPerPage);
  const currentConversions = filteredConversions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8 bg-white rounded-xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Conversion Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-600 text-xl text-center mb-2">Total Conversions</h3>
          <p className="text-4xl text-center font-bold">{filteredConversions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-600 text-xl text-center mb-2">Total Commission</h3>
          <p className="text-4xl text-center font-bold">€ {getTotalCommission()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-600 text-xl text-center mb-2">Validated</h3>
          <p className="text-4xl text-center font-bold">{getStatusCount('validated')}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-600 text-xl text-center mb-2">Pending</h3>
          <p className="text-4xl text-center font-bold">{getStatusCount('pending')}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by campaign name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={filters.campaign_status}
              onChange={(e) => setFilters(prev => ({ ...prev, campaign_status: e.target.value }))}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Campaign Statuses</option>
              {uniqueCampaignStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>

            <button
              onClick={() => {
                setFilters({
                  status: '',
                  type: '',
                  campaign_status: '',
                  dateRange: ''
                });
                setSearchTerm('');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-gray-600 font-semibold">Conversion ID</th>
                <th className="p-4 text-left text-gray-600 font-semibold">Campaign Name</th>
                <th className="p-4 text-left text-gray-600 font-semibold">Date</th>
                <th className="p-4 text-left text-gray-600 font-semibold">Type</th>
                <th className="p-4 text-left text-gray-600 font-semibold">Status</th>
                <th className="p-4 text-left text-gray-600 font-semibold">Commission</th>
                <th className="p-4 text-left text-gray-600 font-semibold">Campaign Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredConversions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((conv) => (
                <tr key={conv.conversion_id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-900">{conv.conversion_id}</td>
                  <td className="p-4 text-gray-900">{conv.campaign_name}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(conv.date).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4 text-gray-600">{conv.type}</td>
                  <td className="p-4">
                    <StatusBadge status={conv.status} />
                  </td>
                  <td className="p-4 text-gray-900">€ {parseFloat(conv.commission).toFixed(2)}</td>
                  <td className="p-4 text-gray-600">{conv.campaign_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <div className="text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredConversions.length)} of {filteredConversions.length} entries
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-4 py-2 bg-gray-50 rounded-lg text-gray-600">
              {currentPage} of {Math.ceil(filteredConversions.length / itemsPerPage)}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredConversions.length / itemsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(filteredConversions.length / itemsPerPage)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.ceil(filteredConversions.length / itemsPerPage))}
              disabled={currentPage === Math.ceil(filteredConversions.length / itemsPerPage)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-600';
      case 'validated':
        return 'bg-blue-50 text-blue-600';
      case 'refused':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-yellow-50 text-yellow-600';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle()}`}>
      {status}
    </span>
  );
};

export default ConversionList;