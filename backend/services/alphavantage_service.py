"""
Alpha Vantage API service for stock data
Free tier: 25 API calls per day (more than enough for portfolio tracking)
Get your free API key at: https://www.alphavantage.co/support/#api-key
"""
import requests
import datetime
from datetime import timedelta
from typing import Optional, List, Dict
import time


class AlphaVantageService:
    """Service for fetching stock data from Alpha Vantage"""

    BASE_URL = "https://www.alphavantage.co/query"
    _price_cache = {}
    _cache_duration = 3600

    def __init__(self, api_key: str):
        self.api_key = api_key

    def get_real_time_price(self, ticker: str) -> Optional[float]:
        """Fetch real-time price from Alpha Vantage"""
        try:
            cache_key = f"current_{ticker}"
            if cache_key in AlphaVantageService._price_cache:
                cached_data = AlphaVantageService._price_cache[cache_key]
                if time.time() - cached_data['timestamp'] < 60:
                    print(f"Using cached current price for {ticker}: ${cached_data['price']}")
                    return cached_data['price']

            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': ticker,
                'apikey': self.api_key
            }

            print(f"Fetching current price for {ticker} from Alpha Vantage...")
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            data = response.json()

            if 'Global Quote' in data and data['Global Quote']:
                price = float(data['Global Quote']['05. price'])
                AlphaVantageService._price_cache[cache_key] = {
                    'price': round(price, 2),
                    'timestamp': time.time()
                }
                print(f"Got current price for {ticker}: ${round(price, 2)}")
                return round(price, 2)

            if 'Note' in data:
                print(f"Alpha Vantage API limit reached: {data['Note']}")
                return None

            print(f"No price data found for {ticker}")
            return None

        except Exception as e:
            print(f"Error fetching current price for {ticker}: {e}")
            return None

    def get_historical_price(self, ticker: str, date_str: str) -> Optional[float]:
        """Fetch historical price for a specific date from Alpha Vantage"""
        try:
            target_date = datetime.datetime.strptime(date_str, '%Y-%m-%d')

            cache_key = f"{ticker}_{date_str}"
            if cache_key in AlphaVantageService._price_cache:
                cached_data = AlphaVantageService._price_cache[cache_key]
                if time.time() - cached_data['timestamp'] < AlphaVantageService._cache_duration:
                    print(f"Using cached price for {ticker} on {date_str}: ${cached_data['price']}")
                    return cached_data['price']

            params = {
                'function': 'TIME_SERIES_DAILY',
                'symbol': ticker,
                'apikey': self.api_key,
                'outputsize': 'compact'
            }

            print(f"Fetching historical data for {ticker} from Alpha Vantage...")
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            data = response.json()

            if 'Time Series (Daily)' in data:
                time_series = data['Time Series (Daily)']

                target_date_str = target_date.strftime('%Y-%m-%d')
                if target_date_str in time_series:
                    price = float(time_series[target_date_str]['4. close'])
                    AlphaVantageService._price_cache[cache_key] = {
                        'price': round(price, 2),
                        'timestamp': time.time()
                    }
                    print(f"Found exact price for {ticker} on {date_str}: ${round(price, 2)}")
                    return round(price, 2)

                available_dates = sorted(time_series.keys(), reverse=True)
                for date in available_dates:
                    if date <= target_date_str:
                        price = float(time_series[date]['4. close'])
                        AlphaVantageService._price_cache[cache_key] = {
                            'price': round(price, 2),
                            'timestamp': time.time()
                        }
                        print(f"Using closest date {date} for {ticker}: ${round(price, 2)}")
                        return round(price, 2)

            if 'Note' in data:
                print(f"Alpha Vantage API limit reached: {data['Note']}")
                return None

            if 'Error Message' in data:
                print(f"Alpha Vantage error for {ticker}: {data['Error Message']}")
                return None

            print(f"No historical data found for {ticker}")
            return None

        except Exception as e:
            print(f"Error fetching historical price for {ticker} on {date_str}: {e}")
            return None

    def get_stock_history(self, ticker: str, period: str = '1mo') -> List[Dict]:
        """Fetch historical stock data"""
        try:
            params = {
                'function': 'TIME_SERIES_DAILY',
                'symbol': ticker,
                'apikey': self.api_key,
                'outputsize': 'compact'
            }

            print(f"Fetching stock history for {ticker}...")
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            data = response.json()

            if 'Time Series (Daily)' not in data:
                print(f"No history data for {ticker}")
                return []

            time_series = data['Time Series (Daily)']
            history_data = []

            period_days = {
                '1mo': 30,
                '3mo': 90,
                '6mo': 180,
                '1y': 365
            }
            days = period_days.get(period, 30)

            sorted_dates = sorted(time_series.keys(), reverse=True)[:days]

            for date_str in reversed(sorted_dates):
                day_data = time_series[date_str]
                date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d')

                history_data.append({
                    'date': date_str,
                    'formatted_date': date_obj.strftime('%b %d'),
                    'price': round(float(day_data['4. close']), 2),
                    'open': round(float(day_data['1. open']), 2),
                    'high': round(float(day_data['2. high']), 2),
                    'low': round(float(day_data['3. low']), 2),
                    'volume': int(day_data['5. volume'])
                })

            return history_data

        except Exception as e:
            print(f"Error fetching history for {ticker}: {e}")
            return []
