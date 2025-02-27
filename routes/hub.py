from flask import Blueprint, render_template, session, redirect, url_for
from werkzeug.security import safe_str_cmp

hub_bp = Blueprint("hub", __name__)

@hub_bp.route("/hub")
def hub():
    if "user" in session:
        return render_template("hub.html", username=session["user"])
    else:
        return redirect(url_for("login.login"))
        