import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import mysteryBoxImage from '../assets/images/mystery-box.png';
import commonEggImage from '../assets/images/common-egg.png';
import uncommonEggImage from '../assets/images/uncommon-egg.png';
import rareEggImage from '../assets/images/rare-egg.png';
import epicEggImage from '../assets/images/epic-egg.png';
import legendaryEggImage from '../assets/images/legendary-egg.png';
import axios from 'axios';
import API_BASE_URL from '../config';

function Marketplace() {
  const { user, tcBalance, spendTc } = useContext(AuthContext);
  const [result, setResult] = useState('');
  const [eggImage, setEggImage] = useState(null);
  const [boxOpened, setBoxOpened] = useState(false);
  const [eggsForSale, setEggsForSale] = useState([]);  // Inizializza come array
  const [inventory, setInventory] = useState({});
  const [sellPrice, setSellPrice] = useState('');
  const [sellQuantity, setSellQuantity] = useState({});

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
      image = commonEggImage;
    } else if (randomValue < 86) {
      eggType = 'Uncommon Egg';
      image = uncommonEggImage;
    } else if (randomValue < 95) {
      eggType = 'Rare Egg';
      image = rareEggImage;
    } else if (randomValue < 99) {
      eggType = 'Epic Egg';
      image = epicEggImage;
    } else {
      eggType = 'Legendary Egg';
      image = legendaryEggImage;
    }

    setResult(eggType);
    setEggImage(image);
    spendTc(50); // Deduct 50 TC using the context function

    try {
      await axios.post(`${API_BASE_URL}/tc/open-box`, { username: user, eggType });
      fetchInventory()
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

  const handleBuyEgg = async (sellerUsername, eggType, price) => {
    try {
      await axios.post(`${API_BASE_URL}/tc/buy-egg`, {
        buyerUsername: user,
        sellerUsername,
        eggType,
        price,
      });
      fetchInventory();
      fetchEggsForSale();
    } catch (error) {
      console.error('Error buying egg:', error);
    }
  };

  return (
    <div>
      <h2>Marketplace</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!boxOpened ? (
          <>
            <h3>Open you mistery box now!</h3>
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
            <button onClick={() => handleBuyEgg(egg.eggType, egg.floorPrice)}>Buy at Floor Price</button>
          </div>
        ))
      ) : (
        <p>No eggs for sale.</p>
      )}
    </div>
  );
}

export default Marketplace;
