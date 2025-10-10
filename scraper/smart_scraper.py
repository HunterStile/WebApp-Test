"""
Script intelligente che auto-identifica i selettori CSS
Esplora la pagina e trova automaticamente partite e quote
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time
import json
import os
import re


class SmartScraper:
    def __init__(self):
        chrome_options = Options()
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        chromedriver_path = os.path.join(os.path.dirname(__file__), 'chromedriver.exe')
        
        if os.path.exists(chromedriver_path):
            service = Service(chromedriver_path)
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
        else:
            self.driver = webdriver.Chrome(options=chrome_options)
    
    def find_matches_automatically(self, url):
        """Trova automaticamente le partite sulla pagina"""
        print("=" * 80)
        print(f"🔍 ANALISI AUTOMATICA DI: {url}")
        print("=" * 80)
        
        self.driver.get(url)
        print("⏳ Attendo caricamento pagina (10 secondi)...")
        time.sleep(10)
        
        print("\n1️⃣ RICERCA ELEMENTI CON PATTERN 'VS' (indicano partite)...")
        
        # Cerca elementi che contengono 'vs', 'VS', o ' - '
        matches_found = []
        
        # Strategia 1: Cerca tutti gli elementi visibili con testo
        all_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'vs') or contains(text(), 'VS') or contains(text(), '-')]")
        
        print(f"   Trovati {len(all_elements)} elementi con pattern vs/VS/-")
        
        for elem in all_elements[:50]:  # Limita a 50 per velocità
            try:
                text = elem.text.strip()
                
                # Verifica se sembra una partita (squadra vs squadra)
                if self._looks_like_match(text):
                    # Trova il parent container
                    parent = self._find_match_container(elem)
                    
                    if parent and parent not in [m['element'] for m in matches_found]:
                        match_data = self._extract_match_data(parent)
                        if match_data:
                            matches_found.append({
                                'element': parent,
                                'data': match_data
                            })
            except Exception as e:
                # Ignora errori su singoli elementi
                continue
        
        print(f"\n✅ Trovate {len(matches_found)} partite valide!")
        
        # Mostra dettagli delle prime 5 partite
        print("\n2️⃣ DETTAGLI PARTITE TROVATE:")
        print("=" * 80)
        
        for i, match in enumerate(matches_found[:5], 1):
            data = match['data']
            print(f"\n🏆 PARTITA {i}:")
            print(f"   Squadre: {data.get('teams', 'N/A')}")
            print(f"   Quote trovate: {len(data.get('odds', []))}")
            
            if data.get('odds'):
                print(f"   Quote:")
                for odd in data['odds']:
                    print(f"      {odd}")
            
            # Mostra selettori CSS
            elem = match['element']
            classes = elem.get_attribute('class')
            print(f"\n   📌 Selettori CSS:")
            print(f"      Tag: {elem.tag_name}")
            print(f"      Class: {classes}")
            
            # Trova selettore unico
            selector = self._generate_css_selector(elem)
            print(f"      Selettore suggerito: {selector}")
        
        # Salva risultati
        self._save_analysis(matches_found)
        
        print("\n" + "=" * 80)
        print("📊 ANALISI COMPLETATA!")
        print("=" * 80)
        print("\n💾 Risultati salvati in: analysis_result.json")
        print("🔍 Puoi ora usare i selettori trovati in scraper.py")
        
        return matches_found
    
    def _looks_like_match(self, text):
        """Verifica se il testo sembra una partita"""
        if not text or len(text) < 5:
            return False
        
        # Pattern comuni: "Team A vs Team B", "Team A - Team B"
        patterns = [
            r'\w+\s+vs\s+\w+',
            r'\w+\s+VS\s+\w+',
            r'\w+\s+-\s+\w+',
        ]
        
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False
    
    def _find_match_container(self, element):
        """Risale l'albero DOM per trovare il container della partita"""
        current = element
        max_depth = 10
        
        for _ in range(max_depth):
            try:
                parent = current.find_element(By.XPATH, '..')
                
                # Verifica se questo parent contiene quote (numeri come 1.50, 2.00, ecc.)
                parent_text = parent.text
                
                # Cerca pattern di quote (es. 1.50, 2.00, 3.50)
                odds_pattern = r'\b[1-9]\.\d{2}\b'
                odds_found = re.findall(odds_pattern, parent_text)
                
                # Se troviamo almeno 2-3 quote, questo è probabilmente il container
                if len(odds_found) >= 2:
                    return parent
                
                current = parent
            except:
                break
        
        return element
    
    def _extract_match_data(self, element):
        """Estrae dati dalla partita"""
        try:
            text = element.text
            
            # Estrai squadre
            teams = None
            for separator in [' vs ', ' VS ', ' - ']:
                if separator in text:
                    parts = text.split(separator)
                    if len(parts) >= 2:
                        teams = f"{parts[0].strip()} vs {parts[1].strip()}"
                        break
            
            # Estrai quote
            odds_pattern = r'\b([1-9]\.\d{2})\b'
            odds = re.findall(odds_pattern, text)
            odds = [float(o) for o in odds if 1.01 <= float(o) <= 100]
            
            # Filtra quote ragionevoli (tra 1.01 e 100)
            odds = [o for o in odds if 1.01 <= o <= 100]
            
            if teams or len(odds) >= 2:
                return {
                    'teams': teams,
                    'odds': odds,
                    'full_text': text[:200]  # Prime 200 chars
                }
        except:
            pass
        
        return None
    
    def _generate_css_selector(self, element):
        """Genera un selettore CSS per l'elemento"""
        try:
            classes = element.get_attribute('class')
            if classes:
                # Prendi la prima classe significativa
                class_list = classes.split()
                if class_list:
                    return f".{class_list[0]}"
            
            # Fallback al tag
            return element.tag_name
        except:
            return "div"
    
    def _save_analysis(self, matches_found):
        """Salva l'analisi in un file JSON"""
        results = []
        
        for match in matches_found:
            elem = match['element']
            data = match['data']
            
            results.append({
                'teams': data.get('teams'),
                'odds': data.get('odds'),
                'css_class': elem.get_attribute('class'),
                'tag_name': elem.tag_name,
                'selector': self._generate_css_selector(elem)
            })
        
        with open('analysis_result.json', 'w', encoding='utf-8') as f:
            json.dump({
                'total_matches': len(results),
                'matches': results,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            }, f, indent=2, ensure_ascii=False)
    
    def analyze_fantasy_team(self):
        """Analizza Fantasy Team"""
        url = "https://fantasyteam.it/scommesse/prematch/calcio/1/palinsesto/home"
        return self.find_matches_automatically(url)
    
    def analyze_betfair(self):
        """Analizza Betfair"""
        url = "https://www.betfair.it/exchange/plus/it/calcio-scommesse-1"
        return self.find_matches_automatically(url)
    
    def close(self):
        """Chiudi browser"""
        if self.driver:
            self.driver.quit()


