# Stock Portfolio Insights

A modern, full-stack web application for tracking and analyzing stock portfolios with real-time performance metrics, AI-powered insights, and comprehensive portfolio analytics.

![Portfolio Dashboard](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Flask](https://img.shields.io/badge/Backend-Flask-lightgrey)
![Python](https://img.shields.io/badge/Language-Python-yellow)

## **Project Overview**

Stock Portfolio Insights is a comprehensive portfolio management system that helps investors track their holdings, analyze performance, and receive AI-powered recommendations for portfolio optimization. The application features a clean, professional interface with three main sections: Dashboard, Holdings Management, and Portfolio Insights.

## **Key Features**

### **Dashboard & Analytics**
- **Portfolio Summary**: Real-time overview of total value, gains/losses, and performance metrics
- **Visual Analytics**: Interactive charts showing portfolio value over time, sector allocation, and stock weight distribution
- **Performance Tracking**: Comprehensive tracking of portfolio performance with historical data

### **Holdings Management**
- **Performance Overview Table**: Real-time tracking of individual stock performance with gain/loss calculations
- **Position Details Table**: Detailed information including company names, purchase dates, sectors, and investment notes
- **Add/Remove Holdings**: Easy-to-use interface for managing portfolio positions
- **Real-time Price Updates**: Simulated live price feeds with refresh functionality

### **AI-Powered Insights**
- **AI Suggestion Panel**: Intelligent recommendations based on portfolio analysis
- **Risk Assessment**: Identification of portfolio risks including over-concentration and volatility warnings
- **Diversification Analysis**: Sector allocation insights and diversification recommendations
- **Performance Insights**: Advanced metrics including total returns and average holding periods

## **Technical Architecture**

### **Frontend (React)**
- **React 18** with modern hooks and functional components
- **Responsive CSS Grid/Flexbox** layout for all screen sizes
- **Component-based architecture** with reusable UI elements
- **Client-side routing** for seamless navigation between pages
- **Real-time data updates** with automatic refresh capabilities

### **Backend (Flask)**
- **RESTful API design** with comprehensive endpoint coverage
- **Flask-CORS** for cross-origin resource sharing
- **In-memory data storage** with database-ready architecture
- **Error handling and validation** for robust data management
- **Modular code structure** for easy maintenance and scaling

## **Quick Start Guide**

### **Prerequisites**
- Python 3.7 or higher
- Node.js 14 or higher
- npm or yarn package manager

### **Installation Steps**

#### 1. Clone and Setup Backend
```bash
# Create project directory
mkdir stock-portfolio-insights
cd stock-portfolio-insights

# Setup backend
mkdir backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install Flask==2.3.3 Flask-CORS==4.0.0

# Create app.py (copy from provided Flask backend code)
# Run the server
python app.py
```

#### 2. Setup Frontend
```bash
# In a new terminal, from project root
mkdir frontend
cd frontend

# Initialize React app
npm init -y
npm install react@18.2.0 react-dom@18.2.0 react-scripts@5.0.1

# Create necessary directories
mkdir -p src public

# Copy provided React files:
# - App.js → src/App.js
# - App.css → src/App.css
# - index.js → src/index.js
# - index.html → public/index.html

# Start development server
npm start
```

#### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## **Project Structure**

```
stock-portfolio-insights/
├── README.md
├── backend/
│   ├── app.py                 # Flask API server
│   ├── requirements.txt       # Python dependencies
│   └── venv/                  # Virtual environment
└── frontend/
    ├── package.json           # Node.js dependencies
    ├── public/
    │   └── index.html         # HTML template
    └── src/
        ├── App.js            # Main React component
        ├── App.css           # Application styles
        └── index.js          # React entry point
```

## **API Documentation**

### **Base URL**: `http://localhost:5000/api`

#### **Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check and server status |
| `GET` | `/portfolio` | Complete portfolio data with metrics |
| `GET` | `/holdings` | All stock holdings |
| `POST` | `/holdings` | Add new stock holding |
| `DELETE` | `/holdings/<id>` | Delete specific holding |
| `POST` | `/refresh-prices` | Refresh all stock prices |
| `GET` | `/portfolio-history` | Historical portfolio data |
| `GET` | `/sector-breakdown` | Sector allocation analysis |
| `GET` | `/portfolio-metrics` | Detailed portfolio metrics |

#### **Sample API Requests**

**Add New Holding:**
```json
POST /api/holdings
{
  "ticker": "AAPL",
  "shares": 10,
  "buy_price": 150.00
}
```


**Response:**
```json
{
  "message": "Successfully added AAPL to portfolio",
  "holding": {
    "id": 6,
    "ticker": "AAPL",
    "shares": 10,
    "buy_price": 150.00,
    "current_price": 155.25,
    "sector": "Technology"
  }
}
```

## **User Interface**

### **Navigation**
- **Home**: Portfolio dashboard with summary and visual analytics
- **Portfolio**: Holdings management with detailed tables and forms
- **Insights**: AI-powered recommendations and risk analysis
- **Settings**: Application preferences and configuration

### **Key Components**

#### **Dashboard Page**
- Welcome section with quick start button
- Portfolio summary cards showing key metrics
- Visual analytics with charts and graphs

#### **Holdings Page**
- Performance overview table with real-time data
- Position details table with comprehensive information
- Modal-based form for adding new holdings

#### **Insights Page**
- AI suggestion panel with personalized recommendations
- Performance insights with key metrics
- Risk flags and warnings for portfolio optimization

## **Data Management**

### **Current Implementation**
The application currently uses **simulated stock data** for demonstration purposes:
- Sample portfolio with popular stocks (AAPL, GOOGL, TSLA, MSFT, NVDA)
- Realistic price movements with ±2-5% daily variations
- Automatic sector classification for holdings

### **Production Integration**
For production deployment, integrate with real stock APIs:

#### **Recommended APIs:**
- **Alpha Vantage**: Free tier with 5 calls/minute
- **Finnhub**: Free tier with 60 calls/minute
- **Yahoo Finance**: Via yfinance Python library

#### **Integration Example:**
```python
import requests

def get_real_stock_price(symbol):
    api_key = "YOUR_API_KEY"
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}"
    response = requests.get(url)
    data = response.json()
    return float(data['Global Quote']['05. price'])
```

## **Error Handling & Validation**

### **Backend Validation**
- Input sanitization for all API endpoints
- Comprehensive error messages with appropriate HTTP status codes
- Data type validation for numerical inputs
- Duplicate ticker prevention

### **Frontend Error Handling**
- User-friendly error messages
- Form validation with real-time feedback
- Loading states for async operations
- Graceful fallbacks for API failures

## **Responsive Design**

The application is fully responsive with breakpoints for:
- **Desktop**: Full layout with sidebar navigation
- **Tablet**: Stacked layout with touch-friendly interfaces
- **Mobile**: Single-column layout with optimized forms

## **Security Considerations**

### **Current Implementation**
- CORS configuration for secure API access
- Input validation and sanitization
- Error message sanitization to prevent information leakage

### **Production Recommendations**
- Implement user authentication and authorization
- Add rate limiting for API endpoints
- Use environment variables for sensitive configuration
- Implement API key management for external services

## **Deployment Options**

### **Frontend Deployment**
- **Vercel**: Automatic deployments with GitHub integration
- **Netlify**: Static site hosting with continuous deployment
- **AWS S3 + CloudFront**: Scalable static hosting solution

### **Backend Deployment**
- **Heroku**: Easy Python app deployment
- **AWS EC2**: Scalable virtual server hosting
- **DigitalOcean**: Developer-friendly cloud hosting

### **Full-Stack Deployment**
- **Railway**: Modern application hosting platform
- **Google Cloud Run**: Containerized application deployment
- **AWS Elastic Beanstalk**: Managed application platform

## **Troubleshooting**

### **Common Issues**

#### **CORS Errors**
```bash
# Ensure Flask-CORS is installed and backend is running
pip install Flask-CORS
python app.py
```

#### **Port Conflicts**
```bash
# Backend port 5000 in use
lsof -ti:5000 | xargs kill -9

# Frontend port 3000 in use
# Press 'Y' when prompted to use alternative port
```

#### **Module Not Found**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```
