"""
Stock data service using Yahoo Finance API
"""
import yfinance as yf
import datetime
from datetime import timedelta
from typing import Optional, List, Dict
import time


class StockService:
    """Service for fetching stock data"""

    @staticmethod
    def get_real_time_price(ticker: str) -> Optional[float]:
        """Fetch real-time price from Yahoo Finance with improved error handling"""
        try:
            stock = yf.Ticker(ticker)

            # Try multiple methods to get the current price
            # Method 1: Try info API
            try:
                data = stock.info
                current_price = data.get('currentPrice') or data.get('regularMarketPrice') or data.get('previousClose')
                if current_price:
                    return round(float(current_price), 2)
            except Exception as e:
                print(f"Info API failed for {ticker}: {e}")

            # Method 2: Fallback to recent history
            try:
                hist = stock.history(period='5d')
                if not hist.empty:
                    return round(float(hist['Close'].iloc[-1]), 2)
            except Exception as e:
                print(f"History API failed for {ticker}: {e}")

            # Method 3: Try fast_info
            try:
                fast_info = stock.fast_info
                if hasattr(fast_info, 'last_price') and fast_info.last_price:
                    return round(float(fast_info.last_price), 2)
            except Exception as e:
                print(f"Fast info API failed for {ticker}: {e}")

            return None
        except Exception as e:
            print(f"Error fetching price for {ticker}: {e}")
            return None

    @staticmethod
    def get_historical_price(ticker: str, date_str: str) -> Optional[float]:
        """Fetch historical price for a specific date from Yahoo Finance with improved error handling"""
        try:
            target_date = datetime.datetime.strptime(date_str, '%Y-%m-%d')

            # Add a small delay to avoid rate limiting
            time.sleep(0.5)

            # Try Method 1: Using download with specific date range
            try:
                start_date = target_date - timedelta(days=30)
                end_date = target_date + timedelta(days=7)

                print(f"Attempting to fetch {ticker} data using yf.download...")
                data = yf.download(ticker, start=start_date, end=end_date, progress=False, show_errors=False)

                if not data.empty:
                    print(f"Successfully fetched data for {ticker} using download")

                    # Try to find the exact date
                    target_date_str = target_date.strftime('%Y-%m-%d')
                    for index, row in data.iterrows():
                        if index.strftime('%Y-%m-%d') == target_date_str:
                            price = round(float(row['Close']), 2)
                            print(f"Found exact price for {ticker} on {date_str}: ${price}")
                            return price

                    # Use closest date
                    data_before = data[data.index <= target_date]
                    if not data_before.empty:
                        closest_price = data_before.iloc[-1]['Close']
                        closest_date = data_before.index[-1].strftime('%Y-%m-%d')
                        price = round(float(closest_price), 2)
                        print(f"Using closest previous date {closest_date} for {ticker}: ${price}")
                        return price

            except Exception as e:
                print(f"Download method failed for {ticker}: {e}")

            # Try Method 2: Using Ticker object with longer period
            try:
                print(f"Attempting to fetch {ticker} data using Ticker object...")
                stock = yf.Ticker(ticker)
                hist = stock.history(period='2y', interval='1d')

                if not hist.empty:
                    print(f"Successfully fetched ticker history for {ticker}")

                    # Try to find the exact date
                    target_date_str = target_date.strftime('%Y-%m-%d')
                    for index, row in hist.iterrows():
                        if index.strftime('%Y-%m-%d') == target_date_str:
                            price = round(float(row['Close']), 2)
                            print(f"Found exact price for {ticker} on {date_str}: ${price}")
                            return price

                    # Use closest date
                    hist_before = hist[hist.index <= target_date]
                    if not hist_before.empty:
                        closest_price = hist_before.iloc[-1]['Close']
                        closest_date = hist_before.index[-1].strftime('%Y-%m-%d')
                        price = round(float(closest_price), 2)
                        print(f"Using closest previous date {closest_date} for {ticker}: ${price}")
                        return price

                    # If no data before target, use first available
                    if not hist.empty:
                        closest_price = hist.iloc[0]['Close']
                        closest_date = hist.index[0].strftime('%Y-%m-%d')
                        price = round(float(closest_price), 2)
                        print(f"Using first available date {closest_date} for {ticker}: ${price}")
                        return price

            except Exception as e:
                print(f"Ticker history method failed for {ticker}: {e}")

            # Try Method 3: Get current price as last resort
            print(f"Trying to get current price for {ticker} as fallback...")
            current_price = StockService.get_real_time_price(ticker)
            if current_price:
                print(f"Using current price for {ticker}: ${current_price}")
                return current_price

            print(f"All methods failed for {ticker}")
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