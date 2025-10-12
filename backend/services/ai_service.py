"""
AI service for portfolio insights using Google Gemini
"""
import google.generativeai as genai
from typing import Optional, Dict, List


class AIService:
    """Service for AI-powered portfolio insights"""

    def __init__(self, api_key: Optional[str]):
        self.client = None
        if api_key:
            genai.configure(api_key=api_key)
            self.client = genai.GenerativeModel('gemini-pro')

    def is_configured(self) -> bool:
        """Check if AI service is properly configured"""
        return self.client is not None

    def generate_portfolio_insights(self, portfolio_context: Dict) -> str:
        """Generate AI insights for the portfolio"""
        if not self.is_configured():
            raise ValueError("Gemini API key not configured")

        # Create the prompt
        prompt = self._build_prompt(portfolio_context)

        # Call Gemini API
        response = self.client.generate_content(prompt)
        return response.text

    def _build_prompt(self, context: Dict) -> str:
        """Build the prompt for the AI model"""
        prompt = f"""You are a financial advisor analyzing a stock portfolio. Here is the current portfolio:

Portfolio Summary:
- Total Holdings: {context['total_holdings']}
- Total Portfolio Value: ${context['total_value']:,.2f}
- Total Gain/Loss: ${context['total_gain_loss']:,.2f} ({context['gain_loss_percentage']:.2f}%)

Individual Holdings:
"""

        for h in context['holdings']:
            prompt += f"\n- {h['ticker']} ({h['sector']}): {h['shares']} shares @ ${h['current_price']:.2f}, Return: {h['return_percentage']:.2f}%"

        prompt += """

Please provide:
1. A brief analysis of the portfolio's diversification and risk profile
2. 2-3 specific actionable recommendations to improve the portfolio
3. Any notable strengths or concerns

Keep your response concise and actionable (under 500 words)."""

        return prompt