from flask import Blueprint, send_file, session
from io import BytesIO
import random
import string
from utils.captcha import generate_captcha

captcha_bp = Blueprint("captcha", __name__)

@captcha_bp.route("/captcha/generate", methods=["GET"])
def get_captcha():
    """Generate a new CAPTCHA image - intentionally simplified"""
    
    captcha_text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    session['captcha_text'] = captcha_text
    
    image = generate_captcha(captcha_text)
    img_io = BytesIO()
    image.save(img_io, 'PNG')
    img_io.seek(0)
    
    return send_file(img_io, mimetype='image/png')