import React from 'react';

// Estrae il nome del brand dalla stringa della campagna
const extractBrandName = (campaignName) => {
  // Prende tutto ciò che viene prima del primo " - "
  const brandName = campaignName.split(' - ')[0];
  return brandName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const importLogo = (campaignName) => {
  try {
    // Usa solo il nome del brand per cercare l'immagine
    const brandName = extractBrandName(campaignName);
    return require(`../../assets/images/campaigns/${brandName}.png`);
  } catch (error) {
    // Se l'immagine non esiste, usa il logo di default
    return require('../../assets/images/campaigns/default-logo.png');
  }
};

const CampaignLogo = ({ campaignName, className = '' }) => {
  return (
      <img
        src={importLogo(campaignName)}
        alt={`${campaignName} logo`}
        className={`w-full h-full object-contain ${className}`}
      />
  );
};

export default CampaignLogo;