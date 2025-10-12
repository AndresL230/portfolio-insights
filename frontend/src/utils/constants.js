/**
 * Application constants
 */

export const COMPANY_NAMES = {
  'AAPL': 'Apple Inc.',
  'TSLA': 'Tesla Inc.',
  'MSFT': 'Microsoft Corp.',
  'JPM': 'JPMorgan Chase',
  'NVDA': 'NVIDIA Corp.',
  'GOOGL': 'Alphabet Inc.'
};

export const STOCK_NOTES = {
  'AAPL': 'Long-term hold',
  'TSLA': 'High volatility',
  'MSFT': 'Dividend stock',
  'JPM': 'Bank exposure',
  'NVDA': 'AI growth play',
  'GOOGL': 'Tech diversification'
};

export const getCompanyName = (ticker) => {
  return COMPANY_NAMES[ticker] || `${ticker} Corp.`;
};

export const getNotes = (ticker) => {
  return STOCK_NOTES[ticker] || 'Standard holding';
};
