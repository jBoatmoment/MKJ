from flask import Blueprint, render_template, request, flash, redirect, session, url_for, Flask
from werkzeug.security import generate_password_hash, check_password_hash
from flask_wtf import CSRFProtect
from models.user import User
from extensions import db
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
#csrf_token = CSRFProtect(app)

login_bp = Blueprint("login", __name__)


@login_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        hashed_password = generate_password_hash(password)

        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password) and check_password_hash(hashed_password, password):
            session["user"] = user.username
            flash("Login successful!", "success")
            return redirect(url_for("hub.hub"))
        else:
            flash("Invalid username or password.", "error")

    return render_template("login.html")

@login_bp.route("/logout")
def logout():
    session.pop("user", None)
    session.pop('_flashes',None)
    flash("You have been logged out.", "info")
    return redirect(url_for("login.login"))
