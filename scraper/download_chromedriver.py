"""
Script per scaricare e installare automaticamente ChromeDriver
"""

import requests
import zipfile
import os
import shutil
import json


def download_chromedriver():
    """Scarica ChromeDriver versione 141 per Windows 64-bit"""
    
    print("=" * 60)
    print("📥 DOWNLOAD AUTOMATICO CHROMEDRIVER")
    print("=" * 60)
    
    # URL for Chrome for Testing API
    api_url = "https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json"
    
    print("\n1️⃣ Ricerca versione ChromeDriver 141...")
    
    try:
        # Get available versions
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Find version 141.x.x.x
        chromedriver_url = None
        version_found = None
        
        for version_info in reversed(data['versions']):  # Start from newest
            version = version_info['version']
            if version.startswith('141.'):
                # Look for chromedriver download
                if 'downloads' in version_info and 'chromedriver' in version_info['downloads']:
                    for download in version_info['downloads']['chromedriver']:
                        if download['platform'] == 'win64':
                            chromedriver_url = download['url']
                            version_found = version
                            break
                if chromedriver_url:
                    break
        
        if not chromedriver_url:
            print("❌ Versione 141 non trovata nell'API")
            print("\n🔧 SOLUZIONE MANUALE:")
            print("1. Vai su: https://googlechromelabs.github.io/chrome-for-testing/")
            print("2. Cerca ChromeDriver 141 win64")
            print("3. Scarica il file .zip")
            print("4. Estrai chromedriver.exe in questa cartella")
            return False
        
        print(f"✅ Trovata versione: {version_found}")
        print(f"📍 URL: {chromedriver_url}")
        
        # Download
        print(f"\n2️⃣ Download in corso...")
        zip_path = "chromedriver_win64.zip"
        
        response = requests.get(chromedriver_url, stream=True, timeout=60)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        downloaded = 0
        
        with open(zip_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        percent = (downloaded / total_size) * 100
                        print(f"\r   Progresso: {percent:.1f}%", end='', flush=True)
        
        print("\n✅ Download completato!")
        
        # Extract
        print(f"\n3️⃣ Estrazione...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(".")
        
        print("✅ Estrazione completata!")
        
        # Find chromedriver.exe
        chromedriver_path = None
        for root, dirs, files in os.walk("."):
            for file in files:
                if file == "chromedriver.exe":
                    chromedriver_path = os.path.join(root, file)
                    break
            if chromedriver_path:
                break
        
        if chromedriver_path:
            # Move to current directory
            target_path = "chromedriver.exe"
            if os.path.exists(target_path):
                os.remove(target_path)
            
            shutil.move(chromedriver_path, target_path)
            print(f"✅ chromedriver.exe spostato nella cartella corrente")
            
            # Clean up
            if os.path.exists(zip_path):
                os.remove(zip_path)
            
            # Remove extracted folder
            for item in os.listdir("."):
                if os.path.isdir(item) and "chromedriver" in item.lower():
                    shutil.rmtree(item)
            
            print(f"\n" + "=" * 60)
            print("🎉 INSTALLAZIONE COMPLETATA!")
            print("=" * 60)
            print(f"\n✅ chromedriver.exe è ora disponibile in:")
            print(f"   {os.path.abspath(target_path)}")
            print(f"\n💡 Puoi ora eseguire:")
            print(f"   python inspect_simple.py")
            print(f"   python scraper.py")
            
            return True
        else:
            print("❌ chromedriver.exe non trovato nell'archivio")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Errore di rete: {e}")
        print("\n🔧 SOLUZIONE MANUALE:")
        print("1. Vai su: https://storage.googleapis.com/chrome-for-testing-public/141.0.7390.55/win64/chromedriver-win64.zip")
        print("2. Scarica il file .zip")
        print("3. Estrai chromedriver.exe")
        print("4. Mettilo in questa cartella")
        return False
    
    except Exception as e:
        print(f"\n❌ Errore: {e}")
        return False


def download_direct():
    """Download diretto dalla versione specifica"""
    print("\n🔄 Tentativo con URL diretto...")
    
    # URL diretto per versione 141.0.7390.55
    url = "https://storage.googleapis.com/chrome-for-testing-public/141.0.7390.55/win64/chromedriver-win64.zip"
    
    try:
        print(f"📥 Download da: {url}")
        
        response = requests.get(url, stream=True, timeout=60)
        response.raise_for_status()
        
        zip_path = "chromedriver_win64.zip"
        
        with open(zip_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        print("✅ Download completato!")
        
        # Extract
        print("📦 Estrazione...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(".")
        
        # Find and move chromedriver.exe
        chromedriver_path = None
        for root, dirs, files in os.walk("."):
            for file in files:
                if file == "chromedriver.exe":
                    chromedriver_path = os.path.join(root, file)
                    break
            if chromedriver_path:
                break
        
        if chromedriver_path:
            target_path = "chromedriver.exe"
            if os.path.exists(target_path):
                os.remove(target_path)
            
            shutil.move(chromedriver_path, target_path)
            
            # Clean up
            if os.path.exists(zip_path):
                os.remove(zip_path)
            
            for item in os.listdir("."):
                if os.path.isdir(item) and "chromedriver" in item.lower():
                    shutil.rmtree(item)
            
            print(f"\n🎉 SUCCESSO!")
            print(f"✅ chromedriver.exe installato in: {os.path.abspath(target_path)}")
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Errore: {e}")
        return False


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║       DOWNLOAD AUTOMATICO CHROMEDRIVER                     ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    print("\n🎯 Questo script scaricherà ChromeDriver 141 per Chrome 141.x")
    print("📍 Verrà salvato nella cartella corrente\n")
    
    input("Premi INVIO per iniziare il download...")
    
    # Try with API first
    success = download_chromedriver()
    
    # If failed, try direct URL
    if not success:
        print("\n" + "=" * 60)
        risposta = input("\n🔄 Vuoi provare con URL diretto? (s/n): ")
        if risposta.lower() == 's':
            success = download_direct()
    
    if not success:
        print("\n" + "=" * 60)
        print("❌ Download automatico fallito")
        print("\n🔧 SCARICA MANUALMENTE:")
        print("1. Apri: https://googlechromelabs.github.io/chrome-for-testing/")
        print("2. Cerca: ChromeDriver 141.0.7390.55 win64")
        print("3. Scarica e estrai chromedriver.exe")
        print("4. Metti il file in questa cartella")
        print(f"   {os.getcwd()}")
    
    print("\n" + "=" * 60)
    input("\n✅ Premi INVIO per chiudere...")
