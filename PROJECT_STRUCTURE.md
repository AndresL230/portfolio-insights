# Project Structure

This document outlines the refactored and organized structure of the Portfolio Insights application.

## Overview

The application has been reorganized into a clean, modular architecture with clear separation of concerns for both backend and frontend.

## Backend Structure

```
backend/
├── app.py                      # Main application entry point
├── config.py                   # Configuration settings
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
│
├── models/                    # Data models
│   ├── __init__.py
│   └── portfolio.py           # Portfolio data model and CSV operations
│
├── services/                  # Business logic services
│   ├── __init__.py
│   ├── stock_service.py       # Yahoo Finance integration
│   └── ai_service.py          # Gemini AI integration
│
└── routes/                    # API route handlers
    ├── __init__.py
    └── portfolio_routes.py    # Portfolio API endpoints
```

### Backend Components

#### `config.py`
- Application configuration
- Environment variables
- Constants (sector mapping, file paths)

#### `models/portfolio.py`
- Portfolio data model
- CSV file operations (load/save)
- Portfolio metrics calculations
- Best/worst performer calculations

#### `services/stock_service.py`
- Real-time stock price fetching (Yahoo Finance)
- Historical price retrieval
- Stock history data

#### `services/ai_service.py`
- Gemini AI client initialization
- Portfolio insights generation
- Prompt building

#### `routes/portfolio_routes.py`
- All API endpoints
- Request validation
- Response formatting

## Frontend Structure

```
frontend/src/
├── App.js                     # Main application component
├── App.css                    # Main styles
├── index.js                   # Application entry point
│
├── components/                # Reusable UI components
│   ├── Charts.js              # All chart components (Recharts)
│   ├── Navigation.js          # Navigation bar
│   └── ErrorBanner.js         # Error display component
│
├── pages/                     # Page-level components
│   ├── HomePage.js            # Home/dashboard page
│   ├── HoldingsPage.js        # Portfolio holdings page
│   └── InsightsPage.js        # AI insights page
│
├── services/                  # External service integrations
│   └── api.js                 # Backend API client
│
└── utils/                     # Utility functions
    ├── formatters.js          # Currency, percentage, date formatting
    ├── calculations.js        # Portfolio calculations
    └── constants.js           # App constants (company names, notes)
```

### Frontend Components

#### `services/api.js`
- Centralized API client
- All backend communication
- Error handling

#### `utils/formatters.js`
- `formatCurrency()` - Currency formatting
- `formatPercentage()` - Percentage formatting
- `formatDate()` - Date formatting

#### `utils/calculations.js`
- `calculateHoldingMetrics()` - Per-holding calculations
- `calculateAverageHoldingTime()` - Portfolio-wide metrics
- `calculateTotalReturn()` - Return calculations

#### `utils/constants.js`
- Company name mappings
- Stock notes/descriptions
- Helper functions

#### `pages/`
- **HomePage**: Dashboard with portfolio summary and charts
- **HoldingsPage**: Detailed holdings management
- **InsightsPage**: AI-powered insights and recommendations

#### `components/`
- **Navigation**: Top navigation bar
- **ErrorBanner**: Error message display
- **Charts**: Recharts-based visualizations

## Key Improvements

### 1. Modular Architecture
- Clear separation of concerns
- Easy to maintain and extend
- Reusable components

### 2. No Emojis
- All emojis removed from code
- Professional, clean codebase
- Better for screen readers and accessibility

### 3. Better Organization
- Backend: Config → Models → Services → Routes
- Frontend: Pages → Components → Services → Utils
- Logical grouping of related functionality

### 4. Improved Maintainability
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Clear dependencies

### 5. Enhanced Testability
- Isolated components
- Pure utility functions
- Mockable services

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/portfolio` | Complete portfolio data |
| GET | `/api/holdings` | All holdings |
| POST | `/api/holdings` | Add new holding |
| DELETE | `/api/holdings/<id>` | Delete holding |
| POST | `/api/refresh-prices` | Refresh stock prices |
| GET | `/api/portfolio-history` | Historical portfolio data |
| GET | `/api/sector-breakdown` | Sector allocation |
| GET | `/api/portfolio-metrics` | Detailed metrics |
| POST | `/api/ai-insights` | AI-powered insights |

## Running the Application

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

## Technologies Used

### Backend
- Flask - Web framework
- Flask-CORS - Cross-origin resource sharing
- yfinance - Stock data
- google-generativeai - AI insights
- python-dotenv - Environment management

### Frontend
- React - UI framework
- Recharts - Data visualization
- CSS3 - Styling

## Future Enhancements

1. Add unit tests for backend services
2. Add integration tests for API endpoints
3. Add React component tests
4. Implement caching for stock data
5. Add user authentication
6. Database integration (replace CSV)
7. WebSocket for real-time updates
8. Export portfolio reports (PDF/Excel)