def main():
    print("""
╔════════════════════════════════════════════════════════════════════════╗
║       SCRAPER INTELLIGENTE - AUTO-IDENTIFICAZIONE SELETTORI            ║
║                                                                        ║
║  Questo script trova automaticamente partite e quote                  ║
╚════════════════════════════════════════════════════════════════════════╝
    """)
    
    scraper = SmartScraper()
    
    try:
        print("\n🎯 Cosa vuoi analizzare?")
        print("1. Fantasy Team")
        print("2. Betfair Exchange")
        print("3. Entrambi")
        
        choice = input("\nScelta (1/2/3): ").strip()
        
        if choice == "1":
            scraper.analyze_fantasy_team()
        elif choice == "2":
            scraper.analyze_betfair()
        elif choice == "3":
            print("\n" + "="*80)
            print("📊 ANALISI FANTASY TEAM")
            print("="*80)
            scraper.analyze_fantasy_team()
            
            print("\n\n" + "="*80)
            print("📊 ANALISI BETFAIR EXCHANGE")
            print("="*80)
            scraper.analyze_betfair()
        else:
            print("❌ Scelta non valida")
        
        print("\n" + "="*80)
        print("✅ ANALISI COMPLETATA!")
        print("="*80)
        print("\n📝 PROSSIMI PASSI:")
        print("1. Controlla il file 'analysis_result.json'")
        print("2. Usa i selettori trovati per aggiornare scraper.py")
        print("3. Testa lo scraper completo")
        
    except Exception as e:
        print(f"\n❌ ERRORE: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        print("\n⏳ Browser rimarrà aperto per 30 secondi per ispezione...")
        time.sleep(30)
        scraper.close()
        print("✅ Browser chiuso")


if __name__ == "__main__":
    main()
