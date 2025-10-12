"""
Configuration settings for the portfolio application
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""

    # Flask Configuration
    DEBUG = True
    HOST = '0.0.0.0'
    PORT = 5000

    # API Configuration
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

    # File paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CSV_FILE = os.path.join(BASE_DIR, 'portfolio_holdings.csv')

    # Sector mapping for stocks
    SECTOR_MAP = {
        'AAPL': 'Technology',
        'GOOGL': 'Technology',
        'MSFT': 'Technology',
        'NVDA': 'Technology',
        'TSLA': 'Consumer Cyclical',
        'AMZN': 'Consumer Cyclical',
        'META': 'Technology',
        'JPM': 'Financial',
        'JNJ': 'Healthcare',
        'V': 'Financial',
        'WMT': 'Consumer Defensive',
        'DIS': 'Communication Services',
        'NFLX': 'Communication Services',
        'AMD': 'Technology',
        'CRM': 'Technology',
        'ORCL': 'Technology'
    }