import React, { useState, useRef, useEffect } from 'react';
import './InsightsPage.css';
import { SectorPieChart, PerformanceBarChart } from '../components/Charts';
import { calculateAverageHoldingTime, calculateTotalReturn } from '../utils/calculations';
import api from '../services/api';

const InsightsPage = ({ holdings, sectorData }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch AI suggestions on component mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true);
        const response = await api.getAISuggestions();
        setSuggestions(response.suggestions || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        // Use fallback suggestions
        setSuggestions([
          {
            title: "Review Portfolio Diversification",
            description: "Analyze your sector allocation and concentration",
            recommendation: "Consider spreading investments across multiple sectors to reduce risk."
          },
          {
            title: "Monitor Performance Metrics",
            description: "Track individual stock performance regularly",
            recommendation: "Review stocks with negative returns and evaluate their alignment with your strategy."
          },
          {
            title: "Rebalance Portfolio Quarterly",
            description: "Maintain target allocation percentages",
            recommendation: "Rebalance every 3-6 months to maintain your desired risk level."
          }
        ]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, []); // Empty dependency array - runs only on mount

  const handleAskQuestion = async (e) => {
    e.preventDefault();

    const question = inputValue.trim();
    if (!question) return;

    // Add user message to chat
    const userMessage = { type: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      const response = await api.askAIQuestion(question);

      // Add AI response to chat
      const aiMessage = { type: 'ai', content: response.answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message || 'Failed to get response from AI advisor');
      console.error('Error asking AI:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "How is my portfolio performing?",
    "What are my biggest risks?",
    "Should I diversify more?",
    "Which stocks have the best returns?",
    "What sectors am I overweight in?"
  ];

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>AI Portfolio Advisor</h1>
        <p>Ask questions about your portfolio and get personalized insights powered by AI.</p>
      </div>

      {/* AI Chat Interface */}
      <div className="ai-chat-container" style={{
        background: 'rgba(20, 20, 30, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Chat with Your Advisor</h2>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '1rem',
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          minHeight: '300px',
          maxHeight: '400px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              padding: '2rem'
            }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Hi! I'm your AI Portfolio Advisor.
              </p>
              <p>Ask me anything about your portfolio, and I'll provide insights based on your current holdings.</p>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                Try the quick questions below to get started!
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: message.type === 'user'
                    ? 'linear-gradient(135deg, #00FFFF 0%, #00CCCC 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: message.type === 'user' ? '#000' : 'var(--color-text-primary)',
                  border: message.type === 'ai' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                }}>
                  {message.type === 'ai' && (
                    <div style={{
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                      color: '#00FFFF',
                      fontSize: '0.9rem'
                    }}>
                      AI Advisor
                    </div>
                  )}
                  <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ color: '#00FFFF', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  AI Advisor
                </div>
                <div>Thinking...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
              Quick questions:
            </p>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(0, 255, 255, 0.1)',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    borderRadius: '20px',
                    color: '#00FFFF',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 255, 255, 0.2)';
                    e.target.style.borderColor = 'rgba(0, 255, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 255, 255, 0.1)';
                    e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)';
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid rgba(255, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ff4444',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleAskQuestion} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about your portfolio..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #00FFFF 0%, #00CCCC 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontWeight: 'bold',
              cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
              fontSize: '1rem'
            }}
          >
            {isLoading ? 'Asking...' : 'Ask'}
          </button>
        </form>
      </div>

      {/* AI Suggestion Panel */}
      <div className="ai-suggestions">
        <h2>AI Suggestion Panel</h2>
        <p>Recommendations based on your holdings</p>

        {loadingSuggestions ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
            <p>Generating AI-powered suggestions...</p>
          </div>
        ) : (
          <div className="suggestions-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                  alignItems: 'start',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div className="suggestion-content" style={{ overflow: 'visible' }}>
                  <h4>{suggestion.title}</h4>
                  <p>{suggestion.description}</p>
                </div>
                <div className="recommendation" style={{
                  paddingLeft: '1.5rem',
                  borderLeft: '2px solid rgba(0, 255, 255, 0.2)',
                  overflow: 'visible',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  <strong style={{ color: '#00FFFF' }}>AI Recommendation:</strong><br />
                  {suggestion.recommendation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <div className="performance-insights">
        <h2>Performance Insights</h2>
        <div className="insights-grid">
          <div className="insight-item">
            <div className="insight-label">Total Return</div>
            <div className="insight-value">{calculateTotalReturn(holdings)}%</div>
            <div className={`insight-change ${calculateTotalReturn(holdings) >= 0 ? 'positive' : 'negative'}`}>
              {calculateTotalReturn(holdings) >= 0 ? '+' : ''}{calculateTotalReturn(holdings)}%
            </div>
          </div>
          <div className="insight-item">
            <div className="insight-label">Average Holding Time</div>
            <div className="insight-value">{calculateAverageHoldingTime(holdings)}</div>
          </div>
        </div>
      </div>

      {/* Diversification Visuals */}
      <div className="diversification-section">
        <h2>Diversification Visuals</h2>
        <div className="charts-row">
          <SectorPieChart data={sectorData} />
          <PerformanceBarChart data={holdings} />
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
