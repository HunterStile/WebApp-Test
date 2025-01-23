import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ClicksConversionChart = ({ conversions, clicksHistory, days = 30 }) => {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    
    // Crea un array di date per il periodo selezionato
    const dateArray = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        clicks: 0,
        conversions: 0
      };
    });

    // Mappa per tenere traccia dei dati per data
    const dataMap = new Map(
      dateArray.map(item => [item.date, { ...item }])
    );

    // Aggiungi i click
    clicksHistory.forEach(click => {
      const clickDate = new Date(click.timestamp).toISOString().split('T')[0];
      if (dataMap.has(clickDate)) {
        const dayData = dataMap.get(clickDate);
        dayData.clicks += 1;
      }
    });

    // Aggiungi le conversioni
    conversions.forEach(conversion => {
      const convDate = new Date(conversion.date).toISOString().split('T')[0];
      if (dataMap.has(convDate)) {
        const dayData = dataMap.get(convDate);
        dayData.conversions += 1;
      }
    });

    // Converti la mappa in array e formatta le date
    return Array.from(dataMap.values()).map(item => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit'
      })
    }));
  }, [conversions, clicksHistory, days]);

  return (
    <div className="bg-white p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Andamento Click e Conversioni ultimi {days} giorni
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fill: '#666' }}
              tickLine={{ stroke: '#666' }}
            />
            <YAxis
              tick={{ fill: '#666' }}
              tickLine={{ stroke: '#666' }}
              label={{ value: 'Numero di eventi', angle: -90, position: 'insideLeft', fill: '#666' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Legend />
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