from flask import Flask, Blueprint, render_template, abort, redirect, url_for, request
from flask_wtf import FlaskForm
from werkzeug.security import generate_password_hash, check_password_hash
from flask_wtf.csrf import CSRFProtect
import logging
import os

# Initialize Flask app
app = Flask(__name__)

# Set secret key for sessions and CSRF protection (should be complex and not hardcoded in production)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SESSION_COOKIE_SECURE'] = True  # Use secure cookies
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent JavaScript access to session cookies
app.config['SESSION_COOKIE_SAMESITE'] = 'Strict'  # Restrict cross-site cookies

# Enable HTTPS redirection
@app.before_request
def ensure_https():
    if not request.is_secure and not app.debug:
        return redirect(request.url.replace("http://", "https://", 1), 301)

# Enable CSRF protection
csrf = CSRFProtect(app)

# Enable logging for debugging
logging.basicConfig(level=logging.DEBUG)

# Blueprint for About Page
about_bp = Blueprint("about", __name__)

@about_bp.route("/about")
def about():
    try:
        return render_template("about.html")
    except Exception as e:
        app.logger.error(f"Error rendering about page: {e}")
        abort(500)  # Return a 500 Internal Server Error

# Register blueprint
app.register_blueprint(about_bp)

if __name__ == "__main__":
    app.run(debug=False, ssl_context='adhoc')  # Use SSL (HTTPS) for local development for security
