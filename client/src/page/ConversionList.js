import React, { useContext, useState } from 'react';
import { ConversionContext } from '../context/ConversionContext';

const ConversionList = () => {
  const { conversions, loading, error } = useContext(ConversionContext);

  if (loading) return <div>Caricamento conversioni...</div>;
  if (error) return <div>Errore: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      {conversions.length === 0 ? (
        <div className="text-center text-gray-500">Nessuna conversione trovata</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID Conversione</th>
                <th className="p-2 border">Nome Campagna</th>
                <th className="p-2 border">Data</th>
                <th className="p-2 border">Tipo</th>
                <th className="p-2 border">Stato</th>
                <th className="p-2 border">Commissione</th>
                <th className="p-2 border">Stato Campagnia</th>
              </tr>
            </thead>
            <tbody>
              {conversions.map((conv) => (
                <tr key={conv.conversion_id || conv._id} className="text-white hover:bg-gray-50">
                  <td className="p-2 border">{conv.conversion_id}</td>
                  <td className="p-2 border">{conv.campaign_name}</td>
                  <td className="p-2 border">
                    {new Date(conv.date).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-2 border">{conv.type}</td>
                  <td className="p-2 border">
                    <span
                      className={`
                        px-2 py-1 rounded text-xs
                        ${conv.status === 'paid' 
                            ? 'bg-green-300 text-green-800' 
                            : conv.status === 'validated'
                            ? 'bg-green-100 text-green-800' 
                            : conv.status === 'refused'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'}
                      `}
                    >
                      {conv.status}
                    </span>
                  </td>
                  <td className="p-2 border">{conv.commission}</td>
                  <td className="p-2 border">{conv.campaign_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConversionList;
