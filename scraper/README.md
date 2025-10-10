# Fantasy Team & Betfair Exchange Scraper

Questo scraper raccoglie le quote da Fantasy Team e Betfair Exchange per trovare opportunità di arbitraggio.

## Installazione

1. Assicurati di avere Python 3.8+ installato
2. Installa le dipendenze:

```bash
pip install -r requirements.txt
```

## Utilizzo

### Test Scraper (Modalità Standalone)

Per testare lo scraper e vedere i risultati in un file JSON:

```bash
python scraper.py
```

Questo creerà un file `scraped_odds.json` con i dati raccolti.

### Avvio API Flask

Per avviare l'API che espone i dati:

```bash
python api.py
```

L'API sarà disponibile su `http://localhost:5000`

## Endpoints API

- `GET /api/odds/fantasy-betfair` - Ottieni le opportunità di arbitraggio
- `POST /api/odds/refresh` - Forza un refresh dei dati
- `GET /api/odds/status` - Stato dello scraper
- `GET /api/health` - Health check

## Note Importanti

⚠️ **ATTENZIONE**: Gli selettori CSS nello scraper sono **placeholder** e devono essere aggiustati in base alla struttura HTML reale dei siti.

### Come aggiustare i selettori:

1. Apri lo scraper in modalità non-headless:
   ```python
   scraper = OddsScraper(headless=False)
   ```

2. Osserva come il browser apre le pagine

3. Usa gli strumenti di sviluppo del browser (F12) per ispezionare gli elementi HTML

4. Modifica i selettori in `scraper.py`:
   - `_extract_fantasy_team_match()` per Fantasy Team
   - `_extract_betfair_match()` per Betfair Exchange

5. Cerca elementi come:
   - Nomi delle squadre
   - Quote (1, X, 2)
   - Data/ora della partita
   - Container delle partite

## Integrazione con Node.js Backend

Il backend Node.js chiamerà l'API Flask per ottenere i dati. Vedi `server/routes/odds.js` per l'integrazione.

## Cache

I dati vengono cachati per 15 minuti per evitare troppo scraping e non sovraccaricare i siti.
