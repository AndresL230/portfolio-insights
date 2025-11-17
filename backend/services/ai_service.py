"""
AI service for portfolio insights using Google Gemini
"""
import google.generativeai as genai
from typing import Optional, Dict, List


class AIService:
    """Service for AI-powered portfolio insights"""

    def __init__(self, api_key: Optional[str]):
        self.client = None
        self.api_key = api_key
        if api_key:
            genai.configure(api_key=api_key)
            # List available models for debugging
            try:
                print("Checking available Gemini models...")
                available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
                print(f"Available models: {available_models[:5]}")  # Show first 5

                # Try models in order of preference
                model_priority = [
                    'gemini-1.5-flash',
                    'gemini-1.5-pro',
                    'gemini-pro'
                ]

                for model_name in model_priority:
                    # Check if model exists in available models (with or without 'models/' prefix)
                    if any(model_name in m for m in available_models):
                        # Extract the full model name from available models
                        full_model_name = next((m for m in available_models if model_name in m), None)
                        if full_model_name:
                            self.client = genai.GenerativeModel(full_model_name)
                            print(f"Successfully loaded: {full_model_name}")
                            break

                if not self.client:
                    print("Warning: No suitable model found, attempting gemini-pro as fallback")
                    self.client = genai.GenerativeModel('gemini-pro')

            except Exception as e:
                print(f"Error initializing Gemini model: {e}")
                self.client = None

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

    def answer_question(self, portfolio_context: Dict, question: str) -> str:
        """Answer a specific question about the portfolio"""
        if not self.is_configured():
            raise ValueError("Gemini API key not configured")

        try:
            # Create the prompt with portfolio context and user question
            prompt = self._build_chat_prompt(portfolio_context, question)

            # Call Gemini API
            print(f"Sending question to Gemini AI: {question[:50]}...")
            response = self.client.generate_content(prompt)
            print(f"Received response from Gemini AI")
            return response.text
        except Exception as e:
            print(f"Error in answer_question: {str(e)}")
            raise Exception(f"AI service error: {str(e)}")

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

    def _build_chat_prompt(self, context: Dict, question: str) -> str:
        """Build a prompt for answering questions about the portfolio"""
        portfolio_json = self._format_portfolio_json(context)

        prompt = f"""You are an AI Portfolio Advisor. Your job is to answer questions about the user's stock portfolio based on the data provided below.

PORTFOLIO DATA (JSON):
{portfolio_json}

USER QUESTION: {question}

Instructions:
- Answer the question accurately based on the portfolio data provided
- Be concise and actionable in your response
- Use specific numbers and percentages from the data when relevant
- If asked for recommendations, provide 2-3 specific, actionable suggestions
- If the question cannot be answered with the available data, politely explain what information is missing
- Keep responses under 300 words unless more detail is requested
- Use plain text formatting only - NO markdown, NO asterisks for bold, NO bullet points with symbols
- Use simple line breaks and numbered lists (1., 2., 3.) if needed
- Write naturally as if speaking to the user directly

Provide your answer now:"""

        return prompt

    def _format_portfolio_json(self, context: Dict) -> str:
        """Format portfolio context as readable JSON"""
        import json
        return json.dumps(context, indent=2)