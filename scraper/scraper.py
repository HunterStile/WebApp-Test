"""
Fantasy Team & Betfair Exchange Scraper
Scrapes odds from Fantasy Team and Betfair Exchange for arbitrage opportunities
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from datetime import datetime
import time
import json
import os


class OddsScraper:
    def __init__(self, headless=True):
        """Initialize the scraper with Chrome options"""
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless=new')  # Nuovo headless mode
            chrome_options.add_argument('--window-size=1920,1080')  # IMPORTANTE: dimensione finestra
        
        # Opzioni anti-detection per evitare blocchi
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument('--disable-infobars')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--profile-directory=Default')
        chrome_options.add_argument('--disable-plugins-discovery')
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--disable-gpu')  # Migliora headless su Windows
        chrome_options.add_argument('--disable-software-rasterizer')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Use local chromedriver.exe
        chromedriver_path = os.path.join(os.path.dirname(__file__), 'chromedriver.exe')
        
        if os.path.exists(chromedriver_path):
            print(f"✅ Usando ChromeDriver locale: {chromedriver_path}")
            service = Service(chromedriver_path)
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
        else:
            print("⚠️ chromedriver.exe non trovato, usando driver di sistema...")
            self.driver = webdriver.Chrome(options=chrome_options)
        
        # Nascondi proprietà Selenium/WebDriver
        self.driver.execute_cdp_cmd('Network.setUserAgentOverride', {
            "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        self.wait = WebDriverWait(self.driver, 15)

    def _close_popups(self):
        """Chiude popup cookies e promozioni"""
        try:
            # STEP 1: Accetta cookies
            print("   🍪 Cerco popup cookies...")
            try:
                # Cerca il bottone ACCETTA nei cookies (id="ctlOOSButton3")
                accept_btn = self.driver.find_element(By.ID, "ctlOOSButton3")
                accept_btn.click()
                print("   ✓ Cookies accettati")
                time.sleep(10)  # Attendi 10 secondi per far apparire il popup promo
            except:
                # Prova selettori alternativi
                try:
                    accept_btn = self.driver.find_element(By.CSS_SELECTOR, "input[value='ACCETTA']")
                    accept_btn.click()
                    print("   ✓ Cookies accettati (alt)")
                    time.sleep(10)  # Attendi 10 secondi
                except:
                    print("   ⚠️ Popup cookies non trovato o già accettato")
                    time.sleep(5)  # Attendi comunque un po'
            
            # STEP 2: Chiudi popup promozione
            print("   🔔 Cerco popup promozione...")
            try:
                # Verifica se il popup è visibile (display: flex)
                promo_popup = self.driver.find_element(By.ID, "PromoPopup")
                if promo_popup.is_displayed():
                    print("   ✓ Popup PromoPopup trovato")
                    # Cerca il bottone close dentro promo-popup-content
                    close_btn = promo_popup.find_element(By.CSS_SELECTOR, ".promo-popup-content .btn-close")
                    close_btn.click()
                    print("   ✓ Popup promozione chiuso")
                    time.sleep(2)
                else:
                    print("   ⚠️ PromoPopup non visibile")
            except:
                # Prova con selettori alternativi
                try:
                    # Cerca direttamente il btn-close
                    close_btn = self.driver.find_element(By.CSS_SELECTOR, "div.btn-close")
                    if close_btn.is_displayed():
                        close_btn.click()
                        print("   ✓ Popup chiuso (btn-close diretto)")
                        time.sleep(2)
                except:
                    print("   ⚠️ Popup promozione non trovato")
        except Exception as e:
            print(f"   ⚠️ Errore gestione popup: {str(e)[:60]}")

    def scrape_fantasy_team(self):
        """Scrape odds from Fantasy Team - navigando tra le competizioni"""
        print("🎯 Scraping Fantasy Team...")
        url = "https://fantasyteam.it/scommesse/prematch/calcio/1/palinsesto/home"
        
        # Competizioni da cercare nel menu laterale
        target_competitions = [
            "UEFA Qualificazioni Mondiali",
            "U21 Qualificazioni Europei",
            "Champions League",
            "Serie A",
            "Premier League",
            "Liga",
            "Bundesliga",
            "Europa League",
            "Conference League",
            "Eredivisie",
            "Liga Portugal",
            "Ligue 1"
        ]
        
        all_matches = []
        
        try:
            self.driver.get(url)
            print("⏳ Attendo caricamento pagina iniziale...")
            time.sleep(8)  # Aumentato per headless
            
            # Scroll per attivare caricamento lazy-load
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(2)
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(1)
            
            # Gestisci cookies e popup
            self._close_popups()
            
            time.sleep(5)  # Aumentato per headless - attendi stabilizzazione
            
            # STEP 1: Scrappa le partite più giocate dalla home
            print("\n📍 [HOME] Scraping partite più giocate...")
            match_elements = self.driver.find_elements(By.CSS_SELECTOR, ".cms-widget-sport-most-played__item")
            print(f"   📊 Trovati {len(match_elements)} elementi")
            
            for element in match_elements:
                try:
                    match_data = self._extract_fantasy_team_match(element)
                    if match_data:
                        all_matches.append(match_data)
                        print(f"   ✓ {match_data['home_team']} vs {match_data['away_team']}")
                except Exception as e:
                    continue
            
            # STEP 2: Naviga nelle competizioni dal menu laterale
            print("\n🔍 Cerco competizioni nel menu laterale...")
            
            # Trova tutti i gruppi del palinsesto
            competition_links = self.driver.find_elements(By.CSS_SELECTOR, ".palinsesto-prematch__group")
            print(f"   📊 Trovati {len(competition_links)} gruppi palinsesto")
            
            for comp_link in competition_links:
                try:
                    # Cerca lo span con il nome della competizione
                    label_elem = comp_link.find_element(By.CSS_SELECTOR, ".aside-nav__item__label span")
                    comp_name = label_elem.text.strip()
                    
                    # Verifica se è una competizione target
                    if comp_name in target_competitions:
                        print(f"\n📍 [{comp_name}] Click sulla competizione...")
                        
                        # Scroll all'elemento prima di cliccare
                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", comp_link)
                        time.sleep(1)
                        
                        # Clicca sulla competizione
                        comp_link.click()
                        time.sleep(8)  # Aumentato per headless - attendi caricamento
                        
                        # Scrappa le partite di questa competizione
                        # Nelle pagine competizioni usa selettori diversi dalla home
                        match_elements = self.driver.find_elements(By.CSS_SELECTOR, "sport-match.ng-star-inserted")
                        
                        if not match_elements:
                            # Prova selettore alternativo
                            match_elements = self.driver.find_elements(By.CSS_SELECTOR, ".match-row")
                        
                        if not match_elements:
                            # Ultima chance: home selector
                            match_elements = self.driver.find_elements(By.CSS_SELECTOR, ".cms-widget-sport-most-played__item")
                        
                        print(f"   � Trovati {len(match_elements)} elementi")
                        
                        for element in match_elements:
                            try:
                                # Prova prima l'estrattore per competizioni (sport-match)
                                match_data = self._extract_fantasy_competition_match(element)
                                if not match_data:
                                    # Fallback: estrattore home
                                    match_data = self._extract_fantasy_team_match(element)
                                
                                if match_data:
                                    # Evita duplicati
                                    if not any(m['home_team'] == match_data['home_team'] and 
                                              m['away_team'] == match_data['away_team'] for m in all_matches):
                                        all_matches.append(match_data)
                                        print(f"   ✓ {match_data['home_team']} vs {match_data['away_team']}")
                            except Exception as e:
                                continue
                
                except Exception as e:
                    continue
            
            print(f"\n✅ Totale: {len(all_matches)} partite uniche da Fantasy Team")
            return all_matches
            
        except Exception as e:
            print(f"❌ Error scraping Fantasy Team: {str(e)}")
            import traceback
            traceback.print_exc()
            return all_matches  # Ritorna comunque le partite trovate finora

    def _extract_fantasy_team_match(self, element):
        """Extract match data from a Fantasy Team element"""
        try:
            text = element.text
            
            # Trova le squadre cercando "VS" nel testo
            if 'VS' not in text:
                return None
            
            lines = text.split('\n')
            
            # Cerca le squadre (prima e dopo VS)
            home_team = None
            away_team = None
            odds_list = []
            match_time = "Unknown"
            
            for i, line in enumerate(lines):
                if line.strip() == 'VS':
                    # La squadra di casa è la riga precedente
                    if i > 0:
                        home_team = lines[i-1].strip()
                    # La squadra in trasferta è la riga successiva
                    if i < len(lines) - 1:
                        away_team = lines[i+1].strip()
                    break
            
            if not home_team or not away_team:
                return None
            
            # Estrai le quote (cerca pattern X.XX o XX.XX)
            import re
            odds_pattern = r'\b(\d{1,2}\.\d{2})\b'
            odds_matches = re.findall(odds_pattern, text)
            
            # Converti in float e filtra quote valide
            odds_list = [float(o) for o in odds_matches if 1.01 <= float(o) <= 100]
            
            # Assicurati di avere almeno 3 quote per 1X2
            if len(odds_list) < 3:
                return None
            
            # Le prime 3 quote dovrebbero essere 1, X, 2
            odds_1 = odds_list[0]
            odds_x = odds_list[1]
            odds_2 = odds_list[2]
            
            # Cerca data/ora nel testo (es: "18 NOV", "18:45", "24/05/2026 20:45")
            time_pattern = r'(\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}|\d{2}\s+[A-Z]{3}|\d{2}:\d{2}|Oggi\s+\d{2}:\d{2})'
            time_match = re.search(time_pattern, text)
            if time_match:
                match_time = time_match.group(0)
            
            return {
                'home_team': home_team,
                'away_team': away_team,
                'commence_time': match_time,
                'bookmaker': 'Fantasy Team',
                'odds': {
                    '1': odds_1,
                    'X': odds_x,
                    '2': odds_2
                }
            }
            
        except Exception as e:
            return None

    def _extract_fantasy_competition_match(self, element):
        """Extract match data from Fantasy Team competition pages (sport-match structure)"""
        try:
            import re
            
            # Cerca i nomi delle squadre
            team_labels = element.find_elements(By.CSS_SELECTOR, ".match-row__match__headings__team__label")
            
            if len(team_labels) < 2:
                return None
            
            home_team = team_labels[0].text.strip()
            away_team = team_labels[1].text.strip()
            
            if not home_team or not away_team or len(home_team) < 2 or len(away_team) < 2:
                return None
            
            # Cerca le quote 1X2 in box-quota__odd
            odds_elements = element.find_elements(By.CSS_SELECTOR, ".box-quota__odd")
            
            if len(odds_elements) < 3:
                return None
            
            # Estrai i valori delle quote
            odds_list = []
            for odd_elem in odds_elements[:3]:  # Prime 3 quote = 1X2
                odd_text = odd_elem.text.strip()
                try:
                    odd_value = float(odd_text.replace(',', '.'))
                    if 1.01 <= odd_value <= 1000:
                        odds_list.append(odd_value)
                except:
                    continue
            
            if len(odds_list) < 3:
                return None
            
            odds_1 = odds_list[0]
            odds_x = odds_list[1]
            odds_2 = odds_list[2]
            
            # Cerca data/ora
            match_time = "Unknown"
            try:
                # Cerca elementi con classe date o time
                date_elem = element.find_element(By.CSS_SELECTOR, ".match-row__date, .match-date, .date")
                match_time = date_elem.text.strip()
            except:
                # Fallback: cerca nel testo dell'elemento
                text = element.text
                time_pattern = r'(\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}|\d{2}\s+[A-Z]{3}|\d{2}:\d{2}|Oggi\s+\d{2}:\d{2})'
                time_match = re.search(time_pattern, text)
                if time_match:
                    match_time = time_match.group(0)
            
            return {
                'home_team': home_team,
                'away_team': away_team,
                'commence_time': match_time,
                'bookmaker': 'Fantasy Team',
                'odds': {
                    '1': odds_1,
                    'X': odds_x,
                    '2': odds_2
                }
            }
            
        except Exception as e:
            return None

    def scrape_betfair_exchange(self):
        """Scrape odds from Betflag Exchange - navigando tra le competizioni"""
        print("🎯 Scraping Betflag Exchange...")
        url = "https://www.betflag.it/exchange"
        
        # Competizioni target da cercare
        target_competitions = {
            'cc-fifa': ['World Cup Qualification'],
            'cc-eur': ['Qualificazioni Europei U21', 'Champions League', 'Europa League', 'Conference League'],
            'cc-it': ['Serie A'],
            'cc-gb': ['Premier League'],
            'cc-es': ['Liga', 'La Liga'],
            'cc-de': ['Bundesliga'],
            'cc-fr': ['Ligue 1'],
            'cc-nl': ['Eredivisie'],
            'cc-pt': ['Liga Portugal']
        }
        
        all_matches = []
        
        try:
            self.driver.get(url)
            print("⏳ Attendo caricamento pagina...")
            time.sleep(5)
            
            # Gestisci cookies e popup PRIMA di cercare iframe
            self._close_popups()
            
            time.sleep(5)
            
            # Cerca iframe di Betflag
            iframes = self.driver.find_elements(By.TAG_NAME, "iframe")
            print(f"   Trovati {len(iframes)} iframe")
            
            iframe_found = False
            for i, iframe in enumerate(iframes):
                try:
                    src = iframe.get_attribute('src')
                    
                    if src and 'mstxchange' in src:
                        print(f"   ✓ Trovato iframe Betflag Exchange")
                        self.driver.switch_to.frame(iframe)
                        print(f"   ⏳ Attendo caricamento iframe (15 sec)...")
                        time.sleep(15)
                        iframe_found = True
                        break
                except:
                    continue
            
            if not iframe_found:
                print("   ❌ Iframe Betflag non trovato")
                return []
            
            # STEP 1: Scrappa eventi dalla home iniziale
            # COMMENTATO PER TEST - SKIPPA HOME
            # print("\n📍 [HOME] Scraping eventi iniziali...")
            # event_rows = self.driver.find_elements(By.CSS_SELECTOR, ".d-flex.row-e")
            
            # if not event_rows:
            #     event_rows = self.driver.find_elements(By.CSS_SELECTOR, ".event, .eventcontent, .match")
            
            # print(f"   📊 Trovati {len(event_rows)} eventi")
            
            # for row in event_rows:
            #     try:
            #         match_data = self._extract_betfair_match(row)
            #         if match_data:
            #             all_matches.append(match_data)
            #             print(f"   ✓ {match_data['home_team']} vs {match_data['away_team']}")
            #     except:
            #         continue
            
            print("\n📍 [SKIP HOME] Vado direttamente alle competizioni...")
            
            # STEP 2: Naviga nel menu per competizioni
            print("\n🔍 Navigazione competizioni...")
            try:
                time.sleep(3)
                
                # STEP 2.1: Clicca su Calcio (id="mhs-1")
                try:
                    calcio_menu = self.driver.find_element(By.ID, "mhs-1")
                    print(f"   ✓ Trovato menu Calcio (mhs-1)")
                    
                    # Clicca su calcio per espandere
                    calcio_link = calcio_menu.find_element(By.CSS_SELECTOR, "a[onclick*='menuSport']")
                    calcio_link.click()
                    time.sleep(3)
                    print(f"   ✓ Menu Calcio espanso")
                except Exception as e:
                    print(f"   ⚠️ Errore apertura menu calcio: {str(e)[:80]}")
                    return all_matches
                
                # STEP 2.2: Naviga nelle nazioni (Europa, Italia, Inghilterra, ecc.)
                nations_to_click = [
                    ('cc-fifa', 'FIFA'),
                    ('cc-eur', 'Europa'),
                    ('cc-it', 'Italia'), 
                    ('cc-gb', 'Inghilterra'),
                    ('cc-es', 'Spagna'),
                    ('cc-de', 'Germania'),
                    ('cc-fr', 'Francia'),
                    ('cc-nl', 'Olanda'),
                    ('cc-pt', 'Portogallo')
                ]
                
                for flag_class, nation_name in nations_to_click:
                    try:
                        # Cerca il link della nazione con la flag
                        nation_link = self.driver.find_element(By.XPATH, 
                            f"//span[contains(@class, '{flag_class}')]/ancestor::a[contains(@onclick, 'menuNation')]")
                        
                        print(f"\n[INFO] [{nation_name}] Espando menu...")
                        
                        # Scroll verso l'elemento per renderlo visibile
                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", nation_link)
                        time.sleep(1)
                        
                        # Prova click JavaScript (più affidabile)
                        try:
                            self.driver.execute_script("arguments[0].click();", nation_link)
                        except:
                            # Fallback: click normale
                            nation_link.click()
                        
                        time.sleep(4)
                        
                        # Trova tutte le competizioni sotto questa nazione
                        # Cerca l'ul.collapse che si apre dopo il click
                        try:
                            # Trova il parent li della nazione
                            parent_li = nation_link.find_element(By.XPATH, "./ancestor::li[1]")
                            
                            # Cerca le competizioni dentro (onclick="setMan")
                            competitions = parent_li.find_elements(By.CSS_SELECTOR, "a[onclick*='setMan']")
                            print(f"   � Trovate {len(competitions)} competizioni")
                            
                            for comp in competitions[:5]:  # Limite a 5 competizioni per nazione
                                try:
                                    comp_name = comp.text.strip()
                                    if not comp_name:
                                        continue
                                    
                                    print(f"   🔹 Apertura {comp_name}...")
                                    comp.click()
                                    time.sleep(4)
                                    
                                    # STEP: Loop per caricare TUTTE le pagine di partite
                                    print(f"      🔄 Caricamento paginato partite...")
                                    max_pages = 50  # Massimo numero di pagine da caricare
                                    page_num = 1
                                    total_extracted = 0
                                    
                                    while page_num <= max_pages:
                                        # Conta partite visibili in questa pagina
                                        event_rows = self.driver.find_elements(By.CSS_SELECTOR, ".d-flex.row-e")
                                        if not event_rows:
                                            event_rows = self.driver.find_elements(By.CSS_SELECTOR, ".event, .eventcontent, .match")
                                        
                                        visible_count = len(event_rows)
                                        print(f"      📄 Pagina {page_num}: {visible_count} partite visibili")
                                        
                                        # ESTRAI le partite di QUESTA pagina prima di cambiare
                                        matches_this_page = 0
                                        for idx, row in enumerate(event_rows, 1):
                                            try:
                                                match_data = self._extract_betfair_match(row)
                                                if match_data:
                                                    # Evita duplicati
                                                    if not any(m['home_team'] == match_data['home_team'] and 
                                                              m['away_team'] == match_data['away_team'] for m in all_matches):
                                                        all_matches.append(match_data)
                                                        matches_this_page += 1
                                                        total_extracted += 1
                                                        print(f"         {total_extracted:2d}. ✓ {match_data['home_team']} vs {match_data['away_team']}")
                                            except:
                                                continue
                                        
                                        print(f"         → Estratte {matches_this_page} partite da pagina {page_num}")
                                        
                                        # Scroll verso l'alto poi verso il basso per "resettare" la vista
                                        self.driver.execute_script("window.scrollTo(0, 0);")
                                        time.sleep(0.5)
                                        
                                        # Cerca il bottone "PROSSIMI X MATCH"
                                        time.sleep(1)
                                        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                                        time.sleep(2)  # Aumentato tempo dopo scroll
                                        
                                        show_more_btn = None
                                        btn_text = ""
                                        
                                        # DEBUG: Mostra TUTTI i bottoni trovati
                                        try:
                                            # IMPORTANTE: Cerca tag <a> non <div>!
                                            all_btns = self.driver.find_elements(By.CSS_SELECTOR, "a[onclick*='viewEventsMan']")
                                            print(f"      🔍 Debug: Trovati {len(all_btns)} link <a> con onclick")
                                            
                                            for i, btn in enumerate(all_btns, 1):
                                                try:
                                                    is_visible = btn.is_displayed()
                                                    text = btn.text.strip() if btn.text else "[NESSUN TESTO]"
                                                    onclick = btn.get_attribute('onclick') if btn.get_attribute('onclick') else ""
                                                    print(f"         Link {i}: '{text}' | onclick='{onclick[:50]}' (visibile: {is_visible})")
                                                    
                                                    if is_visible:
                                                        text_upper = text.upper()
                                                        # Cerca SOLO "PROSSIMI" (NON "PRECEDENTI")
                                                        if 'PROSSIMI' in text_upper and 'PRECEDENTI' not in text_upper:
                                                            show_more_btn = btn
                                                            btn_text = text
                                                            print(f"      ✅ Selezionato link {i}: '{btn_text}'")
                                                            break
                                                except Exception as e:
                                                    print(f"         Link {i}: Errore - {str(e)[:30]}")
                                            
                                            # Fallback: prova con div se non trova <a>
                                            if not show_more_btn:
                                                print(f"      🔍 Provo con <div>...")
                                                div_btns = self.driver.find_elements(By.CSS_SELECTOR, "div[onclick*='viewEventsMan']")
                                                print(f"      🔍 Debug: Trovati {len(div_btns)} div con onclick")
                                                
                                                for i, btn in enumerate(div_btns, 1):
                                                    try:
                                                        is_visible = btn.is_displayed()
                                                        text = btn.text.strip() if btn.text else "[NESSUN TESTO]"
                                                        print(f"         Div {i}: '{text}' (visibile: {is_visible})")
                                                        
                                                        if is_visible:
                                                            text_upper = text.upper()
                                                            if 'PROSSIMI' in text_upper and 'PRECEDENTI' not in text_upper:
                                                                show_more_btn = btn
                                                                btn_text = text
                                                                print(f"      ✅ Selezionato div {i}: '{btn_text}'")
                                                                break
                                                    except Exception as e:
                                                        print(f"         Div {i}: Errore - {str(e)[:30]}")
                                            
                                            # Ultimo tentativo: XPATH generico
                                            if not show_more_btn:
                                                print(f"      🔍 Provo con XPATH generico...")
                                                xpath_btns = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'PROSSIMI') and contains(@onclick, 'viewEventsMan')]")
                                                print(f"      🔍 Debug: Trovati {len(xpath_btns)} elementi XPATH")
                                                
                                                for i, btn in enumerate(xpath_btns, 1):
                                                    try:
                                                        is_visible = btn.is_displayed()
                                                        text = btn.text.strip() if btn.text else "[NESSUN TESTO]"
                                                        print(f"         XPATH {i}: '{text}' (visibile: {is_visible})")
                                                        
                                                        if is_visible and 'PRECEDENTI' not in text.upper():
                                                            show_more_btn = btn
                                                            btn_text = text
                                                            print(f"      ✅ Selezionato XPATH {i}: '{btn_text}'")
                                                            break
                                                    except Exception as e:
                                                        print(f"         XPATH {i}: Errore - {str(e)[:30]}")
                                                        
                                        except Exception as e:
                                            print(f"      ⚠️ Errore ricerca bottone: {str(e)[:50]}")
                                        
                                        # Se non c'è più il bottone, siamo all'ultima pagina
                                        if not show_more_btn:
                                            print(f"      ✓ Ultima pagina raggiunta (bottone non trovato)")
                                            break
                                        
                                        # Clicca per caricare la pagina successiva
                                        print(f"      🔽 Trovato bottone: '{btn_text}' - Carico pagina {page_num + 1}...")
                                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", show_more_btn)
                                        time.sleep(0.8)
                                        
                                        try:
                                            self.driver.execute_script("arguments[0].click();", show_more_btn)
                                        except:
                                            show_more_btn.click()
                                        
                                        print(f"      ⏳ Attendo caricamento pagina {page_num + 1} (6 secondi)...")
                                        time.sleep(6)  # Aumentato a 6 secondi per dare tempo al DOM di aggiornarsi
                                        page_num += 1
                                    
                                    print(f"      {'='*50}")
                                    print(f"      ✅ TOTALE: {total_extracted} partite estratte da {page_num} pagine")
                                    print(f"      {'='*50}")
                                except Exception as e:
                                    continue
                        except Exception as e:
                            print(f"   ⚠️ Errore estrazione competizioni: {str(e)[:60]}")
                    
                    except Exception as e:
                        print(f"   ⚠️ {nation_name} non trovato o errore: {str(e)[:60]}")
                        continue
                        
            except Exception as e:
                print(f"   ⚠️ Errore navigazione menu: {str(e)[:80]}")
            
            # Torna al contesto principale
            self.driver.switch_to.default_content()
            
            print(f"\n✅ Totale: {len(all_matches)} partite uniche da Betflag Exchange")
            return all_matches
            
        except Exception as e:
            print(f"❌ Error scraping Betflag Exchange: {str(e)}")
            import traceback
            traceback.print_exc()
            try:
                self.driver.switch_to.default_content()
            except:
                pass
            return all_matches

            import traceback
            traceback.print_exc()
            return []

    def _extract_betfair_match(self, element):
        """Extract match data from a Betflag element"""
        try:
            text = element.text
            
            import re
            
            # METODO 1: Cerca dentro div.match -> class="da" (nomi squadre)
            home_team = None
            away_team = None
            
            try:
                # Cerca il div.match dentro l'elemento
                match_div = element.find_element(By.CSS_SELECTOR, "div.match")
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
            
            # Pulisci i nomi delle squadre
            home_team = re.sub(r'\d{2}:\d{2}|\d{2}/\d{2}', '', home_team).strip()
            away_team = re.sub(r'\d{2}:\d{2}|\d{2}/\d{2}', '', away_team).strip()
            
            if not home_team or not away_team or len(home_team) < 3 or len(away_team) < 3:
                return None
            
            # Cerca SOLO quote LAY (bancata) - classe "ban oddcnt"
            lay_odds = []
            try:
                # IMPORTANTE: Cerca solo "ban oddcnt" (NON "pun oddcnt")
                ban_elements = element.find_elements(By.CSS_SELECTOR, "div.ban.oddcnt")
                
                for ban_elem in ban_elements:
                    odd_text = ban_elem.text.strip()
                    odd_match = re.search(r'(\d+[.,]\d+)', odd_text)
                    if odd_match:
                        odd_value = float(odd_match.group(1).replace(',', '.'))
                        # Accetta tutte le quote valide (1.01 - 1000)
                        if 1.01 <= odd_value <= 1000:
                            lay_odds.append(odd_value)
            except:
                pass
            
            # Se non troviamo quote BANCA, scarta
            if len(lay_odds) < 2:
                return None
            
            odds_1 = lay_odds[0] if len(lay_odds) > 0 else None
            odds_x = lay_odds[1] if len(lay_odds) > 1 else None
            odds_2 = lay_odds[2] if len(lay_odds) > 2 else lay_odds[1]
            
            if not all([odds_1, odds_2]):
                return None
            
            # Cerca data/ora nel div.status (es: "24/05/2026 20:45" o "Oggi 16:00")
            match_time = "Unknown"
            try:
                status_div = element.find_element(By.CSS_SELECTOR, "div.status")
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

    def _parse_odd(self, text):
        """Parse odd value from text"""
        try:
            # Remove any non-numeric characters except dot
            cleaned = ''.join(c for c in text if c.isdigit() or c == '.')
            if cleaned:
                return float(cleaned)
        except:
            pass
        return None

    def scrape_all(self):
        """Scrape both Fantasy Team and Betflag Exchange"""
        fantasy_team_odds = self.scrape_fantasy_team()
        betflag_odds = self.scrape_betfair_exchange()
        
        return {
            'fantasy_team': fantasy_team_odds,
            'betflag_exchange': betflag_odds,
            'timestamp': datetime.now().isoformat()
        }

    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()


def match_odds(fantasy_team_data, betfair_data):
    """Match Fantasy Team odds with Betfair Exchange odds"""
    matched_opportunities = []
    
    for ft_match in fantasy_team_data:
        for bf_match in betfair_data:
            # Try to match teams (allowing for small differences)
            if _teams_match(ft_match, bf_match):
                opportunity = {
                    'home_team': ft_match['home_team'],
                    'away_team': ft_match['away_team'],
                    'commence_time': ft_match['commence_time'],
                    'fantasy_team_odds': ft_match['odds'],
                    'betfair_odds': bf_match['odds'],
                    'opportunities': []
                }
                
                # Calculate arbitrage for each outcome (1, X, 2)
                for outcome in ['1', 'X', '2']:
                    ft_odd = ft_match['odds'].get(outcome)
                    bf_odd = bf_match['odds'].get(outcome)
                    
                    if ft_odd and bf_odd:
                        rating = calculate_rating(ft_odd, bf_odd)
                        opportunity['opportunities'].append({
                            'outcome': outcome,
                            'fantasy_team_odd': ft_odd,
                            'betfair_odd': bf_odd,
                            'rating': rating
                        })
                
                if opportunity['opportunities']:
                    matched_opportunities.append(opportunity)
    
    return matched_opportunities


def _teams_match(match1, match2):
    """Check if two matches refer to the same game"""
    home1 = match1['home_team'].lower().strip()
    away1 = match1['away_team'].lower().strip()
    home2 = match2['home_team'].lower().strip()
    away2 = match2['away_team'].lower().strip()
    
    # Simple string matching - could be improved with fuzzy matching
    return (home1 in home2 or home2 in home1) and (away1 in away2 or away2 in away1)


def calculate_rating(bookmaker_odd, betfair_odd, stake=100, commission=0.05):
    """Calculate arbitrage rating"""
    try:
        effective_betfair_odd = betfair_odd - commission
        lay = (bookmaker_odd / effective_betfair_odd) * stake
        liability = (lay * betfair_odd) - lay
        profit = (bookmaker_odd - 1) * stake - (betfair_odd - 1) * lay
        rating = 100 + (profit / stake) * 100
        
        return round(rating, 2)
    except:
        return 0


if __name__ == "__main__":
    # Test the scraper
    scraper = OddsScraper(headless=False)
    try:
        data = scraper.scrape_all()
        
        # Match opportunities
        opportunities = match_odds(data['fantasy_team'], data['betfair_exchange'])
        
        print("\n" + "="*50)
        print(f"Found {len(opportunities)} matched opportunities")
        print("="*50)
        
        for opp in opportunities[:5]:  # Show first 5
            print(f"\n{opp['home_team']} vs {opp['away_team']}")
            for o in opp['opportunities']:
                print(f"  {o['outcome']}: FT={o['fantasy_team_odd']}, BF={o['betfair_odd']}, Rating={o['rating']}%")
        
        # Save to file
        with open('scraped_odds.json', 'w', encoding='utf-8') as f:
            json.dump({
                'raw_data': data,
                'opportunities': opportunities
            }, f, indent=2, ensure_ascii=False)
        
        print("\n✅ Data saved to scraped_odds.json")
        
    finally:
        scraper.close()
