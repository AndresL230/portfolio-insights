import React from 'react';
import './Charts.css';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Interactive Line Chart for Portfolio Value Over Time
export const PortfolioLineChart = ({ data, title = "Portfolio Value Over Time" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h4>{title}</h4>
        <div className="chart-empty">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00FFFF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis
            dataKey="formatted_date"
            stroke="#666666"
            tick={{ fill: '#CCCCCC' }}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#666666"
            tick={{ fill: '#CCCCCC' }}
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              border: '1px solid #00FFFF',
              borderRadius: '8px',
              color: '#FFFFFF',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}
            formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
            labelStyle={{ fontWeight: 'bold', color: '#FFFFFF', marginBottom: '4px' }}
            itemStyle={{ color: '#00FFFF' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00FFFF"
            fillOpacity={1}
            fill="url(#colorValue)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Interactive Pie Chart for Sector Allocation
export const SectorPieChart = ({ data, title = "Sector Allocation" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h4>{title}</h4>
        <div className="chart-empty">No sector data available</div>
      </div>
    );
  }

  const COLORS = ['#00FFFF', '#FF00FF', '#00FF00', '#FFFF00', '#FF0099', '#00FFAA', '#FF6600'];

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="#666666"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="chart-container">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart margin={{ left: 10, right: 10 }}>
          <Pie
            data={data}
            cx="38%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={110}
            fill="#8884d8"
            dataKey="percentage"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [
              `${value.toFixed(2)}% ($${props.payload.value.toLocaleString()})`,
              props.payload.sector
            ]}
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              border: '1px solid #FF00FF',
              borderRadius: '8px',
              color: '#FFFFFF',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}
            labelStyle={{ fontWeight: 'bold', color: '#FFFFFF' }}
            itemStyle={{ color: '#FF00FF' }}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{
              paddingLeft: '20px',
              fontSize: '14px'
            }}
            formatter={(value, entry) => `${entry.payload.sector}`}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Interactive Bar Chart for Holdings
export const HoldingsBarChart = ({ data, title = "Holdings by Value" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h4>{title}</h4>
        <div className="chart-empty">No holdings data available</div>
      </div>
    );
  }

  // Transform holdings data for bar chart
  const chartData = data.map(holding => ({
    ticker: holding.ticker,
    value: holding.shares * holding.current_price,
    shares: holding.shares,
    price: holding.current_price
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="chart-container">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis
            dataKey="ticker"
            stroke="#666666"
            tick={{ fill: '#CCCCCC' }}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#666666"
            tick={{ fill: '#CCCCCC' }}
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={false}
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              border: '1px solid #00FF00',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}
            formatter={(value, name, props) => {
              if (name === 'value') {
                return [`$${value.toLocaleString()}`, 'Total Value'];
              }
              return [value, name];
            }}
            labelStyle={{ fontWeight: 'bold', color: '#FFFFFF' }}
            itemStyle={{ color: '#00FF00' }}
          />
          <Legend />
          <Bar
            dataKey="value"
            fill="#00FF00"
            radius={[8, 8, 0, 0]}
            name="Total Value"
            isAnimationActive={false}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Stock History Chart (for individual stocks)
export const StockHistoryChart = ({ data, ticker, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h4>{title || `${ticker} Price History`}</h4>
        <div className="chart-empty">Loading historical data...</div>
      </div>
    );
  }

  const chartTitle = title || `${ticker} Price History`;

  return (
    <div className="chart-container">
      <h4>{chartTitle}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="formatted_date"
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#666"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            formatter={(value, name) => {
              const labels = {
                'price': 'Close',
                'open': 'Open',
                'high': 'High',
                'low': 'Low'
              };
              return [`$${value.toFixed(2)}`, labels[name] || name];
            }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            name="Close"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Performance Comparison Bar Chart
export const PerformanceBarChart = ({ data, title = "Stock Performance" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h4>{title}</h4>
        <div className="chart-empty">No performance data available</div>
      </div>
    );
  }

  // Calculate return percentage for each holding
  const chartData = data.map(holding => {
    const returnPct = ((holding.current_price - holding.buy_price) / holding.buy_price) * 100;
    return {
      ticker: holding.ticker,
      return: parseFloat(returnPct.toFixed(2)),
      gainLoss: holding.shares * (holding.current_price - holding.buy_price)
    };
  }).sort((a, b) => b.return - a.return);

  return (
    <div className="chart-container">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis
            dataKey="ticker"
            stroke="#666666"
            tick={{ fill: '#CCCCCC' }}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#666666"
            tick={{ fill: '#CCCCCC' }}
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              border: '1px solid #FF00FF',
              borderRadius: '8px',
              color: '#FFFFFF',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}
            formatter={(value, name) => {
              if (name === 'return') {
                return [`${value.toFixed(2)}%`, 'Return'];
              }
              return [value, name];
            }}
            labelStyle={{ fontWeight: 'bold', color: '#FFFFFF' }}
            itemStyle={{ color: '#FF00FF' }}
          />
          <Legend />
          <Bar
            dataKey="return"
            fill="#00FF00"
            radius={[8, 8, 0, 0]}
            name="Return %"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.return >= 0 ? '#00FF00' : '#FF0099'} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};