const express = require('express');
const router = express.Router();

// Mappa delle campagne con gli URL reali
const campaignUrls = {
  BETANO: 'https://www.gambling-affiliation.com/cpc/v=g5MTrVQ96U0IQlw1NeFO-hIm1W43ZmVn0.gSTfMxo2s_GA7331V2&aff_var_1=',
  ROLLETTO: 'https://www.gambling-affiliation.com/cpc/v=CDv-VvGTatah4ZD6IPtEqcDZjnem9BRZ3z2oz1PDuhg_GA7331V2&aff_var_1=',
  TIKIAKA: 'https://www.gambling-affiliation.com/cpc/v=WD9KR0uuFFaj9029..91PF4Kwbtu9Re0s6ZO6fobNIk_GA7331V2&aff_var_1=',
  CAZEURS: 'https://www.gambling-affiliation.com/cpc/v=Xb75XCL1vA3pLoGQnEc6OtsmD1AFzUlVf2Rm5zd.DwM_GA7331V2&aff_var_1=',
};

// Endpoint per gestire i link fittizi
router.get('/:randomValue', (req, res) => {
  const { randomValue } = req.params; // Valore casuale generato
  const { campaign, user } = req.query; // Nome campagna e username

  // Verifica i parametri obbligatori
  if (!campaign || !user) {
    return res.status(400).send('Parametri mancanti: assicurati che il link contenga campagna e username.');
  }

  // Trova il link reale corrispondente alla campagna
  const realUrl = campaignUrls[campaign];
  if (!realUrl) {
    return res.status(404).send('Campagna non trovata.');
  }

  // Crea il link reale con l'username
  const redirectUrl = `${realUrl}${user}`;

  // Log utile per debugging
  console.log(`Reindirizzamento per campagna "${campaign}" con user "${user}": ${redirectUrl}`);

  // Reindirizza al link reale
  res.redirect(redirectUrl);
});

module.exports = router;