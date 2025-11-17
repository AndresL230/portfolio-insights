"""
Portfolio API routes
"""
from flask import Blueprint, request, jsonify
import datetime
import random
from typing import Dict, List

portfolio_bp = Blueprint('portfolio', __name__)

# These will be injected by the main app
portfolio_model = None
stock_service = None
ai_service = None
sector_map = None


def init_routes(portfolio, stock_svc, ai_svc, sectors):
    """Initialize routes with dependencies"""
    global portfolio_model, stock_service, ai_service, sector_map
    portfolio_model = portfolio
    stock_service = stock_svc
    ai_service = ai_svc
    sector_map = sectors


@portfolio_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.datetime.now().isoformat()})


@portfolio_bp.route('/portfolio', methods=['GET'])
def get_portfolio():
    """Get complete portfolio data including holdings and metrics"""
    holdings = portfolio_model.load_holdings()
    metrics = portfolio_model.calculate_metrics(holdings)
    return jsonify({
        'holdings': holdings,
        'metrics': metrics
    })


@portfolio_bp.route('/holdings', methods=['GET'])
def get_holdings():
    """Get all stock holdings"""
    holdings = portfolio_model.load_holdings()
    return jsonify(holdings)


@portfolio_bp.route('/holdings', methods=['POST'])
def add_holding():
    """Add a new stock holding"""
    try:
        data = request.get_json()
        print(f"Received request to add holding: {data}")

        ticker = data.get('ticker', '').upper().strip()
        shares = data.get('shares')
        purchase_date = data.get('purchase_date')
        manual_buy_price = data.get('buy_price')

        if not ticker or shares is None or not purchase_date:
            error_msg = 'Missing required fields: ticker, shares, purchase_date'
            print(f"Validation error: {error_msg}")
            return jsonify({'error': error_msg}), 400

        shares = float(shares)
        print(f"Processing: {ticker}, {shares} shares, purchased on {purchase_date}")
        if manual_buy_price:
            print(f"Manual buy price provided: ${manual_buy_price}")

        # Validation
        if not ticker:
            return jsonify({'error': 'Ticker symbol cannot be empty'}), 400
        if shares <= 0:
            return jsonify({'error': 'Number of shares must be positive'}), 400
        if not purchase_date:
            return jsonify({'error': 'Purchase date is required'}), 400

        try:
            parsed_date = datetime.datetime.strptime(purchase_date, '%Y-%m-%d')
            if parsed_date.date() > datetime.datetime.now().date():
                return jsonify({'error': 'Purchase date cannot be in the future'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

        holdings = portfolio_model.load_holdings()
        existing_tickers = [h['ticker'].upper() for h in holdings]
        if ticker in existing_tickers:
            error_msg = f'Stock {ticker} already exists in portfolio'
            print(f"Duplicate ticker error: {error_msg}")
            return jsonify({'error': error_msg}), 400

        if manual_buy_price:
            buy_price = float(manual_buy_price)
            print(f"Using manual buy price: ${buy_price}")
        else:
            print(f"Fetching historical price for {ticker} on {purchase_date}...")

            # First try to get current price to validate ticker
            current_validation_price = stock_service.get_real_time_price(ticker)
            if current_validation_price is None:
                error_msg = f'Invalid ticker symbol "{ticker}". Please verify the ticker symbol is correct. Common examples: AAPL (Apple), GOOGL (Google), MSFT (Microsoft), TSLA (Tesla).'
                print(f"Ticker validation error: {error_msg}")
                return jsonify({'error': error_msg}), 400

            buy_price = stock_service.get_historical_price(ticker, purchase_date)
            if buy_price is None:
                error_msg = f'Could not fetch historical price for {ticker} on {purchase_date}. The ticker appears valid but data is not available for that date. Please try: (1) A different date, (2) Wait 60 seconds if rate limited, (3) Enter the price manually.'
                print(f"Price fetch error: {error_msg}")
                return jsonify({
                    'error': error_msg,
                    'suggestion': f'Try a more recent date or enter the historical price manually.'
                }), 400
            print(f"Successfully fetched buy price: ${buy_price}")

        current_price = buy_price

        # Create new holding
        new_holding = {
            'id': max([h['id'] for h in holdings], default=0) + 1,
            'ticker': ticker,
            'shares': shares,
            'buy_price': buy_price,
            'current_price': current_price,
            'purchase_date': purchase_date,
            'sector': sector_map.get(ticker, 'Other')
        }

        holdings.append(new_holding)
        portfolio_model.save_holdings(holdings)

        return jsonify({
            'message': f'Successfully added {ticker} to portfolio (bought at ${buy_price} on {purchase_date})',
            'holding': new_holding
        }), 201

    except ValueError as e:
        return jsonify({'error': 'Invalid number format for shares'}), 400
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@portfolio_bp.route('/holdings/<int:holding_id>', methods=['DELETE'])
def delete_holding(holding_id):
    """Delete a stock holding"""
    try:
        holdings = portfolio_model.load_holdings()
        original_length = len(holdings)
        holdings = [h for h in holdings if h['id'] != holding_id]

        if len(holdings) == original_length:
            return jsonify({'error': 'Holding not found'}), 404

        portfolio_model.save_holdings(holdings)
        return jsonify({'message': 'Holding deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@portfolio_bp.route('/refresh-prices', methods=['POST'])
def refresh_prices():
    """Fetch real-time prices from Yahoo Finance and update holdings"""
    try:
        holdings = portfolio_model.load_holdings()
        updated_count = 0

        for i, holding in enumerate(holdings):
            ticker = holding['ticker']
            real_price = stock_service.get_real_time_price(ticker)

            if real_price:
                holding['current_price'] = real_price
                updated_count += 1
            else:
                variation = 0.95 + random.random() * 0.1
                holding['current_price'] = round(holding['current_price'] * variation, 2)

            if i < len(holdings) - 1:
                import time
                time.sleep(0.5)

        portfolio_model.save_holdings(holdings)
        metrics = portfolio_model.calculate_metrics(holdings)

        return jsonify({
            'message': f'Prices refreshed successfully ({updated_count}/{len(holdings)} from live data)',
            'holdings': holdings,
            'metrics': metrics
        }), 200

    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@portfolio_bp.route('/stock-history/<ticker>', methods=['GET'])
def get_stock_history_endpoint(ticker):
    """Get historical price data for a specific stock"""
    try:
        period = request.args.get('period', '1mo')
        ticker = ticker.upper()

        history = stock_service.get_stock_history(ticker, period)

        if not history:
            return jsonify({'error': f'Unable to fetch history for {ticker}'}), 404

        return jsonify({
            'ticker': ticker,
            'period': period,
            'history': history
        }), 200

    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@portfolio_bp.route('/real-time-prices', methods=['GET'])
def get_all_real_time_prices():
    """Get real-time prices for all holdings"""
    try:
        holdings = portfolio_model.load_holdings()
        prices = {}

        for holding in holdings:
            ticker = holding['ticker']
            price = stock_service.get_real_time_price(ticker)
            if price:
                prices[ticker] = {
                    'price': price,
                    'change': round(price - holding['current_price'], 2),
                    'change_percent': round(((price - holding['current_price']) / holding['current_price']) * 100, 2) if holding['current_price'] > 0 else 0
                }

        return jsonify(prices), 200

    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@portfolio_bp.route('/portfolio-history', methods=['GET'])
def get_portfolio_history():
    """Generate simulated portfolio history for the last 30 days"""
    try:
        days = int(request.args.get('days', 30))
        holdings = portfolio_model.load_holdings()
        history = []

        # Calculate current portfolio value
        current_value = sum(h['shares'] * h['current_price'] for h in holdings)

        # Generate historical data with realistic volatility
        for i in range(days, -1, -1):
            date = datetime.datetime.now() - datetime.timedelta(days=i)

            # Simulate daily returns with mean reversion
            daily_return = random.gauss(0.001, 0.02)
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


@portfolio_bp.route('/sector-breakdown', methods=['GET'])
def get_sector_breakdown():
    """Calculate sector allocation breakdown"""
    try:
        holdings = portfolio_model.load_holdings()
        sector_totals = {}
        total_value = 0

        for holding in holdings:
            value = holding['shares'] * holding['current_price']
            sector = holding['sector']
            sector_totals[sector] = sector_totals.get(sector, 0) + value
            total_value += value

        breakdown = []
        colors = ['#00FFFF', '#FF00FF', '#00FF00', '#FFFF00', '#FF0099', '#00FFAA', '#FF6600']

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


@portfolio_bp.route('/portfolio-metrics', methods=['GET'])
def get_portfolio_metrics():
    """Get detailed portfolio metrics"""
    try:
        holdings = portfolio_model.load_holdings()
        metrics = portfolio_model.calculate_metrics(holdings)

        # Add additional metrics
        if holdings:
            performers = portfolio_model.get_best_worst_performers(holdings)
            metrics.update({
                'total_holdings': len(holdings),
                **performers
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


@portfolio_bp.route('/ai-insights', methods=['POST'])
def get_ai_insights():
    """Get AI-powered insights about the portfolio using Gemini"""
    try:
        if not ai_service.is_configured():
            return jsonify({'error': 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file'}), 500

        holdings = portfolio_model.load_holdings()
        metrics = portfolio_model.calculate_metrics(holdings)

        # Prepare context for AI
        portfolio_context = {
            'total_holdings': len(holdings),
            'total_value': metrics['total_value'],
            'total_gain_loss': metrics['total_gain_loss'],
            'gain_loss_percentage': metrics['gain_loss_percentage'],
            'holdings': []
        }

        for holding in holdings:
            market_value = holding['shares'] * holding['current_price']
            cost = holding['shares'] * holding['buy_price']
            gain_loss = market_value - cost
            return_pct = (gain_loss / cost * 100) if cost > 0 else 0

            portfolio_context['holdings'].append({
                'ticker': holding['ticker'],
                'sector': holding['sector'],
                'shares': holding['shares'],
                'buy_price': holding['buy_price'],
                'current_price': holding['current_price'],
                'market_value': market_value,
                'return_percentage': return_pct,
                'purchase_date': holding['purchase_date']
            })

        ai_response = ai_service.generate_portfolio_insights(portfolio_context)

        return jsonify({
            'insights': ai_response,
            'portfolio_summary': portfolio_context
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to generate insights: {str(e)}'}), 500