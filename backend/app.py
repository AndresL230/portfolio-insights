"""
Stock Portfolio Analyzer API
Main application file
"""
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from models import Portfolio
from services import UnifiedStockService, AIService
from routes import portfolio_bp, init_routes


def create_app():
    """Application factory"""
    app = Flask(__name__)
    CORS(app)

    # Initialize services
    portfolio = Portfolio(Config.CSV_FILE)
    stock_service = UnifiedStockService(Config.ALPHA_VANTAGE_API_KEY)
    ai_service = AIService(Config.GEMINI_API_KEY)

    # Initialize routes with dependencies
    init_routes(portfolio, stock_service, ai_service, Config.SECTOR_MAP)

    # Register blueprints
    app.register_blueprint(portfolio_bp, url_prefix='/api')

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    return app


if __name__ == '__main__':
    app = create_app()

    print("Starting Stock Portfolio Analyzer API...")
    print(f"API will be available at: http://localhost:{Config.PORT}")
    print(f"CSV storage location: {Config.CSV_FILE}")

    av_status = 'Enabled' if Config.ALPHA_VANTAGE_API_KEY else 'Disabled - Using Yahoo Finance (set ALPHA_VANTAGE_API_KEY in .env)'
    print(f"Alpha Vantage API: {av_status}")

    ai_status = 'Enabled' if Config.GEMINI_API_KEY else 'Disabled (set GEMINI_API_KEY in .env)'
    print(f"Gemini AI: {ai_status}")

    print("\nAPI Documentation:")
    print("   GET  /api/health            - Health check")
    print("   GET  /api/portfolio         - Get complete portfolio")
    print("   GET  /api/holdings          - Get all holdings")
    print("   POST /api/holdings          - Add new holding")
    print("   DELETE /api/holdings/<id>   - Delete holding")
    print("   POST /api/refresh-prices    - Refresh stock prices")
    print("   GET  /api/portfolio-history - Get portfolio history")
    print("   GET  /api/sector-breakdown  - Get sector allocation")
    print("   GET  /api/portfolio-metrics - Get detailed metrics")
    print("   POST /api/ai-insights       - Get AI-powered portfolio insights")

    app.run(debug=Config.DEBUG, host=Config.HOST, port=Config.PORT)