import React, { useContext,useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';

const campaigns = [
  {
    name: 'BETANO',
    url: 'https://www.gambling-affiliation.com/cpc/v=g5MTrVQ96U0IQlw1NeFO-hIm1W43ZmVn0.gSTfMxo2s_GA7331V2&aff_var_1=',
  },
  {
    name: 'ROLLETTO',
    url: 'https://www.gambling-affiliation.com/cpc/v=CDv-VvGTatah4ZD6IPtEqcDZjnem9BRZ3z2oz1PDuhg_GA7331V2&aff_var_1=',
  },
  {
    name: 'TIKIAKA',
    url: 'https://www.gambling-affiliation.com/cpc/v=WD9KR0uuFFaj9029..91PF4Kwbtu9Re0s6ZO6fobNIk_GA7331V2&aff_var_1=',
  },
  {
    name: 'CAZEURS',
    url: 'https://www.gambling-affiliation.com/cpc/v=Xb75XCL1vA3pLoGQnEc6OtsmD1AFzUlVf2Rm5zd.DwM_GA7331V2&aff_var_1=',
  },
];

const CampaignList = () => {
  const { user } = useContext(AuthContext); // Accedi al valore di user dal contesto
  const [copied, setCopied] = useState(null); // Stato per il messaggio di copia

  const generateFakeLink = (campaignName) => {
    const randomValue = Math.random().toString(36).substr(2, 8); // Valore casuale
    return `${API_BASE_URL}/cpc/${randomValue}?campaign=${campaignName}&user=${user}`;
  };

  // Funzione per copiare il link negli appunti
  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    setCopied(link);
    setTimeout(() => setCopied(null), 2000); // Reset messaggio dopo 2 secondi
  };

  return (
    <div className="campaign-list">
      <h1 className="text-xl font-bold mb-4">Campagne disponibili</h1>
      <ul className="space-y-4">
        {campaigns.map((campaign, index) => {
          const fakeLink = generateFakeLink(campaign.name); // Genera il link fittizio
          return (
            <li key={index} className="flex flex-col bg-gray-100 p-4 rounded shadow">
              <span className="font-semibold text-lg">{campaign.name}</span>
              <div className="flex items-center space-x-4 mt-2">
                <input
                  type="text"
                  value={fakeLink}
                  readOnly
                  className="border p-2 w-full bg-gray-200 text-gray-600 rounded"
                />
                <button
                  onClick={() => handleCopy(fakeLink)}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Copia Link
                </button>
              </div>
              {copied === fakeLink && (
                <span className="text-green-500 mt-2">Link copiato negli appunti!</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CampaignList;
