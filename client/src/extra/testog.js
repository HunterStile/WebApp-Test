import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const AnalisiAcquisti = () => {
  const [viewType, setViewType] = useState('table');

  const dati = useMemo(() => {
    // Dati estratti dal documento con correzioni date
    const acquisti = [
      { data: '01/09/2025', totaleGrammi: 66, totaleEuro: 650, stato: 'pagato' },
      { data: '13/07/2025', totaleGrammi: 47.5, totaleEuro: 520, stato: 'pagato' },
      { data: '12/05/2025', totaleGrammi: 54.8, totaleEuro: 530, stato: 'pagato' },
      { data: '17/03/2025', totaleGrammi: 54.4, totaleEuro: 490, stato: 'pagato' },
      { data: '04/02/2024', totaleGrammi: 52.1, totaleEuro: 380, stato: 'pagato' }, // Corretto da 1998
      { data: '13/01/2024', totaleGrammi: 42.2, totaleEuro: 360, stato: 'pagato' }, // Corretto: era febbraio
      { data: '18/11/2024', totaleGrammi: 46.8, totaleEuro: 415, stato: 'pagato' },
      { data: '16/09/2024', totaleGrammi: 12.8, totaleEuro: 100, stato: 'pagato' },
      { data: '22/07/2024', totaleGrammi: 50.6, totaleEuro: 420, stato: 'pagato' },
      { data: '11/06/2024', totaleGrammi: 54.8, totaleEuro: 425, stato: 'pagato' },
      { data: '25/04/2024', totaleGrammi: 48.3, totaleEuro: 350, stato: 'pagato' },
      { data: '19/03/2024', totaleGrammi: 51.3, totaleEuro: 415, stato: 'pagato' }
    ];

    // Raggruppo per mese/anno
    const raggruppati = acquisti.reduce((acc, item) => {
      const [giorno, mese, anno] = item.data.split('/');
      const chiave = `${mese}/${anno}`;
      
      if (!acc[chiave]) {
        acc[chiave] = {
          mese,
          anno,
          totaleGrammi: 0,
          totaleEuro: 0,
          numeroOrdini: 0
        };
      }
      
      acc[chiave].totaleGrammi += item.totaleGrammi;
      acc[chiave].totaleEuro += item.totaleEuro;
      acc[chiave].numeroOrdini += 1;
      
      return acc;
    }, {});

    // Converto in array e ordino per data
    return Object.values(raggruppati)
      .map(item => ({
        ...item,
        meseAnno: `${item.mese}/${item.anno}`,
        prezzoMedio: item.totaleEuro / item.totaleGrammi
      }))
      .sort((a, b) => {
        const dateA = new Date(a.anno, a.mese - 1);
        const dateB = new Date(b.anno, b.mese - 1);
        return dateA - dateB;
      });
  }, []);

  const totali = useMemo(() => {
    return {
      grammi: dati.reduce((sum, item) => sum + item.totaleGrammi, 0),
      euro: dati.reduce((sum, item) => sum + item.totaleEuro, 0),
      ordini: dati.reduce((sum, item) => sum + item.numeroOrdini, 0)
    };
  }, [dati]);

  const totali2024 = useMemo(() => {
    const dati2024 = dati.filter(item => item.anno === '2024');
    return {
      grammi: dati2024.reduce((sum, item) => sum + item.totaleGrammi, 0),
      euro: dati2024.reduce((sum, item) => sum + item.totaleEuro, 0),
      ordini: dati2024.reduce((sum, item) => sum + item.numeroOrdini, 0)
    };
  }, [dati]);

  const totali2025 = useMemo(() => {
    const dati2025 = dati.filter(item => item.anno === '2025');
    return {
      grammi: dati2025.reduce((sum, item) => sum + item.totaleGrammi, 0),
      euro: dati2025.reduce((sum, item) => sum + item.totaleEuro, 0),
      ordini: dati2025.reduce((sum, item) => sum + item.numeroOrdini, 0)
    };
  }, [dati]);

  const mesiNome = {
    '01': 'Gennaio', '02': 'Febbraio', '03': 'Marzo', '04': 'Aprile',
    '05': 'Maggio', '06': 'Giugno', '07': 'Luglio', '08': 'Agosto',
    '09': 'Settembre', '10': 'Ottobre', '11': 'Novembre', '12': 'Dicembre'
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Analisi Acquisti per Mese/Anno</h1>
        <p className="text-slate-600">Tutti gli ordini sono considerati pagati (stato "pagato" o "si" o "no")</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Riepilogo Totale</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Totale Grammi</div>
            <div className="text-3xl font-bold">{totali.grammi.toFixed(1)}g</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Totale Euro</div>
            <div className="text-3xl font-bold">€{totali.euro.toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Numero Ordini</div>
            <div className="text-3xl font-bold">{totali.ordini}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-100 rounded-lg p-4">
            <h3 className="font-semibold text-slate-700 mb-3">Anno 2024</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Grammi:</span>
                <span className="font-semibold text-slate-800">{totali2024.grammi.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Euro:</span>
                <span className="font-semibold text-slate-800">€{totali2024.euro.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Ordini:</span>
                <span className="font-semibold text-slate-800">{totali2024.ordini}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Prezzo medio:</span>
                <span className="font-semibold text-slate-800">€{(totali2024.euro / totali2024.grammi).toFixed(2)}/g</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-4">
            <h3 className="font-semibold text-slate-700 mb-3">Anno 2025</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Grammi:</span>
                <span className="font-semibold text-slate-800">{totali2025.grammi.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Euro:</span>
                <span className="font-semibold text-slate-800">€{totali2025.euro.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Ordini:</span>
                <span className="font-semibold text-slate-800">{totali2025.ordini}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Prezzo medio:</span>
                <span className="font-semibold text-slate-800">€{(totali2025.euro / totali2025.grammi).toFixed(2)}/g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewType('table')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewType === 'table'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Tabella
          </button>
          <button
            onClick={() => setViewType('chart')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewType === 'chart'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Grafico a Barre
          </button>
          <button
            onClick={() => setViewType('line')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewType === 'line'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Andamento
          </button>
        </div>

        {viewType === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300">
                  <th className="text-left p-3 font-semibold text-slate-700">Mese/Anno</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Grammi Totali</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Euro Totali</th>
                  <th className="text-right p-3 font-semibold text-slate-700">N° Ordini</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Prezzo Medio €/g</th>
                </tr>
              </thead>
              <tbody>
                {dati.map((item, index) => (
                  <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-slate-800">
                      {mesiNome[item.mese]} {item.anno}
                    </td>
                    <td className="text-right p-3 text-slate-700">{item.totaleGrammi.toFixed(1)}g</td>
                    <td className="text-right p-3 text-slate-700">€{item.totaleEuro.toFixed(2)}</td>
                    <td className="text-right p-3 text-slate-700">{item.numeroOrdini}</td>
                    <td className="text-right p-3 text-slate-700">€{item.prezzoMedio.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td className="p-3 text-slate-800">TOTALE</td>
                  <td className="text-right p-3 text-slate-800">{totali.grammi.toFixed(1)}g</td>
                  <td className="text-right p-3 text-slate-800">€{totali.euro.toFixed(2)}</td>
                  <td className="text-right p-3 text-slate-800">{totali.ordini}</td>
                  <td className="text-right p-3 text-slate-800">€{(totali.euro / totali.grammi).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {viewType === 'chart' && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dati}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="meseAnno" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis yAxisId="left" label={{ value: 'Grammi', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Euro', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="totaleGrammi" fill="#3b82f6" name="Grammi" />
              <Bar yAxisId="right" dataKey="totaleEuro" fill="#10b981" name="Euro" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {viewType === 'line' && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dati}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="meseAnno" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis yAxisId="left" label={{ value: 'Grammi', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: '€/g', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="totaleGrammi" stroke="#3b82f6" strokeWidth={2} name="Grammi" />
              <Line yAxisId="right" type="monotone" dataKey="prezzoMedio" stroke="#f59e0b" strokeWidth={2} name="Prezzo Medio €/g" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Note</h2>
        <ul className="space-y-2 text-slate-600">
          <li>• Tutti gli ordini sono considerati pagati indipendentemente dallo stato indicato</li>
          <li>• I dati includono 12 ordini totali: 8 nel 2024 e 4 nel 2025</li>
          <li>• Il prezzo medio è calcolato come rapporto tra euro totali e grammi totali</li>
          <li>• Date corrette: 04/02/1998 → 04/02/2024 e 13/01/2024 era in realtà gennaio 2024</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalisiAcquisti;