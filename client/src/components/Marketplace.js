// client/src/components/Marketplace.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import mysteryBoxImage from '../assets/images/mystery-box.png';
import commonEggImage from '../assets/images/egg/common-egg.png';
import uncommonEggImage from '../assets/images/egg/uncommon-egg.png';
import rareEggImage from '../assets/images/egg/rare-egg.png';
import epicEggImage from '../assets/images/egg/epic-egg.png';
import legendaryEggImage from '../assets/images/egg/legendary-egg.png';
import axios from 'axios';
import API_BASE_URL from '../config';

function Marketplace() {
  const { user, tcBalance, spendTc, fetchTcBalance } = useContext(AuthContext);
  const [result, setResult] = useState('');
  const [eggImage, setEggImage] = useState(null);
  const [boxOpened, setBoxOpened] = useState(false);
  const [eggsForSale, setEggsForSale] = useState([]);
  const [inventory, setInventory] = useState({});
  const [sellPrice, setSellPrice] = useState('');
  const [sellQuantity, setSellQuantity] = useState({});
  const [selectedEgg, setSelectedEgg] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [eggSales, setEggSales] = useState([]); // Stato per gli articoli in vendita

  const eggImages = {
    'Common Egg': commonEggImage,
    'Uncommon Egg': uncommonEggImage,
    'Rare Egg': rareEggImage,
    'Epic Egg': epicEggImage,
    'Legendary Egg': legendaryEggImage,
  };

  useEffect(() => {
    fetchInventory();
    fetchEggsForSale();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tc/eggs`, { params: { username: user } });
      setInventory(response.data.eggs);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchEggsForSale = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tc/eggs-for-sale`);
      if (Array.isArray(response.data)) {
        setEggsForSale(response.data);
      } else {
        setEggsForSale([]);  // Imposta un array vuoto se i dati non sono un array
      }
    } catch (error) {
      console.error('Error fetching eggs for sale:', error);
      setEggsForSale([]);  // Imposta un array vuoto in caso di errore
    }
  };

  const fetchEggSales = async (eggType) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tc/egg-sales`, { params: { eggType } });
      if (Array.isArray(response.data)) {
        setEggSales(response.data);
      } else {
        setEggSales([]);  // Imposta un array vuoto se i dati non sono un array
      }
    } catch (error) {
      console.error('Error fetching egg sales:', error);
      setEggSales([]);  // Imposta un array vuoto in caso di errore
    }
  };

  const openMysteryBox = async () => {
    if (tcBalance < 50) {
      alert('Insufficient TC balance');
      return;
    }

    const randomValue = Math.random() * 100;
    let eggType = '';
    let image = null;

    if (randomValue < 60) {
      eggType = 'Common Egg';
    } else if (randomValue < 86) {
      eggType = 'Uncommon Egg';
    } else if (randomValue < 95) {
      eggType = 'Rare Egg';
    } else if (randomValue < 99) {
      eggType = 'Epic Egg';
    } else {
      eggType = 'Legendary Egg';
    }

    image = eggImages[eggType]; // Usa la mappatura per ottenere l'immagine

    setResult(eggType);
    setEggImage(image);
    spendTc(50); // Deduct 50 TC using the context function

    try {
      await axios.post(`${API_BASE_URL}/tc/open-box`, { username: user, eggType });
      fetchInventory();
    } catch (error) {
      console.error('Error saving egg:', error);
    }

    setBoxOpened(true);
  };

  const resetBox = () => {
    setResult('');
    setEggImage(null);
    setBoxOpened(false);
  };

  const handleSellEgg = async (eggType) => {
    if (!sellQuantity[eggType] || sellQuantity[eggType] <= 0) {
      alert('Please set a valid quantity to sell');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/tc/sell-egg`, {
        username: user,
        eggType,
        price: sellPrice,
        quantity: sellQuantity[eggType], // Aggiungi la quantità
      });
      fetchInventory();
      fetchEggsForSale();
      setSellPrice('');
      setSellQuantity({ ...sellQuantity, [eggType]: 0 }); // Reset quantità
    } catch (error) {
      console.error('Error selling egg:', error);
    }
  };

  // Funzione per aprire la modale
  const handleOpenModal = async (egg) => {
    setSelectedEgg(egg);
    setEggImage(getEggImage(egg.eggType));
    setQuantity(1);  // Imposta la quantità a 1 di default
    document.querySelector('.modal').classList.add('open');
    await fetchEggSales(egg.eggType); // Recupera gli articoli in vendita per l'egg selezionato
  };

  // Funzione per chiudere la modale
  const handleCloseModal = () => {
    document.querySelector('.modal').classList.remove('open');
    setSelectedEgg(null);
  };

  // Funzione per gestire l'acquisto dalla modale
  const handleBuy = async () => {
    if (selectedEgg && quantity > 0) {
      // Calcola il costo totale
      const totalCost = selectedEgg.floorPrice * quantity;

      // Verifica se l'utente ha abbastanza TC
      if (tcBalance < totalCost) {
        alert('Insufficient TC balance');
        return;
      }

      // Procedi con l'acquisto
      try {
        await axios.post(`${API_BASE_URL}/tc/buy-egg`, {
          username: user,
          eggType: selectedEgg.eggType,
          price: selectedEgg.floorPrice,
          quantity,
        });

        // Chiudi la modale e aggiorna i dati
        handleCloseModal();
        fetchInventory();
        fetchEggsForSale();
        fetchTcBalance(); // Aggiorna il saldo TC
      } catch (error) {
        console.error('Error during purchase:', error);
        alert('Error during purchase');
      }
    }
  };

  const getEggImage = (eggType) => eggImages[eggType] || null;

  return (
    <div>
      <h2>Marketplace</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!boxOpened ? (
          <>
            <h3>Open your mystery box now!</h3>
            <img src={mysteryBoxImage} alt="Mystery Box" style={{ width: '200px', height: '200px' }} />
            <button onClick={openMysteryBox}>Open Mystery Box (50 TC)</button>
          </>
        ) : (
          <>
            <h3>You got a {result}!</h3>
            {eggImage && <img src={eggImage} alt={result} style={{ width: '200px', height: '200px' }} />}
            <button onClick={resetBox}>Open a new Mystery Box</button>
          </>
        )}
      </div>

      <h3>Sell Eggs</h3>
      {Object.keys(inventory).some(eggType => inventory[eggType] > 0) ? (
        Object.keys(inventory)
          .filter(eggType => inventory[eggType] > 0)
          .map((eggType) => (
            <div key={eggType}>
              <span>{eggType} (x{inventory[eggType]})</span>
              <input
                type="number"
                value={sellQuantity[eggType] || ''}
                onChange={(e) =>
                  setSellQuantity({ ...sellQuantity, [eggType]: Math.min(Number(e.target.value), inventory[eggType]) })
                }
                placeholder="Quantity"
                max={inventory[eggType]} // Imposta il massimo
              />
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="Set price"
              />
              <button onClick={() => handleSellEgg(eggType)}>Sell</button>
            </div>
          ))
      ) : (
        <p>You have no eggs to sell.</p>
      )}

      <h3>Eggs for Sale</h3>
      {Array.isArray(eggsForSale) && eggsForSale.length > 0 ? (
        eggsForSale.map((egg, index) => (
          <div key={index}>
            <span>{egg.eggType}</span>
            <span> - {egg.totalQuantity} available</span>
            <span> - Average Price: {egg.averagePrice ? egg.averagePrice.toFixed(2) : 'N/A'} TC</span>
            <span> - Floor Price: {egg.floorPrice ? egg.floorPrice.toFixed(2) : 'N/A'} TC</span>
            <button onClick={() => handleOpenModal(egg)}>Anteprima</button>
          </div>
        ))
      ) : (
        <p>No eggs for sale.</p>
      )}

      {/* Modale */}
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={handleCloseModal}>&times;</span>
          {selectedEgg && (
            <div>
              <h3>Compra Uova di tipo: {selectedEgg.eggType}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '60%' }}>
                  <h4>Items for Sale:</h4>
                  {eggSales.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Price</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eggSales
                          .sort((a, b) => a.price - b.price) // Ordina per prezzo
                          .map((sale, index) => (
                            <tr key={index}>
                              <td>{sale.price.toFixed(2)} TC</td>
                              <td>{sale.quantity}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No items for sale.</p>
                  )}
                </div>
                <div style={{ width: '30%' }}>
                  <h4>Selected Egg Details:</h4>
                  {eggImage && (
                    <img src={eggImage} alt={selectedEgg.eggType} style={{ width: '50px', height: '50px' }} />
                  )}
                  <div>
                    <label>Quantity: </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedEgg.totalQuantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(selectedEgg.totalQuantity, parseInt(e.target.value))))}
                    />
                  </div>
                  <div>
                    <label>Price: </label>
                    <span>{(selectedEgg.floorPrice * quantity).toFixed(2)} TC</span>
                  </div>
                  <button onClick={handleBuy}>Buy</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Marketplace;
