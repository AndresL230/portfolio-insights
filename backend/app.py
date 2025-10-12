from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
import datetime
from typing import Dict, List
import yfinance as yf
from datetime import timedelta



app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# In-memory storage (replace with database in production)
portfolio_data = {
    "holdings": [
        {
            "id": 1,
            "ticker": "AAPL",
            "shares": 10,
            "buy_price": 150.00,
            "current_price": 185.20,
            "purchase_date": "2024-06-15",
            "sector": "Technology"
        },
        {
            "id": 2,
            "ticker": "GOOGL",
            "shares": 5,
            "buy_price": 2400.00,
            "current_price": 2650.30,
            "purchase_date": "2024-05-20",
            "sector": "Technology"
        },
        {
            "id": 3,
            "ticker": "TSLA",
            "shares": 8,
            "buy_price": 200.00,
            "current_price": 245.80,
            "purchase_date": "2024-07-10",
            "sector": "Consumer Cyclical"
        },
        {
            "id": 4,
            "ticker": "MSFT",
            "shares": 12,
            "buy_price": 300.00,
            "current_price": 380.50,
            "purchase_date": "2024-04-01",
            "sector": "Technology"
        },
        {
            "id": 5,
            "ticker": "NVDA",
            "shares": 6,
            "buy_price": 400.00,
            "current_price": 875.20,
            "purchase_date": "2024-03-15",
            "sector": "Technology"
        }
    ]
}

# Sector mapping for new stocks
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

def get_real_time_price(ticker):
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

def get_historical_price(ticker, date_str):
    """Fetch historical price for a specific date from Yahoo Finance"""
    try:
        stock = yf.Ticker(ticker)

        # Parse the date string (format: YYYY-MM-DD)
        target_date = datetime.datetime.strptime(date_str, '%Y-%m-%d')

        # Fetch data for a range around the target date
        # Go back a few days in case the exact date is a weekend/holiday
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
        # (stock price on last trading day before purchase)
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

def get_stock_history(ticker, period='1mo'):
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

def calculate_portfolio_metrics():
    """Calculate portfolio summary metrics"""
    holdings = portfolio_data['holdings']
    total_value = sum(h['shares'] * h['current_price'] for h in holdings)
    total_cost = sum(h['shares'] * h['buy_price'] for h in holdings)
    total_gain_loss = total_value - total_cost
    gain_loss_percentage = (total_gain_loss / total_cost * 100) if total_cost > 0 else 0

    return {
        'total_value': round(total_value, 2),
        'total_cost': round(total_cost, 2),
        'total_gain_loss': round(total_gain_loss, 2),
        'gain_loss_percentage': round(gain_loss_percentage, 2)
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.datetime.now().isoformat()})

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    """Get complete portfolio data including holdings and metrics"""
    metrics = calculate_portfolio_metrics()
    return jsonify({
        'holdings': portfolio_data['holdings'],
        'metrics': metrics
    })

@app.route('/api/holdings', methods=['GET'])
def get_holdings():
    """Get all stock holdings"""
    return jsonify(portfolio_data['holdings'])

