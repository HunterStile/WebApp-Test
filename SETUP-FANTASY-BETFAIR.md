# 🚀 Guida Completa - Fantasy Team & Betflag Exchange Oddsmatcher

## 📋 Cosa abbiamo fatto:

✅ **Creato lo scraper Python** con Selenium per raccogliere quote da:
   - Fantasy Team (bookmaker)
   - Betfair Exchange (come bancata - nota: il codice usa Betfair ma puoi adattarlo a Betflag)

✅ **Creato API Flask** per esporre i dati con caching automatico

✅ **Integrato nel backend Node.js** con nuove routes

✅ **Creato componente React** per visualizzare le opportunità

✅ **Aggiornato routing e navigazione**

---

## 📝 PASSI DA SEGUIRE:

### **PASSO 1: Installare Python e dipendenze** 🐍

1. Assicurati di avere **Python 3.8+** installato
2. Apri PowerShell e vai nella cartella scraper:
   ```powershell
   cd c:\Users\Luigi\Desktop\GITHUB\WebApp-Test\scraper
   ```

3. Installa le dipendenze:
   ```powershell
   pip install -r requirements.txt
   ```

---

### **PASSO 2: Identificare i selettori CSS corretti** 🔍

⚠️ **IMPORTANTE**: Gli selettori CSS nello scraper sono PLACEHOLDER e devono essere aggiustati!

1. Esegui lo script di ispezione:
   ```powershell
   python inspect_selectors.py
   ```

2. Scegli "3" per ispezionare entrambi i siti

3. **Per ogni sito**:
   - Si aprirà Chrome con la pagina
   - Premi **F12** per aprire Developer Tools
   - Usa l'ispettore (**Ctrl+Shift+C**) per selezionare:
     * Container della partita
     * Nomi delle squadre (casa e trasferta)
     * Quote 1, X, 2
     * Orario/data della partita

4. **Annota i selettori CSS** che trovi (esempio):
   ```
   Fantasy Team:
   - Container partita: .match-item
   - Nome squadra casa: .team-home .name
   - Nome squadra trasferta: .team-away .name
   - Quota 1: .odds .odd-1
   - Quota X: .odds .odd-x
   - Quota 2: .odds .odd-2
   - Data/ora: .match-time
   ```

5. **Modifica `scraper.py`** con i selettori corretti:
   - Cerca la funzione `_extract_fantasy_team_match()`
   - Sostituisci i placeholder con i tuoi selettori
   - Fai lo stesso per `_extract_betfair_match()`

---

### **PASSO 3: Testare lo scraper** 🧪

1. Testa lo scraper in modalità standalone:
   ```powershell
   python scraper.py
   ```

2. Se funziona, verrà creato un file `scraped_odds.json` con i dati

3. **Se non funziona**:
   - Controlla gli errori nel terminale
   - Aggiusta i selettori CSS
   - Riprova

---

### **PASSO 4: Avviare l'API Flask** 🌐

1. Una volta che lo scraper funziona, avvia l'API:
   ```powershell
   python api.py
   ```

2. L'API sarà disponibile su `http://localhost:5000`

3. Testa che funzioni aprendo:
   - http://localhost:5000/api/health (deve rispondere con status: healthy)
   - http://localhost:5000/api/odds/fantasy-betfair (avvia lo scraping)

---

### **PASSO 5: Avviare il backend Node.js** 🟢

1. Apri un **NUOVO terminale PowerShell**

2. Vai nella cartella server:
   ```powershell
   cd c:\Users\Luigi\Desktop\GITHUB\WebApp-Test\server
   ```

3. Avvia il server:
   ```powershell
   node app.js
   ```

---

### **PASSO 6: Avviare il frontend React** ⚛️

1. Apri un **ALTRO terminale PowerShell**

2. Vai nella cartella client:
   ```powershell
   cd c:\Users\Luigi\Desktop\GITHUB\WebApp-Test\client
   ```

3. Avvia React:
   ```powershell
   npm start
   ```

4. Apri il browser su `http://localhost:3000`

5. Vai su **Fantasy ⚡ Betflag** dal menu

---

## 🎯 Come Usare l'Oddsmatcher:

1. **Al primo carico**, i dati potrebbero non essere disponibili (scraping in corso)
2. Attendi **30-60 secondi** e ricarica la pagina
3. Vedrai una tabella con tutte le opportunità ordinate per **Rating**
4. **Rating > 100%** = Arbitraggio garantito! 💰
5. Clicca **Refresh** per aggiornare manualmente i dati
6. I dati vengono cachati per **15 minuti**

---

## 🔧 Personalizzazioni Possibili:

### Cambiare il tempo di cache:
In `scraper/api.py`, linea 14:
```python
CACHE_DURATION = 900  # 15 minuti in secondi
```

### Cambiare la commissione di Betfair:
In `client/src/page/FantasyBetfair.js`, nella funzione `calculateDetails`:
```javascript
const calculateDetails = (ftOdd, bfOdd, stake = 100, commission = 0.05)
```

### Aggiungere più selettori:
Se i siti hanno strutture diverse per campionati diversi, puoi aggiungere logica condizionale in `scraper.py`

---

## ⚠️ Note Importanti:

1. **Lo scraping può essere lento** (30-60 secondi per caricamento pagine)
2. **Non fare troppo scraping** per evitare di essere bloccati dai siti
3. **Usa un VPN** se necessario
4. **I selettori CSS possono cambiare** quando i siti aggiornano il design
5. **Betfair potrebbe richiedere login** - in quel caso dovrai implementare l'autenticazione

---

## 📊 Endpoints API disponibili:

- `GET /api/odds/fantasy-betfair` - Ottieni opportunità
- `POST /api/odds/fantasy-betfair/refresh` - Forza refresh
- `GET /api/odds/fantasy-betfair/status` - Stato scraper

---

## 🐛 Troubleshooting:

### "Flask scraper API is not running"
→ Avvia l'API Flask: `python scraper/api.py`

### "Scraping in progress"
→ Attendi 30-60 secondi e riprova

### "No opportunities found"
→ Controlla i selettori CSS in `scraper.py`

### Chrome driver error
→ Assicurati di avere Chrome installato, il driver si scarica automaticamente

---

## 🎓 Prossimi Miglioramenti:

- [ ] Implementare autenticazione per Betfair se necessario
- [ ] Aggiungere fuzzy matching per nomi squadre
- [ ] Implementare notifiche per opportunità > 100%
- [ ] Aggiungere supporto per altri mercati (Over/Under, ecc.)
- [ ] Creare dashboard con statistiche

---

## 📞 Hai bisogno di aiuto?

Se qualcosa non funziona:
1. Controlla i log del terminale
2. Verifica che tutti i servizi siano avviati (Flask, Node.js, React)
3. Controlla i selettori CSS
4. Testa lo scraper standalone prima

**Buona fortuna con il tuo oddsmatcher! 🍀💰**
