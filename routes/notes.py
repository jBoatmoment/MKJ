from flask import Blueprint, render_template, request, jsonify, session
from extensions import db
from models.user import User
from models.note import Note
from datetime import datetime
from sqlalchemy import text
import logging

#logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

notes_bp = Blueprint('notes', __name__, url_prefix='/apps/notes')

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
    
    return render_template('notes.html', notes=all_notes, current_user_id=current_user.id)

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
    
    if not title or not content:
        return jsonify({'success': False, 'error': 'Title and content are required'}), 400
    
    try:
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
        sql = f"SELECT * FROM notes WHERE title LIKE '%{query}%' OR content LIKE '%{query}%'"
        
        # Log the raw SQL for debugging
        logger.info(f"Executing SQL: {sql}")
        
        # Execute the raw SQL
        result = db.session.execute(text(sql))
        
        notes = []
        for row in result:
            # Handle created_at formatting properly - could be a string or datetime
            created_at = row[3]
            if isinstance(created_at, str):
                created_at_str = created_at
            else:
                try:
                    created_at_str = created_at.strftime('%Y-%m-%d %H:%M:%S') if created_at else None
                except AttributeError:
                    created_at_str = str(created_at) if created_at else None
            
            note = {
                'id': row[0],
                'title': row[1],
                'content': row[2],
                'created_at': created_at_str,
                'user_id': row[4]
            }
            notes.append(note)
        
        logger.info(f"Found {len(notes)} matching notes")
        return jsonify({
            'success': True,
            'notes': notes
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