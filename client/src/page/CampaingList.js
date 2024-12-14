import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

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

  if (!user) {
    return <p>Devi effettuare il login per vedere le campagne.</p>;
  }

  return (
    <div>
      <h1>Campagne disponibili</h1>
      <ul>
        {campaigns.map((campaign, index) => (
          <li key={index}>
            <a
              href={`${campaign.url}${user}`} // Aggiunge l'username al link della campagna
              target="_blank"
              rel="noopener noreferrer"
            >
              {campaign.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CampaignList;
