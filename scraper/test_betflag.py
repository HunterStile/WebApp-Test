"""
Test rapido Betflag Exchange con navigazione competizioni
"""
from scraper import OddsScraper
import json

print("""
╔════════════════════════════════════════════════════════════╗
║       TEST BETFLAG EXCHANGE - MULTI COMPETIZIONI           ║
╚════════════════════════════════════════════════════════════╝
""")

print("\n🚀 Avvio scraper Betflag Exchange...")
scraper = OddsScraper(headless=False)

try:
    matches = scraper.scrape_betfair_exchange()
    
    print(f"\n{'='*70}")
    print(f"📊 RISULTATI FINALI: {len(matches)} partite trovate")
    print(f"{'='*70}\n")
    
    if matches:
        # Mostra tutte le partite con numerazione
        print("🎯 TUTTE LE PARTITE TROVATE:\n")
        for i, match in enumerate(matches, 1):
            print(f"{i:3d}. {match['home_team']:25s} vs {match['away_team']:25s}")
            print(f"      Quote LAY: 1={match['odds']['1']:6.2f}  X={match['odds']['X']:6.2f}  2={match['odds']['2']:6.2f}  |  {match['commence_time']}")
        
        print(f"\n{'='*70}")
        print(f"✅ TOTALE: {len(matches)} PARTITE ESTRATTE")
        print(f"{'='*70}")
        
        # Salva risultati
        with open('betflag_exchange_test.json', 'w', encoding='utf-8') as f:
            json.dump(matches, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Tutti i risultati salvati in: betflag_exchange_test.json")
        print(f"\n🎉 SUCCESSO! Betflag Exchange multi-competizioni funziona!")
    else:
        print("\n❌ Nessuna partita trovata")
    
except Exception as e:
    print(f"\n❌ ERRORE: {e}")
    import traceback
    traceback.print_exc()

finally:
    print("\n⏳ Chiudo browser...")
    scraper.close()
    print("✅ Test completato!")
