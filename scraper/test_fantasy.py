"""
Test rapido Fantasy Team con multi-URL
"""
from scraper import OddsScraper
import json

print("""
╔════════════════════════════════════════════════════════════╗
║       TEST FANTASY TEAM - MULTI COMPETIZIONI               ║
╚════════════════════════════════════════════════════════════╝
""")

print("\n🚀 Avvio scraper Fantasy Team...")
scraper = OddsScraper(headless=False)

try:
    matches = scraper.scrape_fantasy_team()
    
    print(f"\n{'='*60}")
    print(f"📊 RISULTATI FINALI: {len(matches)} partite trovate")
    print(f"{'='*60}\n")
    
    if matches:
        # Mostra le prime 10
        print("🎯 Prime 10 partite:")
        for i, match in enumerate(matches[:10], 1):
            print(f"  {i}. {match['home_team']} vs {match['away_team']}")
            print(f"     Quote: 1={match['odds']['1']:.2f} X={match['odds']['X']:.2f} 2={match['odds']['2']:.2f}")
            print(f"     Ora: {match['commence_time']}")
        
        if len(matches) > 10:
            print(f"\n  ... e altre {len(matches) - 10} partite")
        
        # Salva risultati
        with open('fantasy_team_test.json', 'w', encoding='utf-8') as f:
            json.dump(matches, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Tutti i risultati salvati in: fantasy_team_test.json")
        print(f"\n🎉 SUCCESSO! Fantasy Team multi-URL funziona!")
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
