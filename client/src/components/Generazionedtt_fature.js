import React, { useState } from 'react';
import axios from 'axios';

function PDFToolkit() {
  const [extractedText, setExtractedText] = useState('');
  const [file, setFile] = useState(null);

  // Gestione upload PDF per OCR
  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  // Esegui OCR
  const performOCR = async () => {
    if (!file) {
      alert('Seleziona un file PDF');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await axios.post('/ocr-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setExtractedText(response.data.extractedText);
    } catch (error) {
      console.error('Errore OCR:', error);
    }
  };

  // Genera DDT
  const generateDDT = async () => {
    try {
      const response = await axios.post('/generate-ddt', {}, {
        responseType: 'blob'
      });
      
      // Crea link di download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'DDT_Generato.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Errore generazione DDT:', error);
    }
  };

  return (
    <div>
      <h1>PDF Toolkit</h1>
      
      {/* Sezione OCR */}
      <div>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileUpload} 
        />
        <button onClick={performOCR}>Esegui OCR</button>
        
        {extractedText && (
          <div>
            <h2>Testo Estratto:</h2>
            <pre>{extractedText}</pre>
          </div>
        )}
      </div>

      {/* Sezione Generazione DDT */}
      <div>
        <button onClick={generateDDT}>Genera DDT</button>
      </div>
    </div>
  );
}

export default PDFToolkit;