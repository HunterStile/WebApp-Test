//components/TriplaPuntata.js
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

// Utility function per ottenere il nome leggibile del campionato
const getLeagueName = (leagueKey) => {
    const leagueNames = {
        'soccer_italy_serie_a': 'Serie A',
        'soccer_germany_bundesliga': 'Bundesliga',
        'soccer_france_ligue_one': 'Ligue 1',
        'soccer_england_league1': 'Premier League',
        'soccer_spain_la_liga': 'La Liga'
    };
    return leagueNames[leagueKey] || leagueKey;
};


const bookmakerOptions = Object.keys(bookmakerMapping);

// Max partite per pagina
const ITEMS_PER_PAGE = 10;

const OddsList = () => {
    const [odds, setOdds] = useState([]);
    const [error, setError] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [betAmount, setBetAmount] = useState(100);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedBookmakers, setSelectedBookmakers] = useState([]);
    const [cachedOdds, setCachedOdds] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // In the component, add a method to open the modal
    const openModal = (game) => {
        // Use the best combination from the game
        if (game.bestCombination) {
            setModalData({
                home_team: game.home_team,
                away_team: game.away_team,
                odds1: game.bestCombination.bestOdds1,
                oddsX: game.bestCombination.bestOddsX,
                odds2: game.bestCombination.bestOdds2,
                bookmakers: game.bestCombination.bookmakers
            });
            setModalIsOpen(true);
        }
    };

    const fetchOdds = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/odds/major-leagues`);
            const currentTime = new Date();
            const filteredOdds = response.data.filter(game => {
                const eventTime = new Date(game.commence_time);
                return eventTime > currentTime;
            });

            setOdds(filteredOdds);
            setCachedOdds(filteredOdds); // Ora la cache è un array semplice invece di un oggetto
        } catch (error) {
            setError('Error fetching odds data');
            console.error('Error fetching odds:', error);
        }
    }, []);

    const calculatePunta = (odds1, oddsX, odds2) => {
        const puntaX = (betAmount * odds1) / oddsX;
        const punta2 = (betAmount * odds1) / odds2;
        return { puntaX, punta2 };
    };

    const findBestOddsCombination = (game) => {
        // Collect all H2H markets from different bookmakers
        const h2hMarkets = game.bookmakers
            .map(bookmaker => ({
                bookmaker: bookmaker.title,
                market: bookmaker.markets.find(market => market.key === 'h2h')
            }))
            .filter(item => item.market && item.market.outcomes.length === 3);

        let bestCombination = null;
        let maxRating = 0;

        // Exact rating calculation you specified
        const calculateRating = (profit, totalbet) => {
            const rating = (100 * 100) + (profit / totalbet) * (100 * 100);
            return (rating / 100);
        };

        // Compare all possible combinations of bookmakers
        for (let i = 0; i < h2hMarkets.length; i++) {
            for (let j = i + 1; j < h2hMarkets.length; j++) {
                for (let k = j + 1; k < h2hMarkets.length; k++) {
                    const market1 = h2hMarkets[i].market.outcomes;
                    const market2 = h2hMarkets[j].market.outcomes;
                    const market3 = h2hMarkets[k].market.outcomes;

                    const odds1 = [
                        market1[0].price,
                        market2[0].price,
                        market3[0].price
                    ];
                    const oddsX = [
                        market1[1].price,
                        market2[1].price,
                        market3[1].price
                    ];
                    const odds2 = [
                        market1[2].price,
                        market2[2].price,
                        market3[2].price
                    ];

                    // Find best odds for each market
                    const bestOdds1 = Math.max(...odds1);
                    const bestOddsX = Math.max(...oddsX);
                    const bestOdds2 = Math.max(...odds2);

                    // Calculate betting strategy
                    const betAmount = 100;
                    const puntaX = (betAmount * bestOdds1) / bestOddsX;
                    const punta2 = (betAmount * bestOdds1) / bestOdds2;
                    const totalBet = betAmount + puntaX + punta2;
                    const profit = (bestOdds1 * betAmount) - totalBet;

                    // Calculate rating using your specific formula
                    const rating = calculateRating(profit, totalBet);

                    if (rating > maxRating) {
                        maxRating = rating;
                        bestCombination = {
                            bestOdds1,
                            bestOddsX,
                            bestOdds2,
                            bookmakers: [
                                h2hMarkets[i].bookmaker,
                                h2hMarkets[j].bookmaker,
                                h2hMarkets[k].bookmaker
                            ],
                            rating,
                            totalBet,
                            profit
                        };
                    }
                }
            }
        }

        return bestCombination;
    };

    const getFilteredOdds = () => {
        let filteredGames = [];

        if (!selectedBookmakers.length) {
            filteredGames = odds;
        } else {
            filteredGames = odds.map(game => ({
                ...game,
                bookmakers: game.bookmakers.filter(bookmaker =>
                    selectedBookmakers.includes(bookmakerMapping[bookmaker.title])
                )
            })).filter(game => game.bookmakers.length > 0);
        }

        // Calculate best odds combination for each game
        const oddsWithRating = filteredGames.map(game => {
            const bestCombination = findBestOddsCombination(game);

            return {
                ...game,
                bestCombination
            };
        }).filter(game => game.bestCombination !== null);

        // Sort by rating in descending order
        return oddsWithRating.sort((a, b) => b.bestCombination.rating - a.bestCombination.rating);
    };

    const filteredOdds = getFilteredOdds();

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

    const TotalBetting = (betAmount, puntaX, punta2) => {
        const totalbet = betAmount + puntaX + punta2;
        return totalbet;
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

    useEffect(() => {
        if (cachedOdds.length > 0) {
            setOdds(cachedOdds);
        } else {
            fetchOdds();
        }
    }, [cachedOdds, fetchOdds]);

    // Calcola il totale delle pagine quando filteredOdds cambia
    useEffect(() => {
        setTotalPages(Math.ceil(filteredOdds.length / ITEMS_PER_PAGE));
    }, [filteredOdds]);

    //MAIN PAGE//
    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-purple-400 mb-4">ODDS TRACKER</h2>

                    {/* Filters Section */}
                    <div className="bg-slate-800 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* datat Selection */}
                            <div className="bg-slate-700 rounded-lg p-3">
                                inprohress
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

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}
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
                                            <th className="p-4 text-left text-sm text-slate-400">Rating</th>
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
                                                        <span className="text-sm text-slate-400">{getLeagueName(game.league)}</span>
                                                        <span className="font-medium">{game.home_team} vs {game.away_team}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-400">Best Combination:</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {game.bestCombination.bookmakers.map((bookmaker, bIndex) => (
                                                                <span
                                                                    key={bIndex}
                                                                    className="bg-slate-700 text-xs px-2 py-1 rounded"
                                                                >
                                                                    {bookmaker}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex space-x-2">
                                                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                                                            1: {game.bestCombination.bestOdds1.toFixed(2)}
                                                        </span>
                                                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                                                            X: {game.bestCombination.bestOddsX.toFixed(2)}
                                                        </span>
                                                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                                                            2: {game.bestCombination.bestOdds2.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        className="bg-purple-500 hover:bg-purple-600 text-white text-sm px-3 py-2 rounded-md"
                                                        onClick={() => openModal({
                                                            ...game,
                                                            bestCombination: game.bestCombination
                                                        })}
                                                    >
                                                        Calculate
                                                    </button>
                                                </td>
                                                <td className="p-4 text-sm text-slate-300">
                                                    {game.bestCombination.rating.toFixed(2)}
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
                            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="text-sm text-slate-400">
                                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOdds.length)} of {filteredOdds.length} matches
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(1)}
                                    >
                                        First
                                    </button>
                                    <button
                                        className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(pageNum => {
                                                return (
                                                    pageNum === 1 ||
                                                    pageNum === totalPages ||
                                                    Math.abs(pageNum - currentPage) <= 1
                                                );
                                            })
                                            .map((pageNum, index, array) => (
                                                <React.Fragment key={pageNum}>
                                                    {index > 0 && array[index - 1] !== pageNum - 1 && (
                                                        <span className="text-slate-400">...</span>
                                                    )}
                                                    <button
                                                        className={`px-4 py-2 rounded-lg ${pageNum === currentPage
                                                            ? 'bg-purple-500'
                                                            : 'bg-slate-700 hover:bg-slate-600'
                                                            }`}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                    </div>

                                    <button
                                        className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    >
                                        Next
                                    </button>
                                    <button
                                        className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(totalPages)}
                                    >
                                        Last
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