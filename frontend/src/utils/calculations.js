/**
 * Portfolio calculation utilities
 */

export const calculateHoldingMetrics = (holding) => {
  const marketValue = holding.shares * holding.current_price;
  const cost = holding.shares * holding.buy_price;
  const gainLoss = marketValue - cost;
  const returnPercentage = (gainLoss / cost) * 100;
  return { marketValue, cost, gainLoss, returnPercentage };
};

export const calculateAverageHoldingTime = (holdings) => {
  if (!holdings || holdings.length === 0) return 'N/A';

  const avgDays = holdings.reduce((sum, holding) => {
    const purchaseDate = new Date(holding.purchase_date);
    const today = new Date();
    const daysDiff = Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24));
    return sum + daysDiff;
  }, 0) / holdings.length;

  const months = Math.floor(avgDays / 30);
  return months > 0 ? `${months} months` : `${Math.floor(avgDays)} days`;
};

export const calculateTotalReturn = (holdings) => {
  if (!holdings || holdings.length === 0) return 0;

  const totalValue = holdings.reduce((sum, h) => sum + (h.shares * h.current_price), 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.buy_price), 0);
  return totalCost > 0 ? ((totalValue - totalCost) / totalCost * 100).toFixed(2) : 0;
};
