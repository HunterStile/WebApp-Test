"""
Script semplificato per ispezionare i selettori
Usa selenium-wire per evitare problemi con ChromeDriver
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import time
import os


def simple_inspect(url, site_name):
    """Apri semplicemente il browser per ispezione manuale"""
    print("=" * 60)
    print(f"🔍 APRENDO {site_name}")
    print("=" * 60)
    
    chrome_options = Options()
    chrome_options.add_argument('--start-maximized')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    # Add user agent to avoid detection
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36')
    
    driver = None
    try:
        # Use local chromedriver.exe
        print("🚀 Tentativo di apertura browser...")
        chromedriver_path = os.path.join(os.path.dirname(__file__), 'chromedriver.exe')
        
        if os.path.exists(chromedriver_path):
            print(f"✅ Usando ChromeDriver locale: {chromedriver_path}")
            service = Service(chromedriver_path)
            driver = webdriver.Chrome(service=service, options=chrome_options)
        else:
            print("⚠️ chromedriver.exe non trovato, provo con driver di sistema...")
            driver = webdriver.Chrome(options=chrome_options)
        
        print(f"📡 Caricamento: {url}")
        driver.get(url)
        
        print("\n" + "=" * 60)
        print("✅ BROWSER APERTO CON SUCCESSO!")
        print("=" * 60)
        print("\n📝 ISTRUZIONI:")
        print("1. Premi F12 per aprire DevTools")
        print("2. Clicca sull'icona del cursore in alto a sinistra (Ispettore)")
        print("3. Passa il mouse sugli elementi della pagina")
        print("4. Cerca questi elementi:")
        print("   ✓ Container della partita (div, li, tr)")
        print("   ✓ Nomi delle squadre")
        print("   ✓ Quote 1, X, 2")
        print("   ✓ Data/ora della partita")
        print("\n5. Per ogni elemento, annota:")
        print("   • class=\"...\"")
        print("   • id=\"...\"")
        print("   • data-*=\"...\"")
        print("\n6. Chiudi il browser quando hai finito")
        print("=" * 60)
        
        # Wait indefinitely until user closes browser
        while True:
            try:
                # Check if browser is still open
                driver.current_url
                time.sleep(2)
            except:
                print("\n✅ Browser chiuso dall'utente")
                break
                
    except Exception as e:
        print(f"\n❌ ERRORE: {e}")
        print("\n💡 SOLUZIONI POSSIBILI:")
        print("\n1️⃣ INSTALLA CHROMEDRIVER MANUALMENTE:")
        print("   a) Vai su: https://googlechromelabs.github.io/chrome-for-testing/")
        print("   b) Scarica ChromeDriver per Windows 64-bit")
        print("   c) Estrai chromedriver.exe")
        print("   d) Mettilo in: C:\\Windows\\System32\\")
        print("\n2️⃣ VERIFICA LA VERSIONE DI CHROME:")
        print("   a) Apri Chrome")
        print("   b) Vai su chrome://settings/help")
        print("   c) Annota la versione (es. 120.0.6099.109)")
        print("   d) Scarica il ChromeDriver corrispondente")
        print("\n3️⃣ USA EDGE INVECE DI CHROME:")
        print("   a) pip install msedge-selenium-tools")
        print("   b) Usa EdgeDriver invece di ChromeDriver")
        
    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║       SCRIPT DI ISPEZIONE SEMPLIFICATO                     ║
║                                                            ║
║  Apre il browser per ispezione manuale                    ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    print("\n🔧 PREREQUISITI:")
    print("1. Chrome installato")
    print("2. ChromeDriver compatibile")
    print("3. Selenium installato (pip install selenium)")
    
    print("\n" + "=" * 60)
    scelta = input("\nCosa vuoi ispezionare?\n1. Fantasy Team\n2. Betfair Exchange\n3. Entrambi (sequenziale)\n\nScelta (1/2/3): ")
    
    if scelta == "1":
        simple_inspect("https://fantasyteam.it/scommesse/prematch/calcio/1/palinsesto/home", "FANTASY TEAM")
    elif scelta == "2":
        simple_inspect("https://www.betfair.it/exchange/plus/it/calcio-scommesse-1", "BETFAIR EXCHANGE")
    elif scelta == "3":
        simple_inspect("https://fantasyteam.it/scommesse/prematch/calcio/1/palinsesto/home", "FANTASY TEAM")
        print("\n\n⏭️ Passiamo a Betfair...")
        time.sleep(2)
        simple_inspect("https://www.betfair.it/exchange/plus/it/calcio-scommesse-1", "BETFAIR EXCHANGE")
    else:
        print("❌ Scelta non valida")
