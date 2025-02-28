from flask import Blueprint, render_template, request, jsonify, session, Flask
from extensions import db
from flask_wtf import CSRFProtect
from models.user import User
from models.note import Note
from models.admin import Admin
from datetime import datetime
from flask_limiter import Limiter
from sqlalchemy import text
import logging
from html import escape

#logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
notes_bp = Blueprint('notes', __name__, url_prefix='/apps/notes')

csrf_token = CSRFProtect(app)

limiter = Limiter(app)

def validate_note_input(title,content):
    sTitle = escape(title)
    sContent = escape(content)
    if not sTitle or not sContent:
        return False, "Title and content are required"
    if len(sTitle) > 100 or len(sContent) > 5000:
        return False, "Title or content exceeds allowed length"
    return True

def is_admin(user_id):
    admin = Admin.query.filter_by(user_id=user_id).first()
    return admin is not None

@notes_bp.route('/')
def notes():
    """Render notes page with all notes"""
    if 'user' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
        
    current_user = User.query.filter_by(username=session['user']).first()
    if not current_user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    
    user_id = request.args.get('user_id', current_user.id)

    
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        user_id = current_user.id

    all_notes = Note.query.filter_by(user_id=user_id).order_by(Note.created_at.desc()).all()
    logger.info(f"Loading notes page - Found {len(all_notes)} notes for user {user_id}")
    #if (is_admin(user_id)):
    #    return render_template('notes.html', notes=all_notes, current_user_id = current_user.id, is_admin=True)
    return render_template('notes.html', notes=all_notes, current_user_id=current_user.id)

@limiter.limit("5 per minute")
@notes_bp.route('/create', methods=['POST'])
def create_note():
    """Create a new note - Intentionally vulnerable to XSS"""
    if 'user' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
        
    current_user = User.query.filter_by(username=session['user']).first()
    if not current_user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    title = request.form.get('title')
    content = request.form.get('content')
    

    try:
        if not validate_note_input(title, content):
            return jsonify({'success': False, 'error': 'Not valid inputs'})
        logger.info(f"Creating note - Title: {title}, Content: {content}")
        
        note = Note(
            title=title,
            content=content,
            created_at=datetime.now(),
            user_id=current_user.id
        )
        
        db.session.add(note)
        db.session.commit()
        
        logger.info(f"Note created with ID: {note.id}")
        
        return jsonify({
            'success': True,
            'message': 'Note created successfully',
            'note': {
                'id': note.id,
                'title': note.title,
                'content': note.content,
                'created_at': note.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'user_id': note.user_id
            }
        })
    except Exception as e:
        logger.exception(f"Error creating note: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@notes_bp.route('/search')
def search_notes():
    """Search notes with intentional SQL injection vulnerability"""
    if 'user' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
        
    current_user = User.query.filter_by(username=session['user']).first()
    if not current_user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    query = request.args.get('q', '')
    logging.info(f"Search query: {query}")
    
    try:

        notes = Note.query.filter(
            (Note.title.like(f'%{query}%')) | (Note.content.like(f'%{query}%'))
             ).all()
    
        notes_list = [{
            'id' : note.id,
            'title': note.title,
            'content': note.content,
            'created_at': note.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'user_id': note.user_id
        }for note in notes]
        
        logger.info(f"Found {len(notes)} matching notes")
        return jsonify({
            'success': True,
            'notes': notes_list
        })
    except Exception as e:
        logger.exception(f"Error searching notes: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    

@notes_bp.route('/delete/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Delete a note with intentional access control vulnerability"""
    if 'user' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
        
    current_user = User.query.filter_by(username=session['user']).first()
    if not current_user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    try:
        note = Note.query.get(note_id)
        if not note:
            logger.error(f"Note not found: {note_id}")
            return jsonify({'success': False, 'error': f'Note with ID {note_id} not found'}), 404
        
        if note.user_id != current_user.id:
            logger.waring(f"Unauthorized delete attempt by user {current_user.id}")
            return jsonify({'success': False, 'error':'You do not have authorization to perform this action.'})
        
        logger.info(f"Deleting note ID: {note_id}, Title: {note.title}, Owner: {note.user_id}")
        
        db.session.delete(note)
        db.session.commit()
        
        logger.info(f"Note {note_id} deleted successfully")
        return jsonify({'success': True})
    except Exception as e:
        logger.exception(f"Error deleting note: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    
@notes_bp.route('/debug')
def debug_database():
    """Debug route to check database contents"""
    try:
        users = User.query.all()
        logger.info("\nAll Users:")
        for user in users:
            logger.info(f"ID: {user.id}, Username: {user.username}")
        
        notes = Note.query.all()
        logging.info("\nAll Notes:")
        for note in notes:
            logger.info(f"ID: {note.id}, Title: {note.title}, User ID: {note.user_id}")
        
        sql = text("SELECT * FROM notes")
        result = db.session.execute(sql)
        rows = result.fetchall()
        logger.info("\nRaw SQL Notes Query Result:")
        for row in rows:
            logger.info(row)
            
        return jsonify({
            'users': [{'id': u.id, 'username': u.username} for u in users],
            'notes': [note.to_dict() for note in notes]
        })
    except Exception as e:
        logger.exception(f"Debug Error: {e}")
        return jsonify({'error': str(e)}), 500