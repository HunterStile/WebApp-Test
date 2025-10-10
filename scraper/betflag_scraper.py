"""
Scraper specifico per Betflag Exchange
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time
import json
import os
import re


class BetflagScraper:
    def __init__(self, headless=True):
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless')
        
        # Opzioni anti-detection
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument('--disable-infobars')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        chromedriver_path = os.path.join(os.path.dirname(__file__), 'chromedriver.exe')
        
        if os.path.exists(chromedriver_path):
            service = Service(chromedriver_path)
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
        else:
            self.driver = webdriver.Chrome(options=chrome_options)
        
        # Nascondi proprietà WebDriver
        self.driver.execute_cdp_cmd('Network.setUserAgentOverride', {
            "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    def scrape_betflag_exchange(self):
        """Scrape Betflag Exchange"""
        print("🎯 Scraping Betflag Exchange...")
        
        # URL di Betflag Exchange
        url = "https://www.betflag.it/exchange"
        
        try:
            self.driver.get(url)
            print("⏳ Attendo caricamento pagina...")
            time.sleep(10)
            
            # Cerca iframe
            iframes = self.driver.find_elements(By.TAG_NAME, "iframe")
            print(f"   Trovati {len(iframes)} iframe")
            
            matches = []
            
            # Prova a switchare nell'iframe principale
            for i, iframe in enumerate(iframes):
                try:
                    src = iframe.get_attribute('src')
                    print(f"   Iframe {i+1}: {src[:80] if src else 'no-src'}...")
                    
                    # Se l'iframe contiene "mstxchange" è quello giusto
                    if src and 'mstxchange' in src:
                        print(f"   ✓ Trovato iframe exchange, entro...")
                        self.driver.switch_to.frame(iframe)
                        print(f"   ⏳ Attendo caricamento contenuto iframe (15 secondi)...")
                        time.sleep(15)  # Aumentato tempo di attesa
                        
                        # Ora cerca le partite dentro l'iframe
                        matches = self._scrape_from_iframe()
                        
                        # Torna al contesto principale
                        self.driver.switch_to.default_content()
                        
                        if matches:
                            break
                except Exception as e:
                    print(f"   ⚠️ Errore con iframe {i+1}: {str(e)[:50]}")
                    self.driver.switch_to.default_content()
                    continue
            
            if not matches:
                print("   ⚠️ Nessuna partita trovata negli iframe")
            
            print(f"✅ Trovate {len(matches)} partite su Betflag Exchange")
            
            for i, match in enumerate(matches[:5], 1):
                print(f"  {i}. {match['home_team']} vs {match['away_team']}")
            
            return matches
            
        except Exception as e:
            print(f"❌ Errore: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def _scrape_from_iframe(self):
        """Scrape dati dall'interno dell'iframe"""
        print("   🔍 Ricerca partite nell'iframe...")
        
        matches = []
        
        # Usa i selettori specifici di Betflag
        try:
            # Cerca il container principale
            header_bets = self.driver.find_elements(By.CLASS_NAME, "headerBets")
            print(f"   📊 Trovati {len(header_bets)} headerBets")
            
            # Cerca le righe evento
            event_rows = self.driver.find_elements(By.CSS_SELECTOR, ".d-flex.row-e")
            print(f"   📊 Trovati {len(event_rows)} eventi")
            
            if not event_rows:
                # Prova selettori alternativi
                event_rows = self.driver.find_elements(By.CSS_SELECTOR, ".event, .eventcontent, .details, .match")
                print(f"   📊 [Alt] Trovati {len(event_rows)} eventi")
            
            for idx, row in enumerate(event_rows[:30]):  # Limite a 30 partite
                try:
                    # Debug: mostra il testo della riga
                    if idx < 3:  # Mostra solo le prime 3 per non spammare
                        print(f"   🔍 Riga {idx+1} testo: {row.text[:100]}")
                    
                    match_data = self._extract_from_betflag_row(row)
                    if match_data and match_data not in matches:
                        matches.append(match_data)
                        print(f"   ✓ {match_data['home_team']} vs {match_data['away_team']}")
                except Exception as e:
                    if idx < 3:
                        print(f"   ⚠️ Errore riga {idx+1}: {str(e)[:50]}")
                    continue
            
        except Exception as e:
            print(f"   ⚠️ Errore nella ricerca: {str(e)[:80]}")
        
        return matches
    
    def _extract_from_betflag_row(self, row):
        """Estrai dati da una riga evento Betflag"""
        try:
            text = row.text
            
            # METODO 1: Cerca dentro div.match -> class="da" (nomi squadre)
            home_team = None
            away_team = None
            
            try:
                # Cerca il div.match dentro la riga
                match_div = row.find_element(By.CSS_SELECTOR, "div.match")
                # Cerca tutti gli elementi con class="da" (nomi squadre)
                team_elements = match_div.find_elements(By.CSS_SELECTOR, ".da")
                
                if len(team_elements) >= 2:
                    home_team = team_elements[0].text.strip()
                    away_team = team_elements[1].text.strip()
            except:
                pass
            
            # METODO 2 (FALLBACK): Pattern Betflag - squadre consecutive su righe
            if not home_team or not away_team:
                lines = text.split('\n')
                for i, line in enumerate(lines):
                    line_clean = line.strip()
                    # Salta intestazioni, categorie e dati
                    if line_clean and len(line_clean) > 3 and \
                       'WORLD CUP' not in line_clean and 'PUNTA' not in line_clean and \
                       'OGGI' not in line_clean and ':' not in line_clean and \
                       'AMICHEVOLI' not in line_clean and 'LEAGUE' not in line_clean and \
                       'LIGA' not in line_clean and 'J3' not in line_clean and \
                       not line_clean.replace('.','').replace(',','').isdigit() and \
                       line_clean[0] not in '0123456789':
                        # Prima squadra trovata
                        if not home_team:
                            home_team = line_clean
                        # Seconda squadra (riga successiva)
                        elif not away_team:
                            away_team = line_clean
                            break
            
            if not home_team or not away_team:
                return None
            
            # Pulisci nomi
            home_team = re.sub(r'\d{2}:\d{2}|\d{2}/\d{2}', '', home_team).strip()
            away_team = re.sub(r'\d{2}:\d{2}|\d{2}/\d{2}', '', away_team).strip()
            
            if len(home_team) < 3 or len(away_team) < 3:
                return None
            
            # Cerca SOLO le quote BANCATE (LAY) - classe "ban oddcnt"
            lay_odds = []
            try:
                # IMPORTANTE: Cerca solo elementi con classe "ban oddcnt" (non "pun oddcnt"!)
                ban_elements = row.find_elements(By.CSS_SELECTOR, "div.ban.oddcnt")
                
                for ban_elem in ban_elements:
                    odd_text = ban_elem.text.strip()
                    
                    # Estrai SOLO il numero (es. "2.50" o "2,50")
                    odd_match = re.search(r'(\d+[.,]\d+)', odd_text)
                    if odd_match:
                        odd_value = float(odd_match.group(1).replace(',', '.'))
                        # Accetta tutte le quote valide (1.01 - 1000)
                        if 1.01 <= odd_value <= 1000:
                            lay_odds.append(odd_value)
            except Exception as e:
                pass
            
            # Se abbiamo meno di 2 quote BANCA, scarta la partita
            if len(lay_odds) < 2:
                return None
            
            # Assegna le prime 3 quote (o quello che abbiamo)
            odds_1 = lay_odds[0] if len(lay_odds) > 0 else None
            odds_x = lay_odds[1] if len(lay_odds) > 1 else None
            odds_2 = lay_odds[2] if len(lay_odds) > 2 else lay_odds[1]
            
            if not all([odds_1, odds_2]):
                return None
            
            # Cerca data/ora nel div.status (es: "24/05/2026 20:45" o "Oggi 16:00")
            match_time = "Unknown"
            try:
                status_div = row.find_element(By.CSS_SELECTOR, "div.status")
                match_time = status_div.text.strip()
            except:
                # Fallback: cerca nel testo con regex
                time_pattern = r'(\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}|Oggi\s+\d{2}:\d{2}|\d{2}:\d{2})'
                time_match = re.search(time_pattern, text)
                if time_match:
                    match_time = time_match.group(0)
            
            return {
                'home_team': home_team,
                'away_team': away_team,
                'commence_time': match_time,
                'bookmaker': 'Betflag Exchange',
                'odds': {
                    '1': odds_1,
                    'X': odds_x if odds_x else (odds_1 + odds_2) / 2,
                    '2': odds_2
                }
            }
            
        except Exception as e:
            return None
    
    def _extract_from_text(self, text):
        """Estrai dati partita dal testo"""
        try:
            # Trova squadre
            home_team = None
            away_team = None
            
            for sep in [' vs ', ' V ', ' v ', ' - ']:
                if sep in text:
                    parts = text.split(sep, 1)
                    if len(parts) == 2:
                        # Prendi solo la prima riga per ogni squadra
                        home_team = parts[0].split('\n')[0].strip()
                        away_team = parts[1].split('\n')[0].strip()
                        break
            
            if not home_team or not away_team:
                return None
            
            # Pulisci nomi squadre
            home_team = re.sub(r'\d{2}:\d{2}|\d{2}/\d{2}', '', home_team).strip()
            away_team = re.sub(r'\d{2}:\d{2}|\d{2}/\d{2}', '', away_team).strip()
            
            if len(home_team) < 3 or len(away_team) < 3:
                return None
            
            # Estrai quote
            odds_pattern = r'\b([1-9]\.\d{1,2})\b'
            odds_list = re.findall(odds_pattern, text)
            odds_list = [float(o) for o in odds_list if 1.01 <= float(o) <= 1000]
            
            if len(odds_list) < 2:
                return None
            
            # Le prime 3 quote (o quante ne abbiamo)
            odds_1 = odds_list[0] if len(odds_list) > 0 else None
            odds_x = odds_list[1] if len(odds_list) > 1 else None
            odds_2 = odds_list[2] if len(odds_list) > 2 else odds_list[1]
            
            if not all([odds_1, odds_2]):
                return None
            
            # Cerca ora
            time_match = re.search(r'(\d{2}:\d{2})', text)
            match_time = time_match.group(0) if time_match else "Unknown"
            
            return {
                'home_team': home_team,
                'away_team': away_team,
                'commence_time': match_time,
                'bookmaker': 'Betflag Exchange',
                'odds': {
                    '1': odds_1,
                    'X': odds_x if odds_x else (odds_1 + odds_2) / 2,  # Stima X se mancante
                    '2': odds_2
                }
            }
        except:
            return None
    
    def close(self):
        if self.driver:
            self.driver.quit()


def test_betflag():
    print("""
