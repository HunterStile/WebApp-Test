import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-[#81a1c1] border-b-2 border-[#5e81ac] pb-2">Campaign Management</h1>

      {message && (
        <div className={`p-2 mb-4 rounded ${message.includes('Failed') ? 'bg-red-900/20 text-red-300' : 'bg-green-900/20 text-green-300'}`}>
          {message}
        </div>
      )}
      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between bg-[#3b4252] p-4 rounded-lg">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#4c566a] rounded-md text-[#e1e1e1] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#81a1c1]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-4">
            {/* Type Filter */}
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

            {/* Country Filter */}
            <select
              value={filters.country}
              onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
              className="px-4 py-2 bg-[#4c566a] rounded-md text-[#e1e1e1] focus:outline-none focus:ring-2 focus:ring-[#81a1c1]"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            {/* Request Status Filter */}
            <select
              value={filters.requestStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, requestStatus: e.target.value }))}
              className="px-4 py-2 bg-[#4c566a] rounded-md text-[#e1e1e1] focus:outline-none focus:ring-2 focus:ring-[#81a1c1]"
            >
              <option value="">All Request Status</option>
              {requestStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {/* Reset Filters Button */}
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
        <table className="w-full table-fixed border-collapse bg-[#3b4252] text-[#e1e1e1]">
          <colgroup>
            <col className="w-1/4" />
            <col className="w-1/6" />
            <col className="w-1/6" />
            <col className="w-1/7" />
            <col className="w-1/6" />
            <col className="w-1/6" />
            <col className="w-1/6" />
          </colgroup>
          <thead>
            <tr className="bg-[#434c5e]">
              <th className="p-3 text-left border border-[#4c566a]">Brand Logo</th>
              <th className="p-3 text-left border border-[#4c566a]">Campaign Name</th>
              <th className="p-3 text-left border border-[#4c566a]">Type</th>
              <th className="p-3 text-left border border-[#4c566a]">Country</th>
              <th className="p-3 text-left border border-[#4c566a]">Commission Plan</th>
              <th className="p-3 text-left border border-[#4c566a]">Stato richiesta</th>
              <th className="p-3 text-left border border-[#4c566a]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCampaigns.map((campaign) => {
              const status = getRequestStatus(campaign.name);
              const requestDetails = getRequestDetails(campaign.name);
              const isExpanded = expandedRows[campaign.name];

              return (
                <React.Fragment key={campaign.name}>
                  <tr className="border-b border-[#4c566a] hover:bg-[#4c566a]/30">
                    <td className="p-3 border border-[#4c566a]">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${status != 'deactivated' && campaign.status === 'attivo' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <CampaignLogo campaignName={campaign.name} />
                      </div>
                    </td>
                    <td className="p-3 border border-[#4c566a]">
                      <div className="flex items-center space-x-2">
                        <span className="truncate">{campaign.mappedName || campaign.name} </span>
                      </div>
                    </td>
                    <td className="p-3 border border-[#4c566a]">
                      <span className="capitalize truncate">{campaign.type}</span>
                    </td>
                    <td className="p-3 border border-[#4c566a]">
                      <div className="flex items-center space-x-2">
                        <CountryFlag country={campaign.country} />
                      </div>
                    </td>
                    <td className="p-3 border border-[#4c566a] cursor-pointer hover:bg-[#4c566a]" onClick={() => toggleRowExpansion(campaign.name)}>
                      <div className="flex items-center justify-between">
                        <span className="truncate">{campaign.commissionPlan}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                      </div>
                    </td>
                    <td className="p-3 border border-[#4c566a]">
                      <div className="truncate">
                        {status === 'deactivated' && (
                          <span className="px-2 py-1 bg-red-900/30 text-red-300 rounded-full">Disattivata</span>
                        )}
                        {campaign.status === 'disattivo' && (
                          <span className="px-2 py-1 bg-red-900/30 text-red-300 rounded-full">Campagna Disattivata</span>
                        )}
                        {status === 'approved' && campaign.status === 'attivo' && (
                          <span className="px-2 py-1 bg-green-900/30 text-green-300 rounded-full">Approved</span>
                        )}
                        {status === 'pending' && campaign.status === 'attivo' && (
                          <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded-full">Pending</span>
                        )}
                        {status === 'rejected' && (
                          <span className="px-2 py-1 bg-red-900/30 text-red-300 rounded-full">Rejected</span>
                        )}
                        {status === 'not_requested' && campaign.status === 'attivo' && (
                          <span className="px-2 py-1 bg-gray-900/30 text-gray-300 rounded-full">Not Requested</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border border-[#4c566a]">
                      <div className="truncate">
                        {status === 'approved' && campaign.status === 'attivo' && requestDetails.uniqueLink && (
                          <div className="flex items-center space-x-2">
                            <a
                              href={API_BASE_URL + requestDetails.uniqueLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              View Link
                            </a>
                            <button
                              onClick={() => copyToClipboard(API_BASE_URL + requestDetails.uniqueLink)}
                              className="text-gray-400 hover:text-gray-200"
                            >
                              {copiedLink === API_BASE_URL + requestDetails.uniqueLink ? (
                                <Check className="w-5 h-5 text-green-300" />
                              ) : (
                                <Copy className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        )}
                        {status === 'not_requested' && campaign.status === 'attivo' && (
                          <button
                            onClick={() => handleRequestCampaign(campaign.name)}
                            className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded hover:bg-blue-900/60 flex items-center"
                          >
                            Request <ArrowRight className="ml-2 w-4 h-4" />
                          </button>
                        )}
                        {(status === 'pending' || status === 'rejected' || campaign.status === 'disattivo' || status === 'deactivated') && (
                          <span className="text-gray-400">No Action</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-[#2e3440]">
                      <td colSpan="7" className="p-4 border border-[#4c566a]">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold text-[#88c0d0] mb-2">Description</h3>
                            <p>{campaign.description}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#88c0d0] mb-2">Conditions</h3>
                            <p>{campaign.conditions}</p>
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
      {/* Pagination Controls */}
      <div className="flex items-center justify-between bg-[#3b4252] p-4 rounded-lg">
          <div className="text-[#e1e1e1]">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} entries
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

export default CampaignTable;