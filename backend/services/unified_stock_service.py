"""
Unified stock service with Alpha Vantage primary and Yahoo Finance fallback
"""
from typing import Optional, List, Dict
from .alphavantage_service import AlphaVantageService
from .stock_service import StockService


class UnifiedStockService:
    """Stock service that uses Alpha Vantage with Yahoo Finance fallback"""

    def __init__(self, alpha_vantage_key: Optional[str] = None):
        self.alpha_vantage = AlphaVantageService(alpha_vantage_key) if alpha_vantage_key else None
        self.use_alpha_vantage = alpha_vantage_key is not None
        print(f"Stock service initialized - Alpha Vantage: {'Enabled' if self.use_alpha_vantage else 'Disabled (using Yahoo Finance)'}")

    def get_real_time_price(self, ticker: str) -> Optional[float]:
        """Fetch real-time price with fallback"""
        if self.use_alpha_vantage:
            price = self.alpha_vantage.get_real_time_price(ticker)
            if price is not None:
                return price
            print(f"Alpha Vantage failed for {ticker}, falling back to Yahoo Finance")

        return StockService.get_real_time_price(ticker)

    def get_historical_price(self, ticker: str, date_str: str) -> Optional[float]:
        """Fetch historical price with fallback"""
        if self.use_alpha_vantage:
            price = self.alpha_vantage.get_historical_price(ticker, date_str)
            if price is not None:
                return price
            print(f"Alpha Vantage failed for {ticker}, falling back to Yahoo Finance")

        return StockService.get_historical_price(ticker, date_str)

    def get_stock_history(self, ticker: str, period: str = '1mo') -> List[Dict]:
        """Fetch stock history with fallback"""
        if self.use_alpha_vantage:
            history = self.alpha_vantage.get_stock_history(ticker, period)
            if history:
                return history
            print(f"Alpha Vantage failed for {ticker} history, falling back to Yahoo Finance")

        return StockService.get_stock_history(ticker, period)
