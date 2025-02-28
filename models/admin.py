from flask_sqlalchemy import SQLAlchemy
from extensions import db
from models.user import User

db = SQLAlchemy()


class Admin(db.Model):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_default = db.Column(db.Boolean, default=False)

    user = db.relationship("User", backref=db.backref('admins', lazy=True))

    def __repr__(self):
        return f"<Admin {self.user.username}>"