╔════════════════════════════════════════════════════════════╗
║       TEST BETFLAG EXCHANGE SCRAPER                        ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    print("\n📍 URL Betflag Exchange: https://www.betflag.it/exchange")
    print("⏳ Avvio scraper...")
    
    scraper = BetflagScraper(headless=False)
    
    try:
        matches = scraper.scrape_betflag_exchange()
        
        print(f"\n📊 RISULTATI: {len(matches)} partite trovate")
        
        if matches:
            # Salva risultati
            with open('betflag_test.json', 'w', encoding='utf-8') as f:
                json.dump(matches, f, indent=2, ensure_ascii=False)
            
            print("\n💾 Risultati salvati in: betflag_test.json")
            print("\n🎉 SUCCESSO! Betflag Exchange funziona!")
        else:
            print("\n❌ Nessuna partita trovata")
            print("\n💡 SUGGERIMENTI:")
            print("   1. Verifica l'URL di Betflag Exchange")
            print("   2. Ispeziona manualmente la pagina")
            print("   3. Aggiorna i selettori in base alla struttura HTML")
        
    except Exception as e:
        print(f"\n❌ ERRORE: {e}")
    
    finally:
        print("\n⏳ Browser chiuderà tra 10 secondi...")
        time.sleep(10)
        scraper.close()


if __name__ == "__main__":
    test_betflag()
