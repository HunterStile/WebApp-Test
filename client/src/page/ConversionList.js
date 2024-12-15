import React, { useContext, useState } from 'react';
import { ConversionContext } from '../context/ConversionContext';

const ConversionList = () => {
  const { conversions, loading, error, updateConversions } = useContext(ConversionContext);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const newCount = await updateConversions();
      alert(`Aggiornamento completato. Nuove conversioni: ${newCount}`);
    } catch (err) {
      alert('Errore durante l\'aggiornamento');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Caricamento conversioni...</div>;
  if (error) return <div>Errore: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Conversioni Affiliate</h1>
        <button
          onClick={handleUpdate}
          disabled={updating}
          className={`
            px-4 py-2 rounded 
            ${updating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}
          `}
        >
          {updating ? 'Aggiornamento...' : 'Aggiorna Conversioni'}
        </button>
      </div>

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
                <tr key={conv.conversion_id || conv._id} className="hover:bg-gray-50">
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
                        ${conv.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}
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
