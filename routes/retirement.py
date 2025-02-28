from flask import Blueprint, render_template, jsonify, request, session
from extensions import db
from models.user import User
import time
from sqlalchemy import text

retirement_bp = Blueprint("retirement", __name__, url_prefix="/apps/401k")

user_accounts = {
    "alice": {"funds": 10000, "401k_balance": 5000},
    "bob": {"funds": 12000, "401k_balance": 7500},
    "charlie": {"funds": 15000, "401k_balance": 8084},
    "admin": {"funds": 20000, "401k_balance": 12000}
}

@retirement_bp.route("/")
def retirement_dashboard():
    if "user" not in session:
        return jsonify({"error": "Not logged in"}), 401
    return render_template("401k.html", username=session["user"])

@retirement_bp.route("/balance")
def get_balance():
    if "user" not in session:
        return jsonify({"error": "Not logged in"}), 401
        
    username = session["user"]
    if username not in user_accounts:
        user_accounts[username] = {"funds": 10000, "401k_balance": 0}
        
    return jsonify(user_accounts[username])

@retirement_bp.route("/contribute", methods=["POST"])
def contribute():
    if "user" not in session:
        return jsonify({"error": "Not logged in"}), 401
        
    data = request.get_json()
    amount = data.get("amount", 0)
    
    username = session["user"]
    if username not in user_accounts:
        user_accounts[username] = {"funds": 10000, "401k_balance": 0}
    
    user_data = user_accounts[username]

    if amount <= 0:
        return jsonify({
            "message": "Invalid contribution amount!", 
            "funds": user_data["funds"],
            "401k_balance": user_data["401k_balance"]
        }), 400
    
    if amount > user_data["funds"]:
        return jsonify({
            "message": "Insufficient personal funds for this contribution!", 
            "funds": user_data["funds"],
            "401k_balance": user_data["401k_balance"]
        }), 400

    time.sleep(2)  

    company_match = amount * 0.5
    total_contribution = amount + company_match

    user_data["funds"] -= amount  # Deduct funds
    user_data["401k_balance"] += total_contribution  # Add to 401k balance

    return jsonify({
        "message": f"Contributed ${amount}. Employer matched ${company_match}!",
        "funds": user_data["funds"],
        "401k_balance": user_data["401k_balance"]
    })

@retirement_bp.route("/reset", methods=["POST"])
def reset_account():
    if "user" not in session:
        return jsonify({"error": "Not logged in"}), 401
        
    username = session["user"]
    if username not in user_accounts:
        return jsonify({
            "message": "Account not found!", 
            "funds": 0,
            "401k_balance": 0
        }), 404
    
    user_accounts[username] = {"funds": 10000, "401k_balance": 0}
    
    return jsonify({
        "message": "Account reset successfully!",
        "funds": user_accounts[username]["funds"],
        "401k_balance": user_accounts[username]["401k_balance"]
    })
