"""
Portfolio data models and CSV operations
"""
import csv
import os
from typing import List, Dict


class Portfolio:
    """Portfolio data management"""

    def __init__(self, csv_file_path: str):
        self.csv_file = csv_file_path
        self.initial_data = [
            {"id": 1, "ticker": "AAPL", "shares": 10, "buy_price": 150.00, "current_price": 185.20, "purchase_date": "2024-06-15", "sector": "Technology"},
            {"id": 2, "ticker": "GOOGL", "shares": 5, "buy_price": 2400.00, "current_price": 2650.30, "purchase_date": "2024-05-20", "sector": "Technology"},
            {"id": 3, "ticker": "TSLA", "shares": 8, "buy_price": 200.00, "current_price": 245.80, "purchase_date": "2024-07-10", "sector": "Consumer Cyclical"},
            {"id": 4, "ticker": "MSFT", "shares": 12, "buy_price": 300.00, "current_price": 380.50, "purchase_date": "2024-04-01", "sector": "Technology"},
            {"id": 5, "ticker": "NVDA", "shares": 6, "buy_price": 400.00, "current_price": 875.20, "purchase_date": "2024-03-15", "sector": "Technology"}
        ]

    def load_holdings(self) -> List[Dict]:
        """Load holdings from CSV file"""
        if not os.path.exists(self.csv_file):
            self.save_holdings(self.initial_data)
            return self.initial_data

        holdings = []
        with open(self.csv_file, 'r', newline='') as file:
            reader = csv.DictReader(file)
            for row in reader:
                holdings.append({
                    'id': int(row['id']),
                    'ticker': row['ticker'],
                    'shares': float(row['shares']),
                    'buy_price': float(row['buy_price']),
                    'current_price': float(row['current_price']),
                    'purchase_date': row['purchase_date'],
                    'sector': row['sector']
                })
        return holdings

    def save_holdings(self, holdings: List[Dict]) -> None:
        """Save holdings to CSV file"""
        with open(self.csv_file, 'w', newline='') as file:
            fieldnames = ['id', 'ticker', 'shares', 'buy_price', 'current_price', 'purchase_date', 'sector']
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(holdings)

    def calculate_metrics(self, holdings: List[Dict]) -> Dict:
        """Calculate portfolio summary metrics"""
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

    def get_best_worst_performers(self, holdings: List[Dict]) -> Dict:
        """Get best and worst performing holdings"""
        if not holdings:
            return {
                'best_performer': None,
                'worst_performer': None
            }

        best_performer = max(holdings, key=lambda h: ((h['current_price'] - h['buy_price']) / h['buy_price']) * 100)
        worst_performer = min(holdings, key=lambda h: ((h['current_price'] - h['buy_price']) / h['buy_price']) * 100)

        return {
            'best_performer': {
                'ticker': best_performer['ticker'],
                'return_pct': round(((best_performer['current_price'] - best_performer['buy_price']) / best_performer['buy_price']) * 100, 2)
            },
            'worst_performer': {
                'ticker': worst_performer['ticker'],
                'return_pct': round(((worst_performer['current_price'] - worst_performer['buy_price']) / worst_performer['buy_price']) * 100, 2)
            }
        }