"""
Flask API to expose scraped odds data
"""

from flask import Flask, jsonify
from flask_cors import CORS
from scraper import OddsScraper, match_odds, calculate_rating
import threading
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global cache for odds data
odds_cache = {
    'data': None,
    'timestamp': None,
    'is_scraping': False
}

# Cache duration in seconds (15 minutes)
CACHE_DURATION = 900


def scrape_odds_background():
    """Background task to scrape odds"""
    global odds_cache
    
    if odds_cache['is_scraping']:
        print("⏳ Scraping already in progress...")
        return
    
    odds_cache['is_scraping'] = True
    print("🚀 Starting background scraping...")
    
    scraper = None
    try:
        # Modalità headless per produzione
        scraper = OddsScraper(headless=True)
        data = scraper.scrape_all()
        
        # Match opportunities (note: chiave è 'betflag_exchange' non 'betfair_exchange')
        opportunities = match_odds(data['fantasy_team'], data['betflag_exchange'])
        
        odds_cache['data'] = {
            'opportunities': opportunities,
            'raw_data': data,
            'matched_count': len(opportunities),
            'fantasy_team_count': len(data['fantasy_team']),
            'betflag_count': len(data['betflag_exchange'])
        }
        odds_cache['timestamp'] = datetime.now()
        
        print(f"✅ Scraping completed: {len(opportunities)} opportunities found")
        
    except Exception as e:
        print(f"❌ Error during scraping: {str(e)}")
    finally:
        if scraper:
            scraper.close()
        odds_cache['is_scraping'] = False


def is_cache_valid():
    """Check if cache is still valid"""
    if not odds_cache['data'] or not odds_cache['timestamp']:
        return False
    
    elapsed = (datetime.now() - odds_cache['timestamp']).total_seconds()
    return elapsed < CACHE_DURATION


@app.route('/api/odds/fantasy-betfair', methods=['GET'])
def get_fantasy_betfair_odds():
    """Get matched odds between Fantasy Team and Betfair Exchange"""
    
    # Check if cache is valid
    if not is_cache_valid() and not odds_cache['is_scraping']:
        # Start background scraping
        thread = threading.Thread(target=scrape_odds_background)
        thread.daemon = True
        thread.start()
    
    if odds_cache['data']:
        # Return only the opportunities array for frontend compatibility
        return jsonify(odds_cache['data']['opportunities'])
    else:
        return jsonify({
            'message': 'Data not available yet. Scraping in progress...',
            'is_scraping': odds_cache['is_scraping']
        }), 202  # 202 Accepted - processing


@app.route('/api/odds/refresh', methods=['POST'])
def refresh_odds():
    """Force refresh of odds data"""
    if odds_cache['is_scraping']:
        return jsonify({
            'success': False,
            'message': 'Scraping already in progress'
        }), 409  # 409 Conflict
    
    # Start background scraping
    thread = threading.Thread(target=scrape_odds_background)
    thread.daemon = True
    thread.start()
    
    return jsonify({
        'success': True,
        'message': 'Scraping started'
    })


@app.route('/api/odds/status', methods=['GET'])
def get_status():
    """Get scraper status"""
    return jsonify({
        'is_scraping': odds_cache['is_scraping'],
        'has_data': odds_cache['data'] is not None,
        'cache_valid': is_cache_valid(),
        'last_update': odds_cache['timestamp'].isoformat() if odds_cache['timestamp'] else None,
        'opportunities_count': len(odds_cache['data']['opportunities']) if odds_cache['data'] else 0
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    print("🚀 Starting Flask API server...")
    print("📡 API will be available at http://localhost:5001")
    print("🔄 First scraping will start automatically on first request")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
