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
      <div className="text-[#81a1c1]">Caricamento conversioni...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-red-400">Errore: {error}</div>
    </div>
  );

  const uniqueTypes = [...new Set(conversions?.map(c => c.type) || [])];
  const uniqueStatuses = [...new Set(conversions?.map(c => c.status) || [])];
  const uniqueCampaignStatuses = [...new Set(conversions?.map(c => c.campaign_status) || [])];

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-[#81a1c1] border-b-2 border-[#5e81ac] pb-2">
        Conversion Management
      </h1>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between bg-[#3b4252] p-4 rounded-lg">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by campaign name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#4c566a] rounded-md text-[#e1e1e1] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#81a1c1]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-2 bg-[#4c566a] rounded-md text-[#e1e1e1] focus:outline-none focus:ring-2 focus:ring-[#81a1c1]"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 bg-[#4c566a] rounded-md text-[#e1e1e1] focus:outline-none focus:ring-2 focus:ring-[#81a1c1]"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={filters.campaign_status}
              onChange={(e) => setFilters(prev => ({ ...prev, campaign_status: e.target.value }))}
              className="px-4 py-2 bg-[#4c566a] rounded-md text-[#e1e1e1] focus:outline-none focus:ring-2 focus:ring-[#81a1c1]"
            >
              <option value="">All Campaign Statuses</option>
              {uniqueCampaignStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-4 py-2 bg-[#4c566a] rounded-md text-[#e1e1e1] focus:outline-none focus:ring-2 focus:ring-[#81a1c1]"
            >
              <option value="">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-[#4c566a] rounded-md text-[#e1e1e1] hover:bg-[#434c5e]"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-[#3b4252] text-[#e1e1e1]">
          <thead>
            <tr className="bg-[#434c5e]">
              <th className="p-3 text-left border border-[#4c566a]">ID Conversione</th>
              <th className="p-3 text-left border border-[#4c566a]">Nome Campagna</th>
              <th className="p-3 text-left border border-[#4c566a]">Data</th>
              <th className="p-3 text-left border border-[#4c566a]">Tipo</th>
              <th className="p-3 text-left border border-[#4c566a]">Stato</th>
              <th className="p-3 text-left border border-[#4c566a]">Commissione</th>
              <th className="p-3 text-left border border-[#4c566a]">Stato Campagna</th>
            </tr>
          </thead>
          <tbody>
            {currentConversions.map((conv) => (
              <tr key={conv.conversion_id || conv._id} className="border-b border-[#4c566a] hover:bg-[#4c566a]/30">
                <td className="p-3 border border-[#4c566a]">{conv.conversion_id}</td>
                <td className="p-3 border border-[#4c566a]">{conv.campaign_name}</td>
                <td className="p-3 border border-[#4c566a]">
                  {new Date(conv.date).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </td>
                <td className="p-3 border border-[#4c566a]">{conv.type}</td>
                <td className="p-3 border border-[#4c566a]">
                  <span className={`px-2 py-1 rounded-full text-xs
                    ${conv.status === 'paid' ? 'bg-green-900/30 text-green-300' :
                      conv.status === 'validated' ? 'bg-blue-900/30 text-blue-300' :
                        conv.status === 'refused' ? 'bg-red-900/30 text-red-300' :
                          'bg-yellow-900/30 text-yellow-300'}`}
                  >
                    {conv.status}
                  </span>
                </td>
                <td className="p-3 border border-[#4c566a]">{conv.commission}</td>
                <td className="p-3 border border-[#4c566a]">{conv.campaign_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between bg-[#3b4252] p-4 rounded-lg mt-4">
        <div className="text-[#e1e1e1]">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredConversions.length)} of {filteredConversions.length} entries
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 bg-[#4c566a] rounded-md text-[#e1e1e1] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#434c5e]"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-[#4c566a] rounded-md text-[#e1e1e1] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#434c5e]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-4 py-2 bg-[#4c566a] rounded-md text-[#e1e1e1]">
            {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 bg-[#4c566a] rounded-md text-[#e1e1e1] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#434c5e]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 bg-[#4c566a] rounded-md text-[#e1e1e1] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#434c5e]"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionList;