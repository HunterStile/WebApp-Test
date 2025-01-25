import React, { useContext, useState, useEffect } from 'react';
import { ConversionContext } from '../context/ConversionContext';
import StatsCard from '../components/ui/StatsCards';
import PageHeader from '../components/ui/PageHeader';
import FilterSection from '../components/ui/FilterSection';
import PaginationControl from '../components/ui/PaginationControl';

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
      <PageHeader title="Conversion Management" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <StatsCard
          title="Total Conversions"
          value={filteredConversions.length}
        />
        <StatsCard
          title="Total Commission"
          value={getTotalCommission()}
        />
        <StatsCard
          title="Validated"
          value={getStatusCount('validated')}
        />
        <StatsCard
          title="Pending"
          value={getStatusCount('onhold')}
        />
        <StatsCard
          title="Paid"
          value={getStatusCount('paid')}
        />
        <StatsCard
          title="Refused"
          value={getStatusCount('refused')}
        />
      </div>


      {/* Filters Section */}
      <FilterSection
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filters={filters}
        onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
        resetFilters={resetFilters}
        searchPlaceholder="Search by campaign name or ID..."
        filterOptions={{
          type: uniqueTypes,
          status: uniqueStatuses,
          campaign_status: uniqueCampaignStatuses,
          dateRange: ['7days', '30days', '90days']
        }}
      />

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
        <PaginationControl
          currentPage={currentPage}
          totalPages={Math.ceil(filteredConversions.length / itemsPerPage)}
          totalItems={filteredConversions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
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