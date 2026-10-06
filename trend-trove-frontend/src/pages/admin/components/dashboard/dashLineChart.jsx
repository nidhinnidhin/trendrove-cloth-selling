import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const DashLineChart = ({ data = [] }) => {
  const formatData = (orders) => {
    const groupedData = orders.reduce((acc, order) => {
      let dateKey;
      const orderDate = new Date(order.createdAt);
      
      // Format date based on data length (for different time periods)
      if (orders.length <= 24) { // Daily view
        dateKey = orderDate.toLocaleTimeString([], { hour: '2-digit', hour12: true });
      } else if (orders.length <= 7) { // Weekly view
        dateKey = orderDate.toLocaleDateString([], { weekday: 'short' });
      } else if (orders.length <= 31) { // Monthly view
        dateKey = orderDate.getDate().toString();
      } else { // Yearly view
        dateKey = orderDate.toLocaleDateString([], { month: 'short' });
      }

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          revenue: 0,
          orders: 0,
          returns: 0
        };
      }
      
      if (order.orderStatus !== 'Cancelled') {
        acc[dateKey].revenue += order.totalAmount;
        acc[dateKey].orders += 1;
      }
      if (order.orderStatus === 'Returned') {
        acc[dateKey].returns += 1;
      }
      
      return acc;
    }, {});

    return Object.values(groupedData).sort((a, b) => {
      // Sort based on original date values
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      return aDate - bDate;
    });
  };

  const formattedData = formatData(data);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: '#2C2D33', 
          padding: '10px', 
          border: '1px solid #666',
          borderRadius: '4px'
        }}>
          <p style={{ color: '#fff', margin: '0 0 5px 0' }}>{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '5px 0' }}>
              {`${entry.name}: ${entry.name === 'revenue' ? 
                formatCurrency(entry.value) : 
                entry.value}`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="date" 
          stroke="#fff"
          tick={{ fill: '#fff' }}
        />
        <YAxis 
          stroke="#fff"
          tick={{ fill: '#fff' }}
          yAxisId="left"
          tickFormatter={value => formatCurrency(value)}
        />
        <YAxis 
          stroke="#fff"
          tick={{ fill: '#fff' }}
          yAxisId="right"
          orientation="right"
          tickFormatter={value => Math.round(value)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#FF9800" 
          strokeWidth={2}
          dot={{ fill: '#FF9800' }}
          yAxisId="left"
          name="Revenue"
        />
        <Line 
          type="monotone" 
          dataKey="orders" 
          stroke="#4CAF50" 
          strokeWidth={2}
          dot={{ fill: '#4CAF50' }}
          yAxisId="right"
          name="Orders"
        />
        <Line 
          type="monotone" 
          dataKey="returns" 
          stroke="#f44336" 
          strokeWidth={2}
          dot={{ fill: '#f44336' }}
          yAxisId="right"
          name="Returns"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DashLineChart;
