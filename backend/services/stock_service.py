"""
Stock data service using Yahoo Finance API
"""
import yfinance as yf
import datetime
from datetime import timedelta
from typing import Optional, List, Dict
import time
import logging

logging.getLogger('yfinance').setLevel(logging.CRITICAL)


class StockService:
    """Service for fetching stock data with caching"""

    _price_cache = {}
    _cache_duration = 300

    @staticmethod
    def get_real_time_price(ticker: str) -> Optional[float]:
        """Fetch real-time price from Yahoo Finance with caching"""
        try:
            cache_key = f"current_{ticker}"
            if cache_key in StockService._price_cache:
                cached_data = StockService._price_cache[cache_key]
                if time.time() - cached_data['timestamp'] < 60:
                    return cached_data['price']

            stock = yf.Ticker(ticker)

            try:
                hist = stock.history(period='5d')
                if not hist.empty:
                    price = round(float(hist['Close'].iloc[-1]), 2)
                    StockService._price_cache[cache_key] = {'price': price, 'timestamp': time.time()}
                    return price
            except Exception as e:
                print(f"History API failed for {ticker}: {e}")

            try:
                fast_info = stock.fast_info
                if hasattr(fast_info, 'last_price') and fast_info.last_price:
                    price = round(float(fast_info.last_price), 2)
                    StockService._price_cache[cache_key] = {'price': price, 'timestamp': time.time()}
                    return price
            except Exception as e:
                print(f"Fast info API failed for {ticker}: {e}")

            return None
        except Exception as e:
            print(f"Error fetching price for {ticker}: {e}")
            return None

    @staticmethod
    def get_historical_price(ticker: str, date_str: str) -> Optional[float]:
        """Fetch historical price for a specific date with caching"""
        try:
            target_date = datetime.datetime.strptime(date_str, '%Y-%m-%d')

            cache_key = f"{ticker}_{date_str}"
            if cache_key in StockService._price_cache:
                cached_data = StockService._price_cache[cache_key]
                if time.time() - cached_data['timestamp'] < StockService._cache_duration:
                    print(f"Using cached price for {ticker} on {date_str}: ${cached_data['price']}")
                    return cached_data['price']

            time.sleep(3)

            start_date = target_date - timedelta(days=7)
            end_date = target_date + timedelta(days=1)

            print(f"Fetching {ticker} historical data for {date_str}...")
            stock = yf.Ticker(ticker)

            hist = stock.history(start=start_date, end=end_date)
            print(f"Initial query returned {len(hist)} rows")

            if hist.empty:
                print(f"Trying longer period for {ticker}...")
                time.sleep(1)
                hist = stock.history(period='1y')
                print(f"1-year period returned {len(hist)} rows")

            if not hist.empty:
                target_date_str = target_date.strftime('%Y-%m-%d')

                for index, row in hist.iterrows():
                    if index.strftime('%Y-%m-%d') == target_date_str:
                        price = round(float(row['Close']), 2)
                        StockService._price_cache[cache_key] = {'price': price, 'timestamp': time.time()}
                        print(f"Found exact price for {ticker} on {date_str}: ${price}")
                        return price

                data_before = hist[hist.index <= target_date]
                if not data_before.empty:
                    closest_price = data_before.iloc[-1]['Close']
                    closest_date = data_before.index[-1].strftime('%Y-%m-%d')
                    price = round(float(closest_price), 2)
                    StockService._price_cache[cache_key] = {'price': price, 'timestamp': time.time()}
                    print(f"Using closest date {closest_date} for {ticker}: ${price}")
                    return price

                if not hist.empty:
                    price = round(float(hist.iloc[0]['Close']), 2)
                    first_date = hist.index[0].strftime('%Y-%m-%d')
                    StockService._price_cache[cache_key] = {'price': price, 'timestamp': time.time()}
                    print(f"Using earliest available date {first_date} for {ticker}: ${price}")
                    return price

            print(f"No data found for {ticker}")
            return None

        except Exception as e:
            error_msg = str(e)
            if '429' in error_msg or 'Too Many Requests' in error_msg:
                print(f"Rate limited by Yahoo Finance for {ticker}. Please wait and try again.")
            else:
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