@app.route('/api/holdings', methods=['POST'])
def add_holding():
    """Add a new stock holding"""
    try:
        data = request.get_json()

        # Validate input
        required_fields = ['ticker', 'shares', 'purchase_date']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields: ticker, shares, purchase_date'}), 400

        ticker = data['ticker'].upper().strip()
        shares = float(data['shares'])
        purchase_date = data['purchase_date']

        # Validation
        if not ticker:
            return jsonify({'error': 'Ticker symbol cannot be empty'}), 400
        if shares <= 0:
            return jsonify({'error': 'Number of shares must be positive'}), 400
        if not purchase_date:
            return jsonify({'error': 'Purchase date is required'}), 400

        # Validate date format
        try:
            datetime.datetime.strptime(purchase_date, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

        # Check for duplicate ticker
        existing_tickers = [h['ticker'] for h in portfolio_data['holdings']]
        if ticker in existing_tickers:
            return jsonify({'error': f'Stock {ticker} already exists in portfolio'}), 400

        # Fetch historical price for the purchase date
        buy_price = get_historical_price(ticker, purchase_date)
        if buy_price is None:
            return jsonify({'error': f'Could not fetch historical price for {ticker} on {purchase_date}. Please verify the ticker symbol and date.'}), 400

        # Fetch current price
        current_price = get_real_time_price(ticker)
        if current_price is None:
            # Fallback to buy price if current price fetch fails
            current_price = buy_price

        # Create new holding
        new_holding = {
            'id': max([h['id'] for h in portfolio_data['holdings']], default=0) + 1,
            'ticker': ticker,
            'shares': shares,
            'buy_price': buy_price,
            'current_price': current_price,
            'purchase_date': purchase_date,
            'sector': SECTOR_MAP.get(ticker, 'Other')
        }

        portfolio_data['holdings'].append(new_holding)

        return jsonify({
            'message': f'Successfully added {ticker} to portfolio (bought at ${buy_price} on {purchase_date})',
            'holding': new_holding
        }), 201

    except ValueError as e:
        return jsonify({'error': 'Invalid number format for shares'}), 400
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/holdings/<int:holding_id>', methods=['DELETE'])
def delete_holding(holding_id):
    """Delete a stock holding"""
    try:
        original_length = len(portfolio_data['holdings'])
        portfolio_data['holdings'] = [h for h in portfolio_data['holdings'] if h['id'] != holding_id]
        
        if len(portfolio_data['holdings']) == original_length:
            return jsonify({'error': 'Holding not found'}), 404
        
        return jsonify({'message': 'Holding deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/refresh-prices', methods=['POST'])
def refresh_prices():
    """Fetch real-time prices from Yahoo Finance and update holdings"""
    try:
        updated_count = 0
        for holding in portfolio_data['holdings']:
            ticker = holding['ticker']
            real_price = get_real_time_price(ticker)

            if real_price:
                holding['current_price'] = real_price
                updated_count += 1
            else:
                # Fallback to simulated price movement if API fails
                variation = 0.95 + random.random() * 0.1
                holding['current_price'] = round(holding['current_price'] * variation, 2)

        metrics = calculate_portfolio_metrics()

        return jsonify({
            'message': f'Prices refreshed successfully ({updated_count}/{len(portfolio_data["holdings"])} from live data)',
            'holdings': portfolio_data['holdings'],
            'metrics': metrics
        }), 200

    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/stock-history/<ticker>', methods=['GET'])
def get_stock_history_endpoint(ticker):
    """Get historical price data for a specific stock"""
    try:
        period = request.args.get('period', '1mo')  # 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
        ticker = ticker.upper()

        history = get_stock_history(ticker, period)

        if not history:
            return jsonify({'error': f'Unable to fetch history for {ticker}'}), 404

        return jsonify({
            'ticker': ticker,
            'period': period,
            'history': history
        }), 200

    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/real-time-prices', methods=['GET'])
def get_all_real_time_prices():
    """Get real-time prices for all holdings"""
    try:
        prices = {}
        for holding in portfolio_data['holdings']:
            ticker = holding['ticker']
            price = get_real_time_price(ticker)
            if price:
                prices[ticker] = {
                    'price': price,
                    'change': round(price - holding['current_price'], 2),
                    'change_percent': round(((price - holding['current_price']) / holding['current_price']) * 100, 2) if holding['current_price'] > 0 else 0
                }

        return jsonify(prices), 200

    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/portfolio-history', methods=['GET'])
def get_portfolio_history():
    """Generate simulated portfolio history for the last 30 days"""
    try:
        days = int(request.args.get('days', 30))
        history = []
        
        # Calculate current portfolio value
        current_value = sum(h['shares'] * h['current_price'] for h in portfolio_data['holdings'])
        
        # Generate historical data with realistic volatility
        for i in range(days, -1, -1):
            date = datetime.datetime.now() - datetime.timedelta(days=i)
            
            # Simulate daily returns with mean reversion
            daily_return = random.gauss(0.001, 0.02)  # 0.1% average daily return, 2% volatility
            base_value = current_value * (1 + daily_return * i * 0.1)
            
            # Add some randomness
            random_factor = 0.95 + random.random() * 0.1
            value = base_value * random_factor
            
            history.append({
                'date': date.strftime('%Y-%m-%d'),
                'value': round(value, 2),
                'formatted_date': date.strftime('%b %d')
            })
        
        return jsonify(history), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/sector-breakdown', methods=['GET'])
def get_sector_breakdown():
    """Calculate sector allocation breakdown"""
    try:
        sector_totals = {}
        total_value = 0
        
        for holding in portfolio_data['holdings']:
            value = holding['shares'] * holding['current_price']
            sector = holding['sector']
            sector_totals[sector] = sector_totals.get(sector, 0) + value
            total_value += value
        
        breakdown = []
        colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316']
        
        for i, (sector, value) in enumerate(sector_totals.items()):
            percentage = (value / total_value * 100) if total_value > 0 else 0
            breakdown.append({
                'sector': sector,
                'value': round(value, 2),
                'percentage': round(percentage, 2),
                'color': colors[i % len(colors)]
            })
        
        # Sort by value descending
        breakdown.sort(key=lambda x: x['value'], reverse=True)
        
        return jsonify(breakdown), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/portfolio-metrics', methods=['GET'])
def get_portfolio_metrics():
    """Get detailed portfolio metrics"""
    try:
        metrics = calculate_portfolio_metrics()
        
        # Add additional metrics
        holdings = portfolio_data['holdings']
        if holdings:
            best_performer = max(holdings, key=lambda h: ((h['current_price'] - h['buy_price']) / h['buy_price']) * 100)
            worst_performer = min(holdings, key=lambda h: ((h['current_price'] - h['buy_price']) / h['buy_price']) * 100)
            
            metrics.update({
                'total_holdings': len(holdings),
                'best_performer': {
                    'ticker': best_performer['ticker'],
                    'return_pct': round(((best_performer['current_price'] - best_performer['buy_price']) / best_performer['buy_price']) * 100, 2)
                },
                'worst_performer': {
                    'ticker': worst_performer['ticker'],
                    'return_pct': round(((worst_performer['current_price'] - worst_performer['buy_price']) / worst_performer['buy_price']) * 100, 2)
                }
            })
        else:
            metrics.update({
                'total_holdings': 0,
                'best_performer': None,
                'worst_performer': None
            })
        
        return jsonify(metrics), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting Stock Portfolio Analyzer API...")
    print("📊 API will be available at: http://localhost:5000")
    print("🔍 API Documentation:")
    print("   GET  /api/health           - Health check")
    print("   GET  /api/portfolio        - Get complete portfolio")
    print("   GET  /api/holdings         - Get all holdings")
    print("   POST /api/holdings         - Add new holding")
    print("   DELETE /api/holdings/<id>  - Delete holding")
    print("   POST /api/refresh-prices   - Refresh stock prices")
    print("   GET  /api/portfolio-history - Get portfolio history")
    print("   GET  /api/sector-breakdown - Get sector allocation")
    print("   GET  /api/portfolio-metrics - Get detailed metrics")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
