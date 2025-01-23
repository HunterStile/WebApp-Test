import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import StatsCard from '../components/ui/StatsCards';
import API_BASE_URL from '../config';
import axios from 'axios';
import {
  Copy,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X
} from 'lucide-react';
import CampaignLogo from '../components/utils/CampaignLogo';
import CountryFlag from '../components/utils/CountryFlag';

const CampaignTable = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    country: '',
    requestStatus: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const [userRequests, setUserRequests] = useState({
    pending: [],
    approved: [],
    deactivated: [],
    rejected: []
  });
  const [copiedLink, setCopiedLink] = useState(null);
  const [message, setMessage] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const { user } = useContext(AuthContext);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/cpc/campaigns`);
        setCampaigns(response.data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setMessage('Failed to load campaigns');
      }
    };

    fetchCampaigns();
  }, []);

  // Fetch user requests
  useEffect(() => {
    const fetchUserRequests = async () => {
      if (!user) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/cpc/user-requests`, {
          params: { username: user }
        });

        setUserRequests({
          pending: response.data.pendingRequests || [],
          approved: response.data.approvedRequests || [],
          deactivated: response.data.deactivatedRequests || [],
          rejected: response.data.rejectedRequests || []
        });
      } catch (error) {
        console.error('Error fetching requests:', error);
        setMessage('Failed to load requests');
      }
    };

    fetchUserRequests();
  }, [user]);

  // Filter logic
  useEffect(() => {
    const filtered = campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.mappedName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !filters.type || campaign.type === filters.type;
      const matchesCountry = !filters.country || campaign.country === filters.country;
      const matchesStatus = !filters.status || campaign.status === filters.status;
      const matchesRequestStatus = !filters.requestStatus || getRequestStatus(campaign.name) === filters.requestStatus;

      return matchesSearch && matchesType && matchesCountry && matchesStatus && matchesRequestStatus;
    });

    setFilteredCampaigns(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, searchTerm, campaigns]);

  const handleRequestCampaign = async (campaignName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cpc/campaign-requests`, {
        campaign: campaignName,
        username: user,
      });

      setUserRequests((prev) => ({
        ...prev,
        pending: [...prev.pending, response.data]
      }));

      setMessage(`Campaign "${campaignName}" request sent`);
    } catch (error) {
      console.error('Request error:', error);
      setMessage('Failed to send request');
    }
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  const toggleRowExpansion = (campaignName) => {
    setExpandedRows(prev => ({
      ...prev,
      [campaignName]: !prev[campaignName]
    }));
  };

  const getRequestStatus = (campaignName) => {
    if (userRequests.deactivated.some(req => req.campaign === campaignName)) {
      return 'deactivated';
    }
    if (userRequests.approved.some(req => req.campaign === campaignName)) {
      return 'approved';
    }
    if (userRequests.pending.some(req => req.campaign === campaignName)) {
      return 'pending';
    }
    if (userRequests.rejected.some(req => req.campaign === campaignName)) {
      return 'rejected';
    }
    return 'not_requested';
  };

  const getRequestDetails = (campaignName) => {
    return (
      userRequests.approved.find(req => req.campaign === campaignName) ||
      userRequests.pending.find(req => req.campaign === campaignName) ||
      userRequests.deactivated.find(req => req.campaign === campaignName) ||
      userRequests.rejected.find(req => req.campaign === campaignName)
    );
  };

  // Extract unique values for filter options
  const uniqueTypes = [...new Set(campaigns.map(c => c.type))];
  const uniqueCountries = [...new Set(campaigns.map(c => c.country))];
  const requestStatuses = ['approved', 'pending', 'rejected', 'not_requested', 'deactivated'];

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      type: '',
      country: '',
      requestStatus: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const currentCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8 bg-white rounded-xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Campaign Management</h1>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-xl ${
          message.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
        }`}>
          {message}
        </div>
      )}

      {/* Stats Cards - Matching Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard 
        title="Total Campaigns" 
        value={campaigns.length} 
      />
      <StatsCard 
        title="Active Campaigns" 
        value={campaigns.filter(c => c.status === 'attivo').length} 
      />
      <StatsCard 
        title="Approved" 
        value={userRequests.approved.length} 
      />
      <StatsCard 
        title="Pending" 
        value={userRequests.pending.length} 
      />
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
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
              value={filters.country}
              onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={filters.requestStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, requestStatus: e.target.value }))}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Request Status</option>
              {requestStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
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
                <th className="p-4 text-left text-gray-600 font-semibold">Brand Logo</th>
                <th className="p-4 text-left text-gray-600 font-semibold">Campaign Name</th>
                <th className="p-4 text-left text-gray-600 font-semibold">Type</th>
                <th className="p-4 text-left text-gray-600 font-semibold">Country</th>
                <th className="p-4 text-left text-gray-600 font-semibold">Commission Plan</th>
                <th className="p-4 text-left text-gray-600 font-semibold">Status</th>
                <th className="p-4 text-left text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentCampaigns.map((campaign) => {
                const status = getRequestStatus(campaign.name);
                const requestDetails = getRequestDetails(campaign.name);
                const isExpanded = expandedRows[campaign.name];

                return (
                  <React.Fragment key={campaign.name}>
                    <tr className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            status !== 'deactivated' && campaign.status === 'attivo' 
                              ? 'bg-green-500' 
                              : 'bg-red-500'
                          }`} />
                          <div className="relative w-16 h-8">
                            <CampaignLogo campaignName={campaign.name} />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-900">{campaign.mappedName || campaign.name}</td>
                      <td className="p-4 text-gray-600 capitalize">{campaign.type}</td>
                      <td className="p-4">
                        <CountryFlag country={campaign.country} />
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => toggleRowExpansion(campaign.name)}
                          className="flex items-center justify-between w-full text-gray-600 hover:text-gray-900"
                        >
                          <span>{campaign.commissionPlan}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={status} campaignStatus={campaign.status} />
                      </td>
                      <td className="p-4">
                        <ActionButton 
                          status={status} 
                          campaign={campaign} 
                          requestDetails={requestDetails}
                          onRequest={handleRequestCampaign}
                          onCopy={copyToClipboard}
                          copiedLink={copiedLink}
                        />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                              <p className="text-gray-600">{campaign.description}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Conditions</h3>
                              <p className="text-gray-600">{campaign.conditions}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <div className="text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} entries
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
              {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
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

// Helper Components
const StatusBadge = ({ status, campaignStatus }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'deactivated':
        return 'bg-red-50 text-red-600';
      case 'approved':
        return campaignStatus === 'attivo' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600';
      case 'pending':
        return campaignStatus === 'attivo' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600';
      case 'rejected':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusText = () => {
    if (status === 'deactivated') return 'Deactivated';
    if (campaignStatus === 'disattivo') return 'Campaign Deactivated';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyles()}`}>
      {getStatusText()}
    </span>
  );
};

const ActionButton = ({ status, campaign, requestDetails, onRequest, onCopy, copiedLink }) => {
  if (status === 'approved' && campaign.status === 'attivo' && requestDetails?.uniqueLink) {
    return (
      <div className="flex items-center space-x-2">
        <a
          href={API_BASE_URL + requestDetails.uniqueLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 hover:underline"
        >
          View Link
        </a>
        <button
          onClick={() => onCopy(API_BASE_URL + requestDetails.uniqueLink)}
          className="text-gray-400 hover:text-gray-600"
        >
          {copiedLink === API_BASE_URL + requestDetails.uniqueLink ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
      </div>
    );
  }

  if (status === 'not_requested' && campaign.status === 'attivo') {
    return (
      <button
        onClick={() => onRequest(campaign.name)}
        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2"
      >
        Request <ArrowRight className="w-4 h-4" />
      </button>
    );
  }

  return <span className="text-gray-400">No Action</span>;
};

export default CampaignTable;