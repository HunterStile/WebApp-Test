// client/src/components/Marketplace.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import mysteryBoxImage from '../assets/images/mystery-box.png';
import { getEggImage } from '../utils/eggImages';
import axios from 'axios';
import API_BASE_URL from '../config';
import './Game.css';

function Marketplace() {
  const { user, tcBalance, spendTc, fetchTcBalance } = useContext(AuthContext);
  const [result, setResult] = useState('');
  const [eggImage, setEggImage] = useState(null);
  const [boxOpened, setBoxOpened] = useState(false);
  const [eggsForSale, setEggsForSale] = useState([]);
  const [eggsForSaleUser, setEggsForSaleUser] = useState([]);
  const [inventory, setInventory] = useState({});
  const [sellPrice, setSellPrice] = useState('');
  const [sellQuantity, setSellQuantity] = useState({});
  const [selectedEgg, setSelectedEgg] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [eggSales, setEggSales] = useState([]); // Stato per gli articoli in vendita


  useEffect(() => {
    fetchInventory();
    fetchEggsForSale();
    fetchEggsForSaleUser();
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

    const image = getEggImage(eggType); // Usa la funzione per ottenere l'immagine

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
      fetchEggsForSaleUser();
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
        fetchEggsForSaleUser();
        fetchTcBalance(); // Aggiorna il saldo TC
      } catch (error) {
        console.error('Error during purchase:', error);
        alert('Error during purchase');
      }
    }
  };

  // Funzione per rimuovere un uovo dalla vendita
  const handleRemoveEggSale = async (eggType) => {
    try {
      await axios.post(`${API_BASE_URL}/tc/remove-egg-sale`, {
        username: user,
        eggType,
      });
      fetchInventory()
      fetchEggsForSale();
      fetchEggsForSaleUser(); // Aggiorna la lista di uova in vendita
    } catch (error) {
      console.error('Error removing egg sale:', error);
      alert('Error removing egg sale');
    }
  };

  const fetchEggsForSaleUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tc/my-eggs-for-sale`, { params: { username: user } });
      if (Array.isArray(response.data)) {
        setEggsForSaleUser(response.data);
      } else {
        setEggsForSaleUser([]); // Imposta un array vuoto se i dati non sono un array
      }
    } catch (error) {
      console.error('Error fetching eggs for sale:', error);
      setEggsForSaleUser([]); // Imposta un array vuoto in caso di errore
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-purple-400 mb-6">Marketplace</h2>

        {/* Mystery Box Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-cyan-400">Mystery Box</h3>
          <div className="flex flex-col items-center bg-slate-700 rounded-lg p-6">
            {!boxOpened ? (
              <div className="text-center">
                <h4 className="text-lg font-bold mb-4">Open your mystery box now!</h4>
                <div className="w-32 h-32 bg-slate-600 rounded-lg overflow-hidden mb-4">
                  <img
                    src={mysteryBoxImage}
                    alt="Mystery Box"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  onClick={openMysteryBox}
                  className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-lg"
                >
                  Open Mystery Box (50 TC)
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h4 className="text-lg font-bold mb-4">You got a {result}!</h4>
                <div className="w-32 h-32 bg-slate-600 rounded-lg overflow-hidden mb-4">
                  <img
                    src={getEggImage(result)}
                    alt={result}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  onClick={resetBox}
                  className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-lg"
                >
                  Open a new Mystery Box
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sell Eggs Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-green-400">Sell Eggs</h3>
          {Object.keys(inventory).some(eggType => inventory[eggType] > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(inventory)
                .filter(eggType => inventory[eggType] > 0)
                .map((eggType) => (
                  <div key={eggType} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-slate-600 rounded-lg overflow-hidden">
                        <img
                          src={getEggImage(eggType)}
                          alt={eggType}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold">{eggType}</h4>
                        <p className="text-sm text-slate-400">Available: {inventory[eggType]}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={sellQuantity[eggType] || ''}
                        onChange={(e) => setSellQuantity({
                          ...sellQuantity,
                          [eggType]: Math.min(Number(e.target.value), inventory[eggType])
                        })}
                        placeholder="Quantity"
                        max={inventory[eggType]}
                        className="w-full bg-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="number"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        placeholder="Set price"
                        className="w-full bg-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button 
                        onClick={() => handleSellEgg(eggType)}
                        className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              You have no eggs to sell.
            </div>
          )}
        </div>

        {/* Market Listings Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-pink-400">Eggs for Sale</h3>
          {Array.isArray(eggsForSale) && eggsForSale.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eggsForSale.map((egg, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-slate-600 rounded-lg overflow-hidden">
                      <img
                        src={getEggImage(egg.eggType)}
                        alt={egg.eggType}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">{egg.eggType}</h4>
                      <p className="text-sm text-slate-400">Available: {egg.totalQuantity}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="bg-slate-800 p-2 rounded">
                      <span className="text-slate-400">Average Price:</span>
                      <div className="text-yellow-400">
                        {egg.averagePrice ? `${egg.averagePrice.toFixed(2)} TC` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-slate-800 p-2 rounded">
                      <span className="text-slate-400">Floor Price:</span>
                      <div className="text-cyan-400">
                        {egg.floorPrice ? `${egg.floorPrice.toFixed(2)} TC` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenModal(egg)}
                    className="w-full bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg"
                  >
                    Preview
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              No eggs for sale.
            </div>
          )}
        </div>

        {/* My Listings Section */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-orange-400">My Eggs for Sale</h3>
          {Array.isArray(eggsForSaleUser) && eggsForSaleUser.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eggsForSaleUser.map((egg, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-slate-600 rounded-lg overflow-hidden">
                      <img
                        src={getEggImage(egg.eggType)}
                        alt={egg.eggType}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">{egg.eggType}</h4>
                      <p className="text-sm text-slate-400">Listed: {egg.quantity}</p>
                      <p className="text-sm text-cyan-400">Price: {egg.price ? `${egg.price.toFixed(2)} TC` : 'N/A'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveEggSale(egg.eggType)}
                    className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                  >
                    Remove Listing
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              You have no eggs listed for sale.
            </div>
          )}
        </div>

        {/* Purchase Modal */}
        {selectedEgg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-purple-400">Buy Eggs: {selectedEgg.eggType}</h3>
                <button 
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-2 text-cyan-400">Items for Sale:</h4>
                  {eggSales.length > 0 ? (
                    <div className="bg-slate-700 rounded-lg p-4">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left text-slate-400">Price</th>
                            <th className="text-left text-slate-400">Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eggSales
                            .sort((a, b) => a.price - b.price)
                            .map((sale, index) => (
                              <tr key={index}>
                                <td className="py-2">{sale.price.toFixed(2)} TC</td>
                                <td className="py-2">{sale.quantity}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-400">No items for sale.</p>
                  )}
                </div>
                
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="font-bold mb-4 text-green-400">Purchase Details</h4>
                  <div className="w-32 h-32 bg-slate-600 rounded-lg overflow-hidden mx-auto mb-4">
                    <img
                      src={getEggImage(selectedEgg.eggType)}
                      alt={selectedEgg.eggType}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-slate-400 block mb-1">Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedEgg.totalQuantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(selectedEgg.totalQuantity, parseInt(e.target.value))))}
                        className="w-full bg-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg">
                      <span className="text-slate-400">Total Price:</span>
                      <span className="float-right text-yellow-400">
                        {(selectedEgg.floorPrice * quantity).toFixed(2)} TC
                      </span>
                    </div>
                    <button
                      onClick={handleBuy}
                      className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
