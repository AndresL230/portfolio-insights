"""
Stock data service using Yahoo Finance API
"""
import yfinance as yf
import datetime
from datetime import timedelta
from typing import Optional, List, Dict


class StockService:
    """Service for fetching stock data"""

    @staticmethod
    def get_real_time_price(ticker: str) -> Optional[float]:
        """Fetch real-time price from Yahoo Finance"""
        try:
            stock = yf.Ticker(ticker)
            data = stock.info
            current_price = data.get('currentPrice') or data.get('regularMarketPrice')
            if current_price:
                return round(float(current_price), 2)

            # Fallback to recent history if info not available
            hist = stock.history(period='1d')
            if not hist.empty:
                return round(float(hist['Close'].iloc[-1]), 2)
            return None
        except Exception as e:
            print(f"Error fetching price for {ticker}: {e}")
            return None

    @staticmethod
    def get_historical_price(ticker: str, date_str: str) -> Optional[float]:
        """Fetch historical price for a specific date from Yahoo Finance"""
        try:
            stock = yf.Ticker(ticker)
            target_date = datetime.datetime.strptime(date_str, '%Y-%m-%d')

            # Fetch data for a range around the target date
            start_date = target_date - timedelta(days=7)
            end_date = target_date + timedelta(days=1)

            hist = stock.history(start=start_date, end=end_date)

            if hist.empty:
                print(f"No historical data found for {ticker} around {date_str}")
                return None

            # Try to find the exact date first
            target_date_str = target_date.strftime('%Y-%m-%d')
            for index, row in hist.iterrows():
                if index.strftime('%Y-%m-%d') == target_date_str:
                    return round(float(row['Close']), 2)

            # If exact date not found, use the closest previous date
            hist_before = hist[hist.index <= target_date]
            if not hist_before.empty:
                closest_price = hist_before.iloc[-1]['Close']
                return round(float(closest_price), 2)

            # If no data before, use the closest date after
            if not hist.empty:
                closest_price = hist.iloc[0]['Close']
                return round(float(closest_price), 2)

            return None
        except Exception as e:
            print(f"Error fetching historical price for {ticker} on {date_str}: {e}")
            return None

    @staticmethod
    def get_stock_history(ticker: str, period: str = '1mo') -> List[Dict]:
        """Fetch historical stock data"""
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period=period)

            history_data = []
            for index, row in hist.iterrows():
                history_data.append({
                    'date': index.strftime('%Y-%m-%d'),
                    'formatted_date': index.strftime('%b %d'),
                    'price': round(float(row['Close']), 2),
                    'open': round(float(row['Open']), 2),
                    'high': round(float(row['High']), 2),
                    'low': round(float(row['Low']), 2),
                    'volume': int(row['Volume'])
                })

            return history_data
        except Exception as e:
            print(f"Error fetching history for {ticker}: {e}")
            return []