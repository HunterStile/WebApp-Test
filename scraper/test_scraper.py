"""
Test rapido dello scraper con i nuovi selettori
"""

from scraper import OddsScraper
import json

def test_scraper():
    print("""
╔════════════════════════════════════════════════════════════╗
║       TEST SCRAPER - Fantasy Team & Betfair                ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    scraper = OddsScraper(headless=False)  # Visible browser for debugging
    
    try:
        print("\n" + "="*60)
        print("TEST 1: FANTASY TEAM")
        print("="*60)
        
        fantasy_data = scraper.scrape_fantasy_team()
        
        print(f"\n📊 RISULTATI FANTASY TEAM:")
        print(f"   Partite trovate: {len(fantasy_data)}")
        
        if fantasy_data:
            print("\n   Prime 3 partite:")
            for i, match in enumerate(fantasy_data[:3], 1):
                print(f"\n   {i}. {match['home_team']} vs {match['away_team']}")
                print(f"      Quote: 1={match['odds']['1']}, X={match['odds']['X']}, 2={match['odds']['2']}")
                print(f"      Orario: {match['commence_time']}")
        
        print("\n" + "="*60)
        print("TEST 2: BETFAIR EXCHANGE")
        print("="*60)
        
        betfair_data = scraper.scrape_betfair_exchange()
        
        print(f"\n📊 RISULTATI BETFAIR:")
        print(f"   Partite trovate: {len(betfair_data)}")
        
        if betfair_data:
            print("\n   Prime 3 partite:")
            for i, match in enumerate(betfair_data[:3], 1):
                print(f"\n   {i}. {match['home_team']} vs {match['away_team']}")
                print(f"      Quote: 1={match['odds']['1']}, X={match['odds']['X']}, 2={match['odds']['2']}")
                print(f"      Orario: {match['commence_time']}")
        
        # Salva risultati
        results = {
            'fantasy_team': fantasy_data,
            'betfair_exchange': betfair_data,
            'summary': {
                'fantasy_team_matches': len(fantasy_data),
                'betfair_matches': len(betfair_data)
            }
        }
        
        with open('test_results.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print("\n" + "="*60)
        print("✅ TEST COMPLETATO!")
        print("="*60)
        print(f"\n💾 Risultati salvati in: test_results.json")
        print(f"\n📊 RIEPILOGO:")
        print(f"   Fantasy Team: {len(fantasy_data)} partite")
        print(f"   Betfair Exchange: {len(betfair_data)} partite")
        
        if len(fantasy_data) > 0 and len(betfair_data) > 0:
            print(f"\n🎉 SUCCESSO! Lo scraper funziona correttamente!")
            print(f"\n🚀 PROSSIMI PASSI:")
            print(f"   1. Avvia l'API Flask: python api.py")
            print(f"   2. Avvia il backend Node.js")
            print(f"   3. Avvia il frontend React")
        elif len(fantasy_data) > 0:
            print(f"\n⚠️ Fantasy Team OK, Betfair necessita miglioramenti")
        elif len(betfair_data) > 0:
            print(f"\n⚠️ Betfair OK, Fantasy Team necessita miglioramenti")
        else:
            print(f"\n❌ Nessuna partita trovata. Rivedi i selettori.")
        
    except Exception as e:
        print(f"\n❌ ERRORE: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        print("\n⏳ Browser chiuderà tra 5 secondi...")
        import time
        time.sleep(5)
        scraper.close()


if __name__ == "__main__":
    test_scraper()
