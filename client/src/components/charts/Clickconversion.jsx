import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ClicksConversionChart = ({ conversions, clicksHistory, days = 30 }) => {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    
    const dateArray = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        clicks: 0,
        conversions: 0
      };
    });

    const dataMap = new Map(
      dateArray.map(item => [item.date, { ...item }])
    );

    clicksHistory.forEach(click => {
      const clickDate = new Date(click.timestamp).toISOString().split('T')[0];
      if (dataMap.has(clickDate)) {
        const dayData = dataMap.get(clickDate);
        dayData.clicks += 1;
      }
    });

    conversions.forEach(conversion => {
      const convDate = new Date(conversion.date).toISOString().split('T')[0];
      if (dataMap.has(convDate)) {
        const dayData = dataMap.get(convDate);
        dayData.conversions += 1;
      }
    });

    return Array.from(dataMap.values()).map(item => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit'
      })
    }));
  }, [conversions, clicksHistory, days]);

  return (
    <div className="bg-white dark:bg-dark-card p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-dark-text">
        Andamento Click e Conversioni ultimi {days} giorni
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f0f0f0" 
              className="dark:stroke-dark-accent"
            />
            <XAxis
              dataKey="formattedDate"
              tick={{ fill: '#666', className: 'dark:fill-dark-text' }}
              tickLine={{ stroke: '#666', className: 'dark:stroke-dark-text' }}
            />
            <YAxis
              tick={{ fill: '#666', className: 'dark:fill-dark-text' }}
              tickLine={{ stroke: '#666', className: 'dark:stroke-dark-text' }}
              label={{ 
                value: 'Numero di eventi', 
                angle: -90, 
                position: 'insideLeft', 
                fill: '#666',
                className: 'dark:fill-dark-text'
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                className: 'dark:bg-dark-bg dark:border-dark-accent dark:text-dark-text'
              }}
            />
            <Legend 
              payload={[
                { value: 'Clicks', type: 'line', color: '#1A2B88' },
                { value: 'Conversioni', type: 'line', color: '#49A078' }
              ]}
              wrapperStyle={{ color: 'dark:text-dark-text' }}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              name="Clicks"
              stroke="#1A2B88"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="conversions"
              name="Conversioni"
              stroke="#49A078"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClicksConversionChart;