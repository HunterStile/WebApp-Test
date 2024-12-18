import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import axios from 'axios';
import { Copy, Check, X, ArrowRight } from 'lucide-react';

const CampaignTable = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [userRequests, setUserRequests] = useState({
    pending: [],
    approved: [],
    rejected: []
  });
  const [copiedLink, setCopiedLink] = useState(null);
  const [message, setMessage] = useState('');
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
          rejected: response.data.rejectedRequests || []
        });
      } catch (error) {
        console.error('Error fetching requests:', error);
        setMessage('Failed to load requests');
      }
    };

    fetchUserRequests();
  }, [user]);

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

  const getRequestStatus = (campaignName) => {
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
      userRequests.rejected.find(req => req.campaign === campaignName)
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-[#81a1c1] border-b-2 border-[#5e81ac] pb-2">Campaign Management</h1>
      
      {message && (
        <div className={`p-2 mb-4 rounded ${message.includes('Failed') ? 'bg-red-900/20 text-red-300' : 'bg-green-900/20 text-green-300'}`}>
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-[#3b4252] text-[#e1e1e1]">
          <thead>
            <tr className="bg-[#434c5e]">
              <th className="p-3 text-left border border-[#4c566a]">Campaign Name</th>
              <th className="p-3 text-left border border-[#4c566a]">Description</th>
              <th className="p-3 text-left border border-[#4c566a]">Conditions</th>
              <th className="p-3 text-left border border-[#4c566a]">Commission Plan</th>
              <th className="p-3 text-left border border-[#4c566a]">Stato richiesta</th>
              <th className="p-3 text-left border border-[#4c566a]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const status = getRequestStatus(campaign.name);
              const requestDetails = getRequestDetails(campaign.name);

              return (
                <tr key={campaign.name} className="border-b border-[#4c566a] hover:bg-[#4c566a]/30">
                  <td className="p-3 border border-[#4c566a]">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${campaign.status === 'attivo' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{campaign.name}</span>
                    </div>
                  </td>
                  <td className="p-3 border border-[#4c566a]">{campaign.description}</td>
                  <td className="p-3 border border-[#4c566a]">{campaign.conditions}</td>
                  <td className="p-3 border border-[#4c566a]">{campaign.commissionPlan}</td>
                  <td className="p-3 border border-[#4c566a]">
                    {status === 'approved' && campaign.status ==='attivo' && (
                      <span className="px-2 py-1 bg-green-900/30 text-green-300 rounded-full">Approved</span>
                    )}
                    {campaign.status ==='disattivo' && (
                      <span className="px-2 py-1 bg-red-900/30 text-red-300 rounded-full">Campagna Disattivata</span>
                    )}
                    {status === 'pending' && (
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded-full">Pending</span>
                    )}
                    {status === 'rejected' && (
                      <span className="px-2 py-1 bg-red-900/30 text-red-300 rounded-full">Rejected</span>
                    )}
                    {status === 'not_requested' && (
                      <span className="px-2 py-1 bg-gray-900/30 text-gray-300 rounded-full">Not Requested</span>
                    )}
                  </td>
                  <td className="p-3 border border-[#4c566a]">
                    {status === 'approved' && campaign.status==='attivo' && requestDetails.uniqueLink && (
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
                    {status === 'not_requested' && (
                      <button 
                        onClick={() => handleRequestCampaign(campaign.name)}
                        className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded hover:bg-blue-900/60 flex items-center"
                      >
                        Request <ArrowRight className="ml-2 w-4 h-4" />
                      </button>
                    )}
                    {(status === 'pending' || status === 'rejected' || campaign.status==='disattivo') && (
                      <span className="text-gray-400">No Action</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignTable;