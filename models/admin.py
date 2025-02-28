from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Admin(db.Model):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_default = db.Column(db.Boolean, default=False)

    user = db.relationship('User', backref=db.backref('admins', lazy=True))

class User(db.Model):
    __tablename__ = 'user_credentials'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        """Hash and set the password"""
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        """Check password"""
        return check_password_hash(self.password_hash, password)
