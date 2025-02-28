from flask import Blueprint, render_template
from markupsafe import escape

home_bp = Blueprint("home", __name__)

@home_bp.route("/")
def home():
    return render_template("home.html")
