from flask import Blueprint, render_template, jsonify, request, Flask
from flask_limiter import RateLimitExceeded
from flask_wtf import CSRFProtect
import requests
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import json

news_bp = Blueprint('news', __name__, url_prefix='/apps/news')

app = Flask(__name__)
csrf_token = CSRFProtect(app)

#logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

#Limit the number of requests to the news API
limiter = Limiter(key_func=get_remote_address, default_limits=["10 per minute"])

# Base URL for the News API
NEWS_API_BASE_URL = "https://saurav.tech/NewsAPI"

# Mapping of our categories to API categories
CATEGORY_MAPPING = {
    'business': 'business',
    'technology': 'technology',
    'world': 'general'
}

DEFAULT_COUNTRY = 'us'

INTERNAL_NEWS = [
    {
        "title": "CONFIDENTIAL: Security Breach Report Q3",
        "description": "Details of recent security incidents affecting customer data. For internal review only.",
        "url": "#internal-only",
        "publishedAt": "2025-01-15T08:30:00Z",
        "urlToImage": ""
    },
    {
        "title": "CONFIDENTIAL: Upcoming Product Launch",
        "description": "Specifications for our next-gen product launch in Q2. Contains proprietary information.",
        "url": "#internal-only",
        "publishedAt": "2025-02-01T10:15:00Z",
        "urlToImage": ""
    }
]

@news_bp.route('/')
def news_page():
    """Render the news page"""
    return render_template('news.html')


def validate_category(input_category):
    if input_category not in CATEGORY_MAPPING:
        return 'business'
    return input_category

def validate_filter(input_filter):
    try:
        filter_options = json.loads(input_filter)
        if not isinstance(filter_options, dict):
            raise ValueError("Filter must be a valid dictionary")
        return filter_options
    except json.JSONDecodeError:
        logger.exception(f"Invalid filter parameter: {input_filter}")
        return {}

@news_bp.route('/fetch', methods=['GET'])
@limiter.limit("5 per minute")    
def fetch_news():
    """Fetch news from the News API with a vulnerability"""
    try:
        # Get category from request, default to business
        category = request.args.get(validate_category('category'))

        # Map our category to API category
        api_category = CATEGORY_MAPPING.get(category, 'business')
        api_url = f"{NEWS_API_BASE_URL}/top-headlines/category/{api_category}/{DEFAULT_COUNTRY}.json"
        
        logger.info(f"Fetching news from {api_url}")

        # Fetch news from external API
        response = requests.get(api_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            articles = data.get('articles', [])[:10]  # Limit to 10 articles
            
            filter_param = request.args.get('filter', '{}')
            
            validate_filter(filter_param)

            # Transform the data to match our expected format
            transformed_data = {
                'success': True,
                'category': category,
                'data': []
            }
            
            # Process articles
            for article in articles:
                transformed_data['data'].append({
                    'title': article.get('title', 'No Title'),
                    'content': article.get('description', 'No content available'),
                    'date': article.get('publishedAt', ''),
                    'readMoreUrl': article.get('url', '#'),
                    'imageUrl': article.get('urlToImage', '')
                })
            
            return jsonify(transformed_data)
        else:
            return jsonify({
                'success': False,
                'error': f'Failed to fetch news. Status code: {response.status_code}'
            }), response.status_code
    except Exception as e:
        logger.exception(f"Error fetching news: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
@news_bp.errorhandler(RateLimitExceeded)
def ratelimit_handler(e):
    return jsonify({
        'success': False,
        'error': 'Rate limit exceeded. Please try again later.'
    }), 429