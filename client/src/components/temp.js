import React from 'react';
import { ChevronDown } from 'lucide-react';

const BookmakersFilter = ({
  selectedRegular,
  selectedExchange,
  isBookmakersOpen,
  isExchangeOpen,
  setIsBookmakersOpen,
  setIsExchangeOpen,
  handleSelectAllRegular,
  handleSelectAllExchange,
  regularBookmakers,
  exchangeOptions,
  selectedBookmakers,
  regularMapping,
  exchangeMapping,
  handleRegularBookmakerChange,
  handleExchangeChange
}) => {
  return (
    <div className="bookmakers-filter">
      <div className="bookmakers-content">
        {/* Regular Bookmakers Select */}
        <div className="bookmakers-section">
          <h3 className="bookmakers-title">Bookmakers ({selectedRegular.length})</h3>
          <div 
            className="select-all-button"
            onClick={() => setIsBookmakersOpen(!isBookmakersOpen)}
          >
            <label className="bookmaker-checkbox">
              <input
                type="checkbox"
                onChange={handleSelectAllRegular}
                checked={selectedRegular.length === Object.values(regularMapping).length}
              />
              <span>Select/Deselect All</span>
            </label>
            <ChevronDown className={`chevron-icon ${isBookmakersOpen ? 'rotate' : ''}`} />
          </div>
          
          {isBookmakersOpen && (
            <div className="dropdown-menu">
              {regularBookmakers.map((bookmaker, index) => (
                <label key={index} className="bookmaker-checkbox">
                  <input
                    type="checkbox"
                    value={bookmaker}
                    checked={selectedBookmakers.includes(regularMapping[bookmaker])}
                    onChange={handleRegularBookmakerChange}
                  />
                  <span>{bookmaker}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Exchange Select */}
        <div className="bookmakers-section">
          <h3 className="bookmakers-title">Exchange ({selectedExchange.length})</h3>
          <div 
            className="select-all-button"
            onClick={() => setIsExchangeOpen(!isExchangeOpen)}
          >
            <label className="bookmaker-checkbox">
              <input
                type="checkbox"
                onChange={handleSelectAllExchange}
                checked={selectedExchange.length === Object.values(exchangeMapping).length}
              />
              <span>Select/Deselect All</span>
            </label>
            <ChevronDown className={`chevron-icon ${isExchangeOpen ? 'rotate' : ''}`} />
          </div>
          
          {isExchangeOpen && (
            <div className="dropdown-menu">
              {exchangeOptions.map((bookmaker, index) => (
                <label key={index} className="bookmaker-checkbox">
                  <input
                    type="checkbox"
                    value={bookmaker}
                    checked={selectedBookmakers.includes(exchangeMapping[bookmaker])}
                    onChange={handleExchangeChange}
                  />
                  <span>{bookmaker}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmakersFilter;