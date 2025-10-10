"""
Esplora la struttura di Betflag Exchange e identifica i selettori
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time
import os


def explore_betflag():
    print("""
╔════════════════════════════════════════════════════════════╗
║       ESPLORAZIONE BETFLAG EXCHANGE                        ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    chrome_options = Options()
    chrome_options.add_argument('--start-maximized')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    chromedriver_path = os.path.join(os.path.dirname(__file__), 'chromedriver.exe')
    
    if os.path.exists(chromedriver_path):
        service = Service(chromedriver_path)
        driver = webdriver.Chrome(service=service, options=chrome_options)
    else:
        driver = webdriver.Chrome(options=chrome_options)
    
    try:
        url = "https://www.betflag.it/exchange"
        print(f"\n📡 Caricamento: {url}")
        driver.get(url)
        
        print("\n⏳ Attendo 15 secondi per caricamento completo...")
        time.sleep(15)
        
        print("\n" + "="*70)
        print("📊 ANALISI STRUTTURA PAGINA")
        print("="*70)
        
        # 1. Cerca elementi con "calcio" nel testo
        print("\n1️⃣ ELEMENTI CON 'CALCIO':")
        calcio_elements = driver.find_elements(By.XPATH, "//*[contains(translate(text(), 'CALCIO', 'calcio'), 'calcio')]")
        print(f"   Trovati {len(calcio_elements)} elementi")
        for elem in calcio_elements[:5]:
            try:
                classes = elem.get_attribute('class')
                tag = elem.tag_name
                print(f"   - {tag}.{classes[:50] if classes else 'no-class'}")
            except:
                pass
        
        # 2. Cerca link/bottoni cliccabili
        print("\n2️⃣ LINK E BOTTONI:")
        links = driver.find_elements(By.TAG_NAME, "a")
        buttons = driver.find_elements(By.TAG_NAME, "button")
        print(f"   Link: {len(links)}")
        print(f"   Bottoni: {len(buttons)}")
        
        # Cerca link che contengono "calcio" o "football"
        sport_links = []
        for link in links[:50]:
            try:
                text = link.text.lower()
                href = link.get_attribute('href') or ''
                if 'calcio' in text or 'football' in text or 'calcio' in href or 'football' in href:
                    sport_links.append({
                        'text': link.text[:50],
                        'href': href[:100],
                        'class': link.get_attribute('class')
                    })
            except:
                pass
        
        if sport_links:
            print(f"\n   🎯 Link sportivi trovati ({len(sport_links)}):")
            for sl in sport_links[:5]:
                print(f"   - Text: {sl['text']}")
                print(f"     href: {sl['href']}")
                print(f"     class: {sl['class'][:50] if sl['class'] else 'no-class'}")
                print()
        
        # 3. Cerca iframe
        print("\n3️⃣ IFRAME:")
        iframes = driver.find_elements(By.TAG_NAME, "iframe")
        print(f"   Trovati {len(iframes)} iframe")
        for i, iframe in enumerate(iframes[:3]):
            try:
                src = iframe.get_attribute('src')
                print(f"   Iframe {i+1}: {src[:100] if src else 'no-src'}")
            except:
                pass
        
        # 4. Analizza tutti i div visibili
        print("\n4️⃣ DIV PRINCIPALI (visibili):")
        divs = driver.find_elements(By.TAG_NAME, "div")
        visible_divs = [d for d in divs if d.is_displayed()]
        print(f"   Totale div: {len(divs)}")
        print(f"   Div visibili: {len(visible_divs)}")
        
        # 5. Stampa l'HTML della pagina
        print("\n5️⃣ STRUTTURA HTML (primi 2000 caratteri):")
        print("="*70)
        html = driver.page_source[:2000]
        print(html)
        print("="*70)
        
        print("\n\n" + "="*70)
        print("📝 ISTRUZIONI:")
        print("="*70)
        print("""
1. Il browser rimarrà aperto per 60 secondi
2. Usa F12 per aprire DevTools
3. Cerca gli elementi delle partite di calcio
4. Se vedi un link "Calcio" o "Football", cliccalo manualmente
5. Ispeziona la struttura degli eventi sportivi
6. Annota:
   - Selettori CSS per container partite
   - Selettori per nomi squadre
   - Selettori per quote
        """)
        
        print("\n⏰ Il browser chiuderà tra 60 secondi...")
        print("   Chiudi manualmente se hai finito prima.")
        
        # Attendi 60 secondi
        for remaining in range(60, 0, -10):
            print(f"   {remaining} secondi rimanenti...")
            time.sleep(10)
        
    except Exception as e:
        print(f"\n❌ ERRORE: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        driver.quit()
        print("\n✅ Browser chiuso")


if __name__ == "__main__":
    explore_betflag()
