from flask import Blueprint, render_template, request, jsonify, session, send_from_directory
from extensions import db
from models.user import User
from models.file import File
import os
import mimetypes
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = os.path.abspath('uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

files_bp = Blueprint('files', __name__, url_prefix='/apps/files')

def allowed_file(filename):
    """Check if the uploaded file has a valid extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@files_bp.route('/')
def files():
    """Render files page with all files uploaded by the current user."""
    if 'user' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    current_user = User.query.filter_by(username=session['user']).first()
    if not current_user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    all_files = File.query.filter_by(user_id=current_user.id).order_by(File.uploaded_at.desc()).all()
    return render_template('files.html', files=all_files, current_user_id=current_user.id)

@files_bp.route('/upload', methods=['POST'])
def upload_file():
    """Securely handle file upload."""
    if 'user' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    current_user = User.query.filter_by(username=session['user']).first()
    if not current_user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400

    if not allowed_file(file.filename):
        return jsonify({'success': False, 'error': 'Invalid file type'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    # Prevent overwriting files
    if os.path.exists(file_path):
        return jsonify({'success': False, 'error': 'File already exists'}), 409

    try:
        file.save(file_path)

        new_file = File(
            filename=filename,
            file_path=file_path,
            user_id=current_user.id
        )
        db.session.add(new_file)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'File uploaded successfully!',
            'file': new_file.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'File upload failed'}), 500

@files_bp.route('/delete/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Securely delete a file."""
    if 'user' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    current_user = User.query.filter_by(username=session['user']).first()
    if not current_user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    file = File.query.filter_by(id=file_id, user_id=current_user.id).first()
    if not file:
        return jsonify({'success': False, 'error': 'File not found or unauthorized'}), 403

    file_path = file.file_path

    try:
        db.session.delete(file)
        db.session.commit()

        if os.path.exists(file_path):
            os.remove(file_path)

        return jsonify({'success': True, 'message': 'File deleted successfully'})
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'File deletion failed'}), 500

@files_bp.route('/download/<int:file_id>')
def download_file(file_id):
    """Securely download a file."""
    if 'user' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    current_user = User.query.filter_by(username=session['user']).first()
    if not current_user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    file = File.query.filter_by(id=file_id, user_id=current_user.id).first()
    if not file:
        return jsonify({'success': False, 'error': 'File not found or unauthorized'}), 403

    directory = os.path.dirname(file.file_path)
    filename = os.path.basename(file.file_path)

    if not os.path.exists(file.file_path):
        return jsonify({'success': False, 'error': 'File not found on server'}), 404

    return send_from_directory(directory, filename, as_attachment=True)