import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const AnalisiAcquisti = () => {
  const [viewType, setViewType] = useState('table');

  const dati = useMemo(() => {
    // Dati estratti dal documento con correzioni date
    const acquisti = [
      { 
        data: '01/09/2025', 
        totaleGrammi: 96, 
        totaleEuro: 600, 
        totaleVenduto: 650, // AGGIUNGI QUI IL RICAVO DALLE VENDITE
        stato: 'pagato',
        regaliGrammi: 1.5,
        grammiEffettivi: 66,
        rimanentiGrammi: 0
      },
      { 
        data: '13/07/2025', 
        totaleGrammi: 96, 
        totaleEuro: 600, 
        totaleVenduto: 520, // AGGIUNGI QUI IL RICAVO DALLE VENDITE
        stato: 'pagato',
        regaliGrammi: 0.7,
        grammiEffettivi: 47.5,
        rimanentiGrammi: 0
      },
      { 
        data: '12/05/2025', 
        totaleGrammi: 97, 
        totaleEuro: 600, 
        totaleVenduto: 530, // AGGIUNGI QUI IL RICAVO DALLE VENDITE
        stato: 'pagato',
        regaliGrammi: 2.5,
        grammiEffettivi: 54.8,
        rimanentiGrammi: 0
      },
      { 
        data: '17/03/2025', 
        totaleGrammi: 98, 
        totaleEuro: 550, 
        totaleVenduto: 490, // AGGIUNGI QUI IL RICAVO DALLE VENDITE
        stato: 'pagato',
        regaliGrammi: 1,
        grammiEffettivi: 54.4,
        rimanentiGrammi: 0
      },
      { 
        data: '04/02/2024', 
        totaleGrammi: 96, 
        totaleEuro: 450, 
        totaleVenduto: 380, // AGGIUNGI QUI IL RICAVO DALLE VENDITE
        stato: 'pagato',
        regaliGrammi: 3,
        grammiEffettivi: 52.1,
        rimanentiGrammi: 0
      },
      { 
        data: '13/01/2024', 
        totaleGrammi: 96, 
        totaleEuro: 450, 
        totaleVenduto: 360, // AGGIUNGI QUI IL RICAVO DALLE VENDITE
        stato: 'pagato',
        regaliGrammi: 0,
        grammiEffettivi: 42.2,
        rimanentiGrammi: 0
      },
      { 
        data: '18/11/2024', 
        totaleGrammi: 96, 
        totaleEuro: 550, 
        totaleVenduto: 415, // AGGIUNGI QUI IL RICAVO DALLE VENDITE
        stato: 'pagato',
        regaliGrammi: 15,
        grammiEffettivi: 46.8,
        rimanentiGrammi: 0
      },
      { 
        data: '16/09/2024', 
        totaleGrammi: 30, 
        totaleEuro: 150, 
        totaleVenduto: 100, // AGGIUNGI QUI IL RICAVO DALLE VENDITE
        stato: 'pagato',
        regaliGrammi: 12, // 2+1.5+6.5+1+1
        grammiEffettivi: 12.8,
        rimanentiGrammi: 0
      },
      { 
        data: '22/07/2024', 
        totaleGrammi: 98, 
        totaleEuro: 500, 
        totaleVenduto: 420, // AGGIUNGI QUI IL RICAVO DALLE VENDITE
        stato: 'pagato',
        regaliGrammi: 5.5, // 1+1+1+1+0.8+0.7
        grammiEffettivi: 50.6,
        rimanentiGrammi: 0
      },
      { 
        data: '11/06/2024', 
        totaleGrammi: 98, 
        totaleEuro: 500, 
        totaleVenduto: 425, // AGGIUNGI QUI IL RICAVO DALLE VENDITE
        stato: 'pagato',
        regaliGrammi: 3, // 1+1+1
        grammiEffettivi: 54.8,
        rimanentiGrammi: 0
      },
      { 
        data: '25/04/2024', 
        totaleGrammi: 97, 
        totaleEuro: 450, 
        totaleVenduto: 350, // AGGIUNGI QUI IL RICAVO DALLE VENDITE
        stato: 'pagato',
        regaliGrammi: 8.7, // 1+5+1.5+1.2
        grammiEffettivi: 48.3,
        rimanentiGrammi: 0
      },
      { 
        data: '19/03/2024', 
        totaleGrammi: 97, 
        totaleEuro: 450, 
        totaleVenduto: 415, // AGGIUNGI QUI IL RICAVO DALLE VENDITE
        stato: 'pagato',
        regaliGrammi: 3, // 1+1+1
        grammiEffettivi: 51.3,
        rimanentiGrammi: 0
      }
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
          totaleVenduto: 0,
          numeroOrdini: 0,
          regaliGrammi: 0,
          grammiEffettivi: 0
        };
      }
      
      acc[chiave].totaleGrammi += item.totaleGrammi;
      acc[chiave].totaleEuro += item.totaleEuro;
      acc[chiave].totaleVenduto += item.totaleVenduto;
      acc[chiave].numeroOrdini += 1;
      acc[chiave].regaliGrammi += item.regaliGrammi;
      acc[chiave].grammiEffettivi += item.grammiEffettivi;
      
      return acc;
    }, {});

    // Converto in array e ordino per data
    return Object.values(raggruppati)
      .map(item => {
        // grammiEffettivi sono i grammi VENDUTI
        const grammiVenduti = item.grammiEffettivi;
        // Uso personale = Totale - Regali - Venduti
        const usoPersonale = item.totaleGrammi - item.regaliGrammi - item.grammiEffettivi;
        const spesaAcquisto = item.totaleEuro; // Quanto hai speso per acquistare
        const ricavoVendite = item.totaleVenduto; // Quanto hai incassato dalle vendite
        const profitto = ricavoVendite - spesaAcquisto;
        const prezzoAcquisto = item.totaleEuro / item.totaleGrammi;
        const prezzoVendita = grammiVenduti > 0 ? item.totaleVenduto / grammiVenduti : 0;
        
        return {
          ...item,
          meseAnno: `${item.mese}/${item.anno}`,
          prezzoAcquisto,
          prezzoVendita,
          grammiVenduti,
          usoPersonale,
          spesaAcquisto,
          ricavoVendite,
          profitto
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.anno, a.mese - 1);
        const dateB = new Date(b.anno, b.mese - 1);
        return dateA - dateB;
      });
  }, []);

  const totali = useMemo(() => {
    return {
      grammi: dati.reduce((sum, item) => sum + item.totaleGrammi, 0),
      spesa: dati.reduce((sum, item) => sum + item.spesaAcquisto, 0),
      ricavo: dati.reduce((sum, item) => sum + item.ricavoVendite, 0),
      profitto: dati.reduce((sum, item) => sum + item.profitto, 0),
      ordini: dati.reduce((sum, item) => sum + item.numeroOrdini, 0),
      regali: dati.reduce((sum, item) => sum + item.regaliGrammi, 0),
      venduti: dati.reduce((sum, item) => sum + item.grammiVenduti, 0),
      usoPersonale: dati.reduce((sum, item) => sum + item.usoPersonale, 0)
    };
  }, [dati]);

  const totali2024 = useMemo(() => {
    const dati2024 = dati.filter(item => item.anno === '2024');
    return {
      grammi: dati2024.reduce((sum, item) => sum + item.totaleGrammi, 0),
      spesa: dati2024.reduce((sum, item) => sum + item.spesaAcquisto, 0),
      ricavo: dati2024.reduce((sum, item) => sum + item.ricavoVendite, 0),
      profitto: dati2024.reduce((sum, item) => sum + item.profitto, 0),
      ordini: dati2024.reduce((sum, item) => sum + item.numeroOrdini, 0),
      regali: dati2024.reduce((sum, item) => sum + item.regaliGrammi, 0),
      venduti: dati2024.reduce((sum, item) => sum + item.grammiVenduti, 0),
      usoPersonale: dati2024.reduce((sum, item) => sum + item.usoPersonale, 0)
    };
  }, [dati]);

  const totali2025 = useMemo(() => {
    const dati2025 = dati.filter(item => item.anno === '2025');
    return {
      grammi: dati2025.reduce((sum, item) => sum + item.totaleGrammi, 0),
      spesa: dati2025.reduce((sum, item) => sum + item.spesaAcquisto, 0),
      ricavo: dati2025.reduce((sum, item) => sum + item.ricavoVendite, 0),
      profitto: dati2025.reduce((sum, item) => sum + item.profitto, 0),
      ordini: dati2025.reduce((sum, item) => sum + item.numeroOrdini, 0),
      regali: dati2025.reduce((sum, item) => sum + item.regaliGrammi, 0),
      venduti: dati2025.reduce((sum, item) => sum + item.grammiVenduti, 0),
      usoPersonale: dati2025.reduce((sum, item) => sum + item.usoPersonale, 0)
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Analisi Acquisti e Vendite</h1>
        <p className="text-slate-600">Confronto tra grammi acquistati, venduti e uso personale</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Riepilogo Totale</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Grammi Acquistati</div>
            <div className="text-3xl font-bold">{totali.grammi.toFixed(1)}g</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Grammi Venduti</div>
            <div className="text-3xl font-bold">{totali.venduti.toFixed(1)}g</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Uso Personale</div>
            <div className="text-3xl font-bold">{totali.usoPersonale.toFixed(1)}g</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Regali</div>
            <div className="text-3xl font-bold">{totali.regali.toFixed(1)}g</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-100 rounded-lg p-4">
            <h3 className="font-semibold text-slate-700 mb-3">Costi e Ricavi</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Spesa Totale Acquisti:</span>
                <span className="font-semibold text-red-600">€{totali.spesa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Ricavo Totale Vendite:</span>
                <span className="font-semibold text-green-600">€{totali.ricavo.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-slate-600">Profitto:</span>
                <span className={`font-bold ${totali.profitto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{totali.profitto.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Prezzo Medio Acquisto:</span>
                <span className="font-semibold text-slate-800">€{(totali.spesa / totali.grammi).toFixed(2)}/g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Prezzo Medio Vendita:</span>
                <span className="font-semibold text-slate-800">
                  €{totali.venduti > 0 ? (totali.ricavo / totali.venduti).toFixed(2) : '0.00'}/g
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-4">
            <h3 className="font-semibold text-slate-700 mb-3">Distribuzione</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">% Venduto:</span>
                <span className="font-semibold text-slate-800">{((totali.venduti / totali.grammi) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">% Uso Personale:</span>
                <span className="font-semibold text-slate-800">{((totali.usoPersonale / totali.grammi) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">% Regali:</span>
                <span className="font-semibold text-slate-800">{((totali.regali / totali.grammi) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <h3 className="font-semibold text-slate-700 mb-3">Anno 2024</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Acquistati:</span>
                <span className="font-semibold text-slate-800">{totali2024.grammi.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Venduti:</span>
                <span className="font-semibold text-slate-800">{totali2024.venduti.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Uso Personale:</span>
                <span className="font-semibold text-slate-800">{totali2024.usoPersonale.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Regali:</span>
                <span className="font-semibold text-slate-800">{totali2024.regali.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-slate-600">Spesa:</span>
                <span className="font-semibold text-red-600">€{totali2024.spesa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Ricavo:</span>
                <span className="font-semibold text-green-600">€{totali2024.ricavo.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Profitto:</span>
                <span className={`font-bold ${totali2024.profitto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{totali2024.profitto.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <h3 className="font-semibold text-slate-700 mb-3">Anno 2025</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Acquistati:</span>
                <span className="font-semibold text-slate-800">{totali2025.grammi.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Venduti:</span>
                <span className="font-semibold text-slate-800">{totali2025.venduti.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Uso Personale:</span>
                <span className="font-semibold text-slate-800">{totali2025.usoPersonale.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Regali:</span>
                <span className="font-semibold text-slate-800">{totali2025.regali.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-slate-600">Spesa:</span>
                <span className="font-semibold text-red-600">€{totali2025.spesa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Ricavo:</span>
                <span className="font-semibold text-green-600">€{totali2025.ricavo.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Profitto:</span>
                <span className={`font-bold ${totali2025.profitto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{totali2025.profitto.toFixed(2)}
                </span>
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
            Tabella Dettagliata
          </button>
          <button
            onClick={() => setViewType('chart')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewType === 'chart'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Distribuzione
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
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300">
                  <th className="text-left p-3 font-semibold text-slate-700">Mese/Anno</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Acquistati</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Venduti</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Uso Pers.</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Regali</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Spesa</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Ricavo</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Profitto</th>
                </tr>
              </thead>
              <tbody>
                {dati.map((item, index) => (
                  <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-slate-800">
                      {mesiNome[item.mese]} {item.anno}
                    </td>
                    <td className="text-right p-3 text-slate-700">{item.totaleGrammi.toFixed(1)}g</td>
                    <td className="text-right p-3 text-green-700 font-semibold">{item.grammiVenduti.toFixed(1)}g</td>
                    <td className="text-right p-3 text-orange-700">{item.usoPersonale.toFixed(1)}g</td>
                    <td className="text-right p-3 text-purple-700">{item.regaliGrammi.toFixed(1)}g</td>
                    <td className="text-right p-3 text-red-600">€{item.spesaAcquisto.toFixed(2)}</td>
                    <td className="text-right p-3 text-green-600">€{item.ricavoVendite.toFixed(2)}</td>
                    <td className={`text-right p-3 font-semibold ${item.profitto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{item.profitto.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td className="p-3 text-slate-800">TOTALE</td>
                  <td className="text-right p-3 text-slate-800">{totali.grammi.toFixed(1)}g</td>
                  <td className="text-right p-3 text-green-700">{totali.venduti.toFixed(1)}g</td>
                  <td className="text-right p-3 text-orange-700">{totali.usoPersonale.toFixed(1)}g</td>
                  <td className="text-right p-3 text-purple-700">{totali.regali.toFixed(1)}g</td>
                  <td className="text-right p-3 text-red-600">€{totali.spesa.toFixed(2)}</td>
                  <td className="text-right p-3 text-green-600">€{totali.ricavo.toFixed(2)}</td>
                  <td className={`text-right p-3 ${totali.profitto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{totali.profitto.toFixed(2)}
                  </td>
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
              <YAxis label={{ value: 'Grammi', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="grammiVenduti" stackId="a" fill="#10b981" name="Venduti" />
              <Bar dataKey="usoPersonale" stackId="a" fill="#f97316" name="Uso Personale" />
              <Bar dataKey="regaliGrammi" stackId="a" fill="#a855f7" name="Regali" />
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
              <YAxis label={{ value: 'Grammi', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totaleGrammi" stroke="#3b82f6" strokeWidth={2} name="Acquistati" />
              <Line type="monotone" dataKey="grammiVenduti" stroke="#10b981" strokeWidth={2} name="Venduti" />
              <Line type="monotone" dataKey="usoPersonale" stroke="#f97316" strokeWidth={2} name="Uso Personale" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Note</h2>
        <ul className="space-y-2 text-slate-600">
          <li>• <strong>Grammi Acquistati:</strong> Totale grammi comprati dal fornitore</li>
          <li>• <strong>Grammi Venduti:</strong> Grammi effettivamente venduti ai clienti (campo "effettivi" nel documento)</li>
          <li>• <strong>Uso Personale:</strong> Grammi consumati personalmente (Acquistati - Venduti - Regali)</li>
          <li>• <strong>Regali:</strong> Grammi regalati ai clienti</li>
          <li>• <strong>Spesa:</strong> Quanto hai speso per acquistare dal fornitore (campo "totaleEuro")</li>
          <li>• <strong>Ricavo:</strong> Quanto hai incassato dalle vendite ai clienti (campo "totaleVenduto")</li>
          <li>• <strong>Profitto:</strong> Differenza tra Ricavo e Spesa (Ricavo - Spesa)</li>
          <li className="text-orange-600 font-semibold">⚠️ Ricordati di compilare il campo "totaleVenduto" per ogni ordine!</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalisiAcquisti;