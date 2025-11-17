# Alpha Vantage API Setup

## Why Alpha Vantage?

Alpha Vantage is now the **primary stock data provider** for this application, with Yahoo Finance as a fallback. Benefits:

- **Reliable**: No rate limiting issues like Yahoo Finance
- **FREE tier**: 25 API calls per day (perfect for portfolio tracking)
- **Better data**: More accurate historical prices
- **Premium options**: Upgrade if you need more calls

## Getting Your FREE API Key

1. **Visit**: https://www.alphavantage.co/support/#api-key
2. **Fill out the form**:
   - Enter your email
   - Organization: Can be "Personal" or your name
   - Click "GET FREE API KEY"
3. **Copy your API key** - it will be displayed immediately
4. **Add to .env file**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your key:
   ALPHA_VANTAGE_API_KEY=YOUR_KEY_HERE
   ```

## API Limits

### Free Tier (Perfect for this app!)
- **25 API calls per day**
- **5 API calls per minute**

With caching implemented in this app:
- Adding a stock: **1 call** (cached for 1 hour)
- Refreshing prices: **1 call per stock** (cached for 1 minute)
- Viewing history: **1 call** (cached)

**Example**: With 10 stocks in your portfolio, you can:
- Add 20+ new stocks per day
- Refresh prices 2-3 times per day
- View historical data multiple times (uses cache)

### Premium Tiers (Optional)
- **$49.99/month**: 75 calls/day, 15 calls/minute
- **$149.99/month**: 300 calls/day, 30 calls/minute
- **$499.99/month**: 1200 calls/day, 120 calls/minute

## Fallback Behavior

If Alpha Vantage API key is not set or limit is reached:
- ✅ Automatically falls back to Yahoo Finance
- ⚠️ Yahoo Finance has aggressive rate limiting
- 💡 Recommendation: Always use Alpha Vantage for best experience

## Testing Your Setup

1. Add the API key to `.env`
2. Restart your Flask server:
   ```bash
   cd backend
   python app.py
   ```
3. Look for this message:
   ```
   Alpha Vantage API: Enabled
   ```
4. Try adding a stock (like PFE) - it should work immediately!

## Troubleshooting

### "No data found" error
- Check your API key is correct in `.env`
- Verify you haven't exceeded 25 calls/day
- Check https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_KEY to test

### Rate limit reached
- Free tier resets daily
- Consider upgrading to premium tier
- App will automatically fall back to Yahoo Finance

## Support

- Alpha Vantage Documentation: https://www.alphavantage.co/documentation/
- Contact: support@alphavantage.co
