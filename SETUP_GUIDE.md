# Portfolio Insights - Setup Guide

This guide will help you set up the Stock Portfolio Insights application with all its features, including electric-themed charts, CSV storage, and AI-powered insights.

## Features

✅ **Fixed Charts** - Interactive charts on the Insights page
✅ **Electric Color Theme** - Neon cyan, magenta, green, and yellow colors for all charts
✅ **CSV Storage** - Local CSV file storage for portfolio data persistence
✅ **Claude AI Integration** - AI-powered portfolio analysis and recommendations
✅ **Add/Delete Stocks** - Fully functional stock management

## Prerequisites

- **Python 3.8+** installed
- **Node.js 14+** and npm installed
- **Claude API Key** (get it from https://console.anthropic.com/)

## Installation Steps

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Configure Claude API Key

```bash
# In the backend directory, create a .env file
# Copy from the example:
cp .env.example .env

# Edit the .env file and add your Claude API key:
# CLAUDE_API_KEY=your_actual_api_key_here
```

**To get your Claude API key:**
1. Go to https://console.anthropic.com/
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy it to your `.env` file

### 3. Frontend Setup

```bash
# Navigate to the frontend directory
cd ../frontend

# Install Node.js dependencies
npm install
```

## Running the Application

### Start the Backend Server

```bash
# From the backend directory (with venv activated)
cd backend
python app.py
```

You should see:
```
🚀 Starting Stock Portfolio Analyzer API...
📊 API will be available at: http://localhost:5000
💾 CSV storage location: /path/to/portfolio_holdings.csv
🤖 Claude AI: Enabled
```

### Start the Frontend

In a **new terminal window**:

```bash
# From the frontend directory
cd frontend
npm start
```

The app will open at http://localhost:3000

## Using the Application

### 1. View Your Portfolio
- Navigate to the **Home** page to see portfolio summary and charts
- All charts now use electric colors (cyan, magenta, green, yellow)

### 2. Manage Holdings
- Go to the **Portfolio** page
- Click "Add Holding" to add new stocks
- Enter ticker symbol, number of shares, and purchase date
- Historical prices are fetched automatically
- Click "Delete" to remove holdings

### 3. Get AI Insights
- Navigate to the **Insights** page
- View real-time performance metrics with electric-themed charts
- Click "Ask the Advisor" button to get AI-powered portfolio analysis
- Claude AI will provide:
  - Portfolio diversification analysis
  - Risk assessment
  - Actionable recommendations
  - Strengths and concerns

### 4. Data Persistence
- All portfolio data is automatically saved to `backend/portfolio_holdings.csv`
- Data persists between application restarts
- You can manually edit the CSV file if needed

## Troubleshooting

### Claude AI Not Working
- **Error**: "Claude API key not configured"
  - **Solution**: Make sure `.env` file exists in the `backend` directory
  - Check that `CLAUDE_API_KEY` is set correctly
  - Restart the backend server after adding the API key

### Charts Not Displaying
- **Issue**: Charts show "Loading..." indefinitely
  - **Solution**: Ensure the backend server is running on port 5000
  - Check browser console for errors
  - Verify holdings data exists

### Cannot Add Stocks
- **Issue**: "Failed to add stock" error
  - **Solution**: Check that the ticker symbol is valid
  - Ensure the purchase date is not in the future
  - Verify internet connection (for price fetching)

### CSV File Errors
- **Issue**: CSV file permission errors
  - **Solution**: Ensure write permissions for the `backend` directory
  - Check if the file is open in another program

## Electric Theme Colors

The application uses these electric/neon colors:

- **Cyan**: `#00FFFF` - Primary line charts, axis labels
- **Magenta**: `#FF00FF` - Performance charts
- **Green**: `#00FF00` - Positive returns, holdings bars
- **Yellow**: `#FFFF00` - Sector pie chart
- **Hot Pink**: `#FF0099` - Negative returns
- **Aqua**: `#00FFAA` - Additional sectors
- **Orange**: `#FF6600` - Additional sectors

## File Structure

```
portfolio-insights/
├── backend/
│   ├── app.py                      # Main Flask server with Claude AI
│   ├── requirements.txt            # Python dependencies
│   ├── .env                        # Your API keys (create this!)
│   ├── .env.example                # Example env file
│   ├── .gitignore                  # Git ignore rules
│   └── portfolio_holdings.csv      # Auto-generated data file
├── frontend/
│   ├── src/
│   │   ├── App.js                  # Main React app
│   │   ├── App.css                 # Styling
│   │   └── components/
│   │       └── Charts.js           # Electric-themed charts
│   ├── package.json                # Node dependencies
│   └── public/
└── SETUP_GUIDE.md                  # This file
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/portfolio` - Get complete portfolio with metrics
- `GET /api/holdings` - Get all holdings
- `POST /api/holdings` - Add new holding
- `DELETE /api/holdings/<id>` - Delete holding
- `POST /api/refresh-prices` - Refresh stock prices
- `GET /api/portfolio-history` - Get historical portfolio data
- `GET /api/sector-breakdown` - Get sector allocation
- `GET /api/portfolio-metrics` - Get detailed metrics
- `POST /api/ai-insights` - **Get AI-powered insights** ⭐

## Support

If you encounter any issues:
1. Check that both frontend and backend servers are running
2. Verify your Claude API key is valid
3. Check console logs for error messages
4. Ensure all dependencies are installed correctly

Enjoy your AI-powered portfolio tracker with electric visuals! ⚡
