import React, { useState, useEffect, useCallback } from 'react';
import ReactModal from 'react-modal';
import axios from 'axios';
import API_BASE_URL from '../config'; // Importa l'URL di base


const bookmakerMapping = {
    'Unibet': 'unibet',
    'LiveScore Bet (EU)': 'livescorebeteu',
    'Marathon Bet': 'marathon_bet',
    '888sport': '888sport',
    'Pinnacle': 'pinnacle',
    'Tipico': 'tipico',
    'Nordic Bet': 'nordicbet',
    'Betsson': 'betsson',
    'Betfair': 'betfair',
    'MyBookie.ag': 'mybookieag',
    'William Hill': 'williamhill',
    'Matchbook': 'matchbook',
    'BetOnline.ag': 'betonlineag',
    'Coolbet': 'coolbet'
};

const bookmakerOptions = Object.keys(bookmakerMapping);

const OddsList = () => {
    const [odds, setOdds] = useState([]);
    const [sports, setSports] = useState([]);
    const [error, setError] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [betAmount, setBetAmount] = useState(100);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedSport, setSelectedSport] = useState('soccer'); // Default sport
    const [selectedBookmakers, setSelectedBookmakers] = useState([]);
    const [cachedOdds, setCachedOdds] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // In the component, add a method to open the modal
    const openModal = (game) => {
        // Prepare modal data with the first bookmaker's H2H market odds
        const h2hMarket = game.bookmakers[0]?.markets.find(market => market.key === 'h2h');
        if (h2hMarket && h2hMarket.outcomes.length === 3) {
            setModalData({
                home_team: game.home_team,
                away_team: game.away_team,
                odds1: h2hMarket.outcomes[0].price,
                oddsX: h2hMarket.outcomes[1].price,
                odds2: h2hMarket.outcomes[2].price
            });
            setModalIsOpen(true);
        }
    };


    const fetchSports = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/odds/sports`);
            setSports(response.data);
        } catch (error) {
            setError('Error fetching sports data');
            console.error('Error fetching sports:', error);
        }
    }, []);

    const fetchOdds = useCallback(async (sportKey) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/odds/upcoming-odds`, {
                params: { sportKey }
            });
            const currentTime = new Date();
            const filteredOdds = response.data.filter(game => {
                const eventTime = new Date(game.commence_time);
                return eventTime > currentTime;
            });
            setCachedOdds(prevState => ({
                ...prevState,
                [sportKey]: filteredOdds
            }));
            setOdds(filteredOdds);
        } catch (error) {
            setError('Error fetching odds data');
            console.error('Error fetching odds:', error);
        }
    }, []);

    useEffect(() => {
        fetchSports(); // Richiama l'API degli sport all'avvio del componente
    }, [fetchSports]);

    useEffect(() => {
        if (cachedOdds[selectedSport]) {
            // Usa i dati già in cache
            setOdds(cachedOdds[selectedSport]);
        } else {
            // Fetch data if not in cache
            fetchOdds(selectedSport);
        }
    }, [selectedSport, cachedOdds, fetchOdds]);

    const getFilteredOdds = () => {
        if (!selectedBookmakers.length) return odds;
        return odds.map(game => ({
            ...game,
            bookmakers: game.bookmakers.filter(bookmaker =>
                selectedBookmakers.includes(bookmakerMapping[bookmaker.title])
            )
        })).filter(game => game.bookmakers.length > 0);
    };

    const filteredOdds = getFilteredOdds();
    const totalPages = Math.ceil(filteredOdds.length / ITEMS_PER_PAGE);

    const getCurrentPageOdds = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredOdds.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };

    const handleBookmakerFilter = (bookmaker) => {
        setSelectedBookmakers(prev =>
            prev.includes(bookmakerMapping[bookmaker])
                ? prev.filter(b => b !== bookmakerMapping[bookmaker])
                : [...prev, bookmakerMapping[bookmaker]]
        );
    };

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return new Intl.DateTimeFormat('default', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        }).format(date);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setModalData(null);
        setBetAmount(100);
    };

    const calculatePunta = (odds1, oddsX, odds2) => {
        const puntaX = (betAmount * odds1) / oddsX;
        const punta2 = (betAmount * odds1) / odds2;
        return { puntaX, punta2 };
    };

    const TotalBetting = (betAmount, puntaX, punta2) => {
        const totalbet = betAmount + puntaX + punta2;
        return totalbet;
    };

    const calculateRating = (profit, totalbet) => {
        const rating = (100 * 100) + (profit / totalbet) * (100 * 100);
        return (rating / 100);
    };

    const calculateProfit = (puntata1, puntataX, puntata2, quota) => {
        const totalBet = puntata1 + puntataX + puntata2;
        return (quota * puntata1) - totalBet;
    };

    const handleAmountChange = (e) => {
        setBetAmount(Number(e.target.value));
    };

    const handleOddsChange = (e, key) => {
        setModalData(prevState => ({
            ...prevState,
            [key]: Number(e.target.value)
        }));
    };


    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-purple-400 mb-4">ODDS TRACKER</h2>

                    {/* Filters Section */}
                    <div className="bg-slate-800 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Sport Selection */}
                            <div className="bg-slate-700 rounded-lg p-3">
                                <h3 className="text-lg font-semibold text-slate-300 mb-2">Sports</h3>
                                <div className="max-h-60 overflow-y-auto">
                                    {sports.map((sport) => (
                                        <div
                                            key={sport.key}
                                            onClick={() => setSelectedSport(sport.key)}
                                            className={`p-2 rounded-md cursor-pointer ${selectedSport === sport.key
                                                ? 'bg-purple-500 text-white'
                                                : 'hover:bg-slate-600'
                                                }`}
                                        >
                                            {sport.title}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bookmakers Filter */}
                            <div className="bg-slate-700 rounded-lg p-3">
                                <h3 className="text-lg font-semibold text-slate-300 mb-2">Bookmakers</h3>
                                <div className="max-h-60 overflow-y-auto">
                                    {bookmakerOptions.map((bookmaker) => (
                                        <div
                                            key={bookmaker}
                                            onClick={() => handleBookmakerFilter(bookmaker)}
                                            className={`p-2 rounded-md cursor-pointer ${selectedBookmakers.includes(bookmakerMapping[bookmaker])
                                                ? 'bg-purple-500 text-white'
                                                : 'hover:bg-slate-600'
                                                }`}
                                        >
                                            {bookmaker}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Search/Additional Filter */}
                            <div className="bg-slate-700 rounded-lg p-3">
                                <h3 className="text-lg font-semibold text-slate-300 mb-2">Search</h3>
                                <input
                                    type="text"
                                    placeholder="Search games..."
                                    className="w-full bg-slate-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Odds Table */}
                    {filteredOdds.length > 0 ? (
                        <div className="bg-slate-800 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-700">
                                        <tr>
                                            <th className="p-4 text-left text-sm text-slate-400">Date</th>
                                            <th className="p-4 text-left text-sm text-slate-400">Match</th>
                                            <th className="p-4 text-left text-sm text-slate-400">Bookmakers</th>
                                            <th className="p-4 text-left text-sm text-slate-400">Odds</th>
                                            <th className="p-4 text-left text-sm text-slate-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {getCurrentPageOdds().map((game, index) => (
                                            <tr key={index} className="hover:bg-slate-700/50">
                                                <td className="p-4 text-sm text-slate-300">
                                                    {formatDate(game.commence_time)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{game.home_team} vs {game.away_team}</span>
                                                        <span className="text-xs text-slate-400">{game.sport_title}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {game.bookmakers.slice(0, 3).map((bookmaker, bIndex) => (
                                                            <span
                                                                key={bIndex}
                                                                className="bg-slate-700 text-xs px-2 py-1 rounded"
                                                            >
                                                                {bookmaker.title}
                                                            </span>
                                                        ))}
                                                        {game.bookmakers.length > 3 && (
                                                            <span className="bg-slate-700 text-xs px-2 py-1 rounded">
                                                                +{game.bookmakers.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex space-x-2">
                                                        {game.bookmakers[0]?.markets.map((market, mIndex) =>
                                                            market.key === 'h2h' && (
                                                                <div key={mIndex} className="flex space-x-1">
                                                                    {market.outcomes.map((outcome, oIndex) => (
                                                                        <span
                                                                            key={oIndex}
                                                                            className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded"
                                                                        >
                                                                            {outcome.price}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        className="bg-purple-500 hover:bg-purple-600 text-white text-sm px-3 py-2 rounded-md"
                                                        onClick={() => openModal(game)}
                                                    >
                                                        Calculate
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {modalData && (
                                <ReactModal
                                    isOpen={modalIsOpen}
                                    onRequestClose={closeModal}
                                    className="modal bg-slate-800 text-white rounded-lg p-6 max-w-md mx-auto mt-20"
                                    overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                                >
                                    <h2 className="text-2xl font-bold mb-4">{modalData.home_team} vs {modalData.away_team}</h2>

                                    <div className="mb-4">
                                        <label className="block text-sm mb-2">Bet Amount</label>
                                        <input
                                            type="number"
                                            value={betAmount}
                                            onChange={handleAmountChange}
                                            className="w-full bg-slate-700 text-white px-3 py-2 rounded-md"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm mb-2">{modalData.home_team} Odds</label>
                                            <input
                                                type="number"
                                                value={modalData.odds1}
                                                onChange={(e) => handleOddsChange(e, 'odds1')}
                                                className="w-full bg-slate-700 text-white px-3 py-2 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-2">Draw Odds</label>
                                            <input
                                                type="number"
                                                value={modalData.oddsX}
                                                onChange={(e) => handleOddsChange(e, 'oddsX')}
                                                className="w-full bg-slate-700 text-white px-3 py-2 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-2">{modalData.away_team} Odds</label>
                                            <input
                                                type="number"
                                                value={modalData.odds2}
                                                onChange={(e) => handleOddsChange(e, 'odds2')}
                                                className="w-full bg-slate-700 text-white px-3 py-2 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    {modalData.odds1 && modalData.oddsX && modalData.odds2 && (
                                        <div>
                                            <h3 className="text-xl font-semibold mb-4">Calculation Results</h3>

                                            {/* Example calculation display */}
                                            <div className="bg-slate-700 p-4 rounded-md">
                                                <p>Total Bet: {TotalBetting(
                                                    betAmount,
                                                    calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).puntaX,
                                                    calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).punta2
                                                )}</p>
                                                <p>Potential Profit: {calculateProfit(
                                                    betAmount,
                                                    calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).puntaX,
                                                    calculatePunta(modalData.odds1, modalData.oddsX, modalData.odds2).punta2,
                                                    modalData.odds1
                                                )}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-2 mt-6">
                                        <button
                                            onClick={closeModal}
                                            className="bg-slate-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </ReactModal>
                            )}


                            {/* Pagination */}
                            <div className="bg-slate-800 p-4 flex justify-between items-center">
                                <div className="text-sm text-slate-400">
                                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOdds.length)} of {filteredOdds.length} matches
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="bg-slate-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="bg-slate-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400">
                            No odds available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OddsList;