import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CommissionsChart = ({ data, viewMode }) => {
  const xDataKey = viewMode === 'yearly' ? 'year' : 'monthLabel';

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold mb-4 text-white">
        {viewMode === 'yearly' ? 'Andamento Annuale Commissioni' : 'Andamento Mensile Commissioni'}
      </h2>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey={xDataKey}
              tick={{ fill: 'white' }}
              angle={viewMode === 'yearly' ? 0 : -45}
              textAnchor={viewMode === 'yearly' ? 'middle' : 'end'}
              height={viewMode === 'yearly' ? 30 : 70}
            />
            <YAxis
              tick={{ fill: 'white' }}
              label={{ value: '€', angle: -90, position: 'insideLeft', fill: 'white' }}
            />
            <Tooltip
              formatter={(value, name) => [
                `€ ${value}`,
                name === 'paidCommissions' ? 'Pagate' :
                  name === 'onholdCommissions' ? 'In Attesa' : 'Convalidate'
              ]}
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend
              formatter={(value) =>
                value === 'paidCommissions' ? 'Pagate' :
                  value === 'onholdCommissions' ? 'In Attesa' : 'Convalidate'
              }
            />
            <Bar dataKey="paidCommissions" stackId="a" fill="#09895e" />
            <Bar dataKey="onholdCommissions" stackId="a" fill="#F59E0B" />
            <Bar dataKey="validatedCommissions" stackId="a" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CommissionsChart;