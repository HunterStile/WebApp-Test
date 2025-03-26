const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');


require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware per il CORS (importante per le API)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/DEGI', {
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const upload = multer({ dest: 'uploads/' });

// Rotta per generazione DDT
app.post('/generate-ddt', (req, res) => {
  try {
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'DDT_Generato.pdf');
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Intestazione
    doc.fontSize(16).text('DOCUMENTO DI TRASPORTO', { align: 'center' });
    doc.moveDown();

    // Dati aziendali
    doc.fontSize(10)
       .text('Azienda: Nome Azienda')
       .text('Indirizzo: Via Example 123')
       .text('P.IVA: 12345678901');

    doc.moveDown();

    // Dettagli DDT
    doc.fontSize(12)
       .text(`Numero DDT: ${Math.floor(Math.random() * 10000)}`)
       .text(`Data: ${new Date().toLocaleDateString()}`);

    doc.moveDown();

    // Tabella merci (esempio)
    doc.text('Descrizione Merci:', { underline: true });
    doc.text('- Mattoni: Quantità 10');
    doc.text('- Sabbia: Quantità 5');

    doc.end();

    writeStream.on('finish', () => {
      res.download(filePath, 'DDT_Generato.pdf', (err) => {
        if (err) {
          console.error('Errore nel download:', err);
          res.status(500).send('Errore nella generazione del DDT');
        }
        
        // Opzionale: rimuovi il file dopo il download
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Errore nella rimozione del file:', unlinkErr);
        });
      });
    });

  } catch (error) {
    console.error('Errore nella generazione del DDT:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rotta per OCR su PDF
app.post('/ocr-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const { worker } = tesseract;
    await worker.load();
    await worker.loadLanguage('ita');
    await worker.initialize('ita');

    const { data: { text } } = await worker.recognize(req.file.path);
    
    await worker.terminate();

    res.json({ extractedText: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotta per generazione Fattura
app.post('/generate-fattura', (req, res) => {
  try {
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'Fattura_Generata.pdf');
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Intestazione Fattura
    doc.fontSize(16).text('FATTURA', { align: 'center', underline: true });
    doc.moveDown();

    // Dati Azienda Emittente
    doc.fontSize(10)
       .text('Azienda Emittente: Nome Azienda Srl')
       .text('Indirizzo: Via Innovazione 45')
       .text('P.IVA: 12345678901')
       .text('Codice SDI: ABCDEFG');

    doc.moveDown();

    // Dati Cliente
    doc.text('Spett.le: Nome Società Cliente')
       .text('Indirizzo: Via Libertà 123')
       .text('P.IVA: 09876543210');

    doc.moveDown();

    // Dettagli Fattura
    doc.fontSize(12)
       .text(`Numero Fattura: FA-${Math.floor(Math.random() * 10000)}`)
       .text(`Data: ${new Date().toLocaleDateString()}`);

    doc.moveDown();

    // Tabella Articoli
    const articoli = [
      { descrizione: 'Servizio Consulenza', quantita: 2, prezzo: 500 },
      { descrizione: 'Sviluppo Software', quantita: 1, prezzo: 1500 }
    ];

    // Intestazione Tabella
    doc.fontSize(10)
       .text('Descrizione', 50, doc.y, { width: 250, align: 'left' })
       .text('Quantità', 300, doc.y, { width: 100, align: 'right' })
       .text('Prezzo', 400, doc.y, { width: 100, align: 'right' })
       .text('Totale', 500, doc.y, { width: 100, align: 'right' });

    doc.moveDown();
    doc.strokeColor('#000').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Righe Articoli
    let totaleImponibile = 0;
    articoli.forEach(articolo => {
      const totaleRiga = articolo.quantita * articolo.prezzo;
      totaleImponibile += totaleRiga;

      doc.text(articolo.descrizione, 50, doc.y, { width: 250, align: 'left' })
         .text(articolo.quantita.toString(), 300, doc.y, { width: 100, align: 'right' })
         .text(`€ ${articolo.prezzo.toFixed(2)}`, 400, doc.y, { width: 100, align: 'right' })
         .text(`€ ${totaleRiga.toFixed(2)}`, 500, doc.y, { width: 100, align: 'right' });
      
      doc.moveDown();
    });

    // Calcoli IVA
    const aliquotaIVA = 0.22;
    const importoIVA = totaleImponibile * aliquotaIVA;
    const totaleDocumento = totaleImponibile + importoIVA;

    doc.moveDown();
    doc.strokeColor('#000').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Totali
    doc.text('Imponibile', 400, doc.y, { width: 100, align: 'left' })
       .text(`€ ${totaleImponibile.toFixed(2)}`, 500, doc.y, { width: 100, align: 'right' });
    
    doc.moveDown();
    
    doc.text('IVA 22%', 400, doc.y, { width: 100, align: 'left' })
       .text(`€ ${importoIVA.toFixed(2)}`, 500, doc.y, { width: 100, align: 'right' });
    
    doc.moveDown();
    
    doc.fontSize(12).text('Totale Fattura', 400, doc.y, { width: 100, align: 'left' })
       .text(`€ ${totaleDocumento.toFixed(2)}`, 500, doc.y, { width: 100, align: 'right' });

    // Note
    doc.fontSize(8).text('Fattura emessa in formato digitale', 50, doc.page.height - 50);

    doc.end();

    writeStream.on('finish', () => {
      res.download(filePath, 'Fattura_Generata.pdf', (err) => {
        if (err) {
          console.error('Errore nel download:', err);
          res.status(500).send('Errore nella generazione della fattura');
        }
        
        // Rimuovi il file dopo il download
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Errore nella rimozione del file:', unlinkErr);
        });
      });
    });

  } catch (error) {
    console.error('Errore nella generazione della fattura:', error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

