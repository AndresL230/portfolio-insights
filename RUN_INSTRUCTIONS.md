# Portfolio Insights - Run Instructions

## Features Added
- Real-time stock price updates using Yahoo Finance API (yfinance)
- Historical price data visualization with interactive charts
- Auto-refresh every 60 seconds for live price updates
- Interactive charts using Recharts library:
  - Portfolio value over time (line chart with historical data)
  - Sector allocation (pie chart)
  - Holdings by value (bar chart)
  - Stock performance comparison

## Setup and Run

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the Flask server:
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup
1. Open a new terminal and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## API Endpoints

### New Endpoints Added:
- `POST /api/refresh-prices` - Fetches real-time prices from Yahoo Finance
- `GET /api/stock-history/<ticker>?period=1mo` - Get historical price data for a stock
- `GET /api/real-time-prices` - Get real-time prices for all holdings
- `GET /api/portfolio-history?days=30` - Get simulated portfolio history

### Existing Endpoints:
- `GET /api/health` - Health check
- `GET /api/portfolio` - Get complete portfolio data
- `GET /api/holdings` - Get all holdings
- `POST /api/holdings` - Add new holding
- `DELETE /api/holdings/<id>` - Delete holding
- `GET /api/sector-breakdown` - Get sector allocation
- `GET /api/portfolio-metrics` - Get detailed metrics

## Features

### Real-Time Price Updates
- Prices automatically refresh every 60 seconds in the background
- Manual refresh available via "Refresh Prices" button
- Uses Yahoo Finance API for real stock data

### Interactive Charts
All charts support:
- Hover tooltips with detailed information
- Responsive design
- Real-time data updates
- Professional styling

### Chart Types:
1. **Portfolio Line Chart** - Shows portfolio value over time (30 days)
2. **Sector Pie Chart** - Displays sector allocation with percentages
3. **Holdings Bar Chart** - Shows holdings ranked by total value
4. **Performance Bar Chart** - Compares stock returns (available on Insights page)

## Testing the Features

1. **View Charts**: Navigate to the Home page to see portfolio charts
2. **Add Holdings**: Go to Portfolio page and click "Add Holding"
3. **Real-Time Updates**: Wait 60 seconds or click "Refresh Prices" to see live updates
4. **Historical Data**: Charts automatically load 30 days of historical data
5. **Sector Analysis**: View sector breakdown on both Home and Insights pages

## Notes
- Real-time prices are fetched from Yahoo Finance (yfinance library)
- If Yahoo Finance is unavailable, the app falls back to simulated price movements
- Historical data is currently simulated but can be replaced with real historical stock data
- Charts are fully interactive with hover tooltips and legends