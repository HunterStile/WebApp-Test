"""
Script per verificare la versione di Chrome e suggerire il ChromeDriver corretto
"""

import subprocess
import os
import platform


def get_chrome_version():
    """Prova a ottenere la versione di Chrome installata"""
    try:
        # Windows
        if platform.system() == "Windows":
            # Try different paths where Chrome might be installed
            paths = [
                r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                os.path.expanduser(r"~\AppData\Local\Google\Chrome\Application\chrome.exe"),
            ]
            
            for path in paths:
                if os.path.exists(path):
                    try:
                        # Get version using wmic
                        result = subprocess.run(
                            ['powershell', '-Command', f'(Get-Item "{path}").VersionInfo.FileVersion'],
                            capture_output=True,
                            text=True,
                            timeout=5
                        )
                        if result.returncode == 0:
                            version = result.stdout.strip()
                            if version:
                                return version, path
                    except:
                        pass
        
        return None, None
    except Exception as e:
        return None, None


def main():
    print("""
╔════════════════════════════════════════════════════════════╗
║       VERIFICA CHROME E CHROMEDRIVER                       ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    print("\n🔍 Ricerca versione di Chrome...")
    version, path = get_chrome_version()
    
    if version:
        print(f"✅ Chrome trovato!")
        print(f"   Percorso: {path}")
        print(f"   Versione: {version}")
        
        # Extract major version
        major_version = version.split('.')[0]
        
        print(f"\n📥 SCARICA CHROMEDRIVER COMPATIBILE:")
        print(f"   Versione necessaria: {major_version}.x.x.x")
        print(f"\n   🔗 Link diretto:")
        print(f"   https://googlechromelabs.github.io/chrome-for-testing/")
        print(f"\n   📌 Cerca: ChromeDriver {major_version} - Windows 64-bit")
        
    else:
        print("❌ Chrome non trovato automaticamente")
        print("\n💡 OPZIONI:")
        print("1. Installa Google Chrome da: https://www.google.com/chrome/")
        print("2. Usa Microsoft Edge (già installato su Windows)")
        print("3. Specifica manualmente la versione di Chrome")
    
    print("\n" + "="*60)
    print("📝 ISTRUZIONI PER INSTALLARE CHROMEDRIVER:")
    print("="*60)
    print("\n1️⃣ VAI AL SITO:")
    print("   https://googlechromelabs.github.io/chrome-for-testing/")
    
    print("\n2️⃣ SCARICA LA VERSIONE GIUSTA:")
    if version:
        print(f"   • Cerca ChromeDriver versione {major_version}")
    print("   • Seleziona 'Windows 64' (win64)")
    print("   • Scarica il file .zip")
    
    print("\n3️⃣ INSTALLA:")
    print("   • Estrai il file .zip")
    print("   • Troverai 'chromedriver.exe'")
    print("   • Opzione A: Mettilo in C:\\Windows\\System32\\")
    print("   • Opzione B: Mettilo in una cartella e aggiungi al PATH")
    
    print("\n4️⃣ VERIFICA INSTALLAZIONE:")
    print("   • Apri PowerShell")
    print("   • Digita: chromedriver --version")
    print("   • Dovresti vedere la versione")
    
    print("\n" + "="*60)
    print("🔄 ALTERNATIVA: USA MICROSOFT EDGE")
    print("="*60)
    print("\nSe hai problemi con Chrome, usa Edge:")
    print("1. pip install msedge-selenium-tools")
    print("2. Lo script si adatterà automaticamente")
    
    print("\n" + "="*60)
    input("\n✅ Premi INVIO per chiudere...")


if __name__ == "__main__":
    main()
