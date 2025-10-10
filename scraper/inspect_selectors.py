"""
Script di test per identificare i selettori CSS corretti
Apre il browser in modalità visibile e stampa la struttura HTML
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time


def inspect_fantasy_team():
    """Ispeziona la struttura di Fantasy Team"""
    print("=" * 60)
    print("🔍 ISPEZIONANDO FANTASY TEAM")
    print("=" * 60)
    
    chrome_options = Options()
    chrome_options.add_argument('--start-maximized')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    try:
        # Try with ChromeDriverManager first
        print("📥 Downloading/installing ChromeDriver...")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        print(f"⚠️ Error with ChromeDriverManager: {e}")
        print("🔄 Trying with default Chrome driver...")
        try:
            # Try without specifying service (uses system PATH)
            driver = webdriver.Chrome(options=chrome_options)
        except Exception as e2:
            print(f"❌ Error: {e2}")
            print("\n💡 SOLUZIONE:")
            print("1. Scarica ChromeDriver manualmente da:")
            print("   https://googlechromelabs.github.io/chrome-for-testing/")
            print("2. Estrai il file chromedriver.exe")
            print("3. Mettilo in una cartella (es. C:\\chromedriver\\)")
            print("4. Aggiungi la cartella al PATH di Windows")
            print("\nOppure usa l'alternativa con undetected-chromedriver")
            return
    
    try:
        url = "https://fantasyteam.it/scommesse/prematch/calcio/1/palinsesto/home"
        print(f"\n📡 Caricamento: {url}")
        driver.get(url)
        
        print("\n⏳ Attendi 10 secondi per caricare la pagina...")
        time.sleep(10)
        
        print("\n" + "=" * 60)
        print("ISTRUZIONI:")
        print("=" * 60)
        print("1. Apri gli Strumenti per Sviluppatori (F12)")
        print("2. Usa l'ispettore (Ctrl+Shift+C) per selezionare:")
        print("   - Il container della partita")
        print("   - I nomi delle squadre (casa e trasferta)")
        print("   - Le quote (1, X, 2)")
        print("   - L'orario della partita")
        print("\n3. Annota i selettori CSS (class, id, tag)")
        print("\n4. Cerca pattern comuni come:")
        print("   - class*='match', class*='event', class*='game'")
        print("   - class*='team', class*='name'")
        print("   - class*='odd', class*='quota', class*='price'")
        print("   - class*='time', class*='date'")
        
        # Prova a trovare alcuni elementi comuni
        print("\n" + "=" * 60)
        print("TENTATIVO AUTOMATICO DI TROVARE ELEMENTI:")
        print("=" * 60)
        
        # Cerca possibili container di partite
        possible_containers = [
            "div[class*='match']",
            "div[class*='event']",
            "div[class*='game']",
            "div[class*='fixture']",
            "li[class*='match']",
            "tr[class*='match']",
            ".match",
            ".event",
            ".game"
        ]
        
        for selector in possible_containers:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    print(f"✅ Trovati {len(elements)} elementi con: {selector}")
                    if len(elements) > 0:
                        print(f"   Primo elemento HTML (primi 200 chars):")
                        print(f"   {elements[0].get_attribute('outerHTML')[:200]}...")
            except:
                pass
        
        print("\n" + "=" * 60)
        print("⌛ Browser rimane aperto per 5 minuti per l'ispezione")
        print("   Chiudi manualmente quando hai finito")
        print("=" * 60)
        
        time.sleep(300)  # 5 minuti
        
    finally:
        driver.quit()
        print("\n✅ Browser chiuso")


def inspect_betfair():
    """Ispeziona la struttura di Betfair"""
    print("\n\n")
    print("=" * 60)
    print("🔍 ISPEZIONANDO BETFAIR EXCHANGE")
    print("=" * 60)
    
    chrome_options = Options()
    chrome_options.add_argument('--start-maximized')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    try:
        # Try with ChromeDriverManager first
        print("📥 Downloading/installing ChromeDriver...")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        print(f"⚠️ Error with ChromeDriverManager: {e}")
        print("🔄 Trying with default Chrome driver...")
        try:
            # Try without specifying service (uses system PATH)
            driver = webdriver.Chrome(options=chrome_options)
        except Exception as e2:
            print(f"❌ Error: {e2}")
            print("\n💡 SOLUZIONE:")
            print("1. Scarica ChromeDriver manualmente da:")
            print("   https://googlechromelabs.github.io/chrome-for-testing/")
            print("2. Estrai il file chromedriver.exe")
            print("3. Mettilo in una cartella (es. C:\\chromedriver\\)")
            print("4. Aggiungi la cartella al PATH di Windows")
            return
    
    try:
        url = "https://www.betfair.it/exchange/plus/it/calcio-scommesse-1"
        print(f"\n📡 Caricamento: {url}")
        driver.get(url)
        
        print("\n⏳ Attendi 10 secondi per caricare la pagina...")
        time.sleep(10)
        
        print("\n" + "=" * 60)
        print("ISTRUZIONI:")
        print("=" * 60)
        print("1. Apri gli Strumenti per Sviluppatori (F12)")
        print("2. Usa l'ispettore per selezionare:")
        print("   - Il container della partita")
        print("   - I nomi delle squadre")
        print("   - Le quote LAY (bancata) per 1, X, 2")
        print("   - L'orario della partita")
        print("\n3. Su Betfair cerca specificamente:")
        print("   - class*='runner' (per le squadre)")
        print("   - class*='lay' (per le quote bancata)")
        print("   - class*='market' (per il mercato)")
        
        # Prova a trovare alcuni elementi comuni
        print("\n" + "=" * 60)
        print("TENTATIVO AUTOMATICO DI TROVARE ELEMENTI:")
        print("=" * 60)
        
        possible_containers = [
            "div[class*='event']",
            "div[class*='market']",
            "div[class*='runner']",
            "div[class*='match']",
            "[class*='market-container']",
            "[class*='event-container']"
        ]
        
        for selector in possible_containers:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    print(f"✅ Trovati {len(elements)} elementi con: {selector}")
                    if len(elements) > 0:
                        print(f"   Primo elemento HTML (primi 200 chars):")
                        print(f"   {elements[0].get_attribute('outerHTML')[:200]}...")
            except:
                pass
        
        print("\n" + "=" * 60)
        print("⌛ Browser rimane aperto per 5 minuti per l'ispezione")
        print("   Chiudi manualmente quando hai finito")
        print("=" * 60)
        
        time.sleep(300)  # 5 minuti
        
    finally:
        driver.quit()
        print("\n✅ Browser chiuso")


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║       SCRIPT DI ISPEZIONE SELETTORI CSS                    ║
║                                                            ║
║  Questo script ti aiuta a trovare i selettori CSS corretti║
║  per Fantasy Team e Betfair Exchange                      ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    scelta = input("\nCosa vuoi ispezionare?\n1. Fantasy Team\n2. Betfair Exchange\n3. Entrambi\n\nScelta (1/2/3): ")
    
    if scelta == "1":
        inspect_fantasy_team()
    elif scelta == "2":
        inspect_betfair()
    elif scelta == "3":
        inspect_fantasy_team()
        inspect_betfair()
    else:
        print("❌ Scelta non valida")
