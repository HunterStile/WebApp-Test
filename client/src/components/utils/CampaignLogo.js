import React from 'react';

// Importa le immagini dagli assets
const importLogo = (campaignName) => {
  try {
    // Converte il nome della campagna nel formato del file
    const formattedName = campaignName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
      
    // Importa dinamicamente l'immagine
    return require(`../../assets/images/campaigns/${formattedName}.png`);
  } catch (error) {
    // Se l'immagine non esiste, usa il logo di default
    return require('../../assets/images/campaigns/default-logo.png');
  }
};

const CampaignLogo = ({ campaignName, className = '' }) => {
  return (
    <div className="relative w-17 h-8">
      <img
        src={importLogo(campaignName)}
        alt={`${campaignName} logo`}
        className={`w-full h-full object-contain ${className}`}
      />
    </div>
  );
};

export default CampaignLogo;