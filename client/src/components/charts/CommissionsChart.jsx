import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CommissionsChart = ({ data, viewMode }) => {
  const getXDataKey = () => {
    switch(viewMode) {
      case 'yearly':
        return 'year';
      case 'monthly':
        return 'monthLabel';
      case 'daily':
        return 'dayLabel';
      default:
        return 'monthLabel';
    }
  };

  const getChartTitle = () => {
    switch(viewMode) {
      case 'yearly':
        return 'Annual Commission Trend';
      case 'monthly':
        return 'Monthly Commission Trend';
      case 'daily':
        return 'Daily Commission Trend';
      default:
        return 'Commission Trend';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-accent">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
          {getChartTitle()}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-dark-blue"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Convalidated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">On Hold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-paid-green"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Paid</span>
          </div>
        </div>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              className="dark:stroke-gray-700"
            />
            <XAxis
              dataKey={getXDataKey()}
              tick={{ fill: '#4B5563', className: 'dark:fill-dark-text' }}
              angle={viewMode === 'yearly' ? 0 : -45}
              textAnchor={viewMode === 'yearly' ? 'middle' : 'end'}
              height={viewMode === 'yearly' ? 30 : 70}
              axisLine={{ stroke: '#E5E7EB', className: 'dark:stroke-gray-700' }}
            />
            <YAxis
              tick={{ fill: '#4B5563', className: 'dark:fill-dark-text' }}
              label={{ 
                value: '€', 
                angle: -90, 
                position: 'insideLeft', 
                fill: '#4B5563',
                className: 'dark:fill-dark-text',
                style: { fontSize: '14px' }
              }}
              axisLine={{ stroke: '#E5E7EB', className: 'dark:stroke-gray-700' }}
            />
            <Tooltip
              formatter={(value, name) => [
                `€ ${value}`,
                name === 'paidCommissions' ? 'Paid' :
                  name === 'onholdCommissions' ? 'On Hold' : 'Convalidated'
              ]}
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                dark: {
                  backgroundColor: '#1E1E1E',
                  borderColor: '#2C2C2C'
                }
              }}
              itemStyle={{ 
                color: '#374151',
                dark: {
                  color: '#E0E0E0'
                }
              }}
            />
            <Legend 
              formatter={(value) =>
                value === 'paidCommissions' ? 'Paid' :
                  value === 'onholdCommissions' ? 'On Hold' : 'Convalidated'
              }
              wrapperStyle={{
                paddingTop: '20px',
                color: '#374151',
                dark: {
                  color: '#E0E0E0'
                }
              }}
            />
            <Bar 
              dataKey="validatedCommissions" 
              stackId="a" 
              fill="#1A2B88" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="onholdCommissions" 
              stackId="a" 
              fill="#F59E0B"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="paidCommissions" 
              stackId="a" 
              fill="#49A078"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CommissionsChart;