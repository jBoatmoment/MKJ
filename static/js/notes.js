
function initializeApp() {
    console.log('Notes app initialization started');
    
    attachEventHandlers();
}

function attachEventHandlers() {
    console.log('Attaching event handlers');
    
    const form = document.getElementById('note-form');
    if (form) {
        console.log('Found note form, attaching submit handler');
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Form submitted');
            saveNote();
        });
    } else {
        console.error('Note form not found');
    }

    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        console.log('Found search button, attaching click handler');
        searchButton.addEventListener('click', function() {
            console.log('Search button clicked');
            searchNotes();
        });
    } else {
        console.error('Search button not found');
    }

    document.querySelectorAll('.delete-note').forEach(button => {
        button.addEventListener('click', function() {
            const noteId = this.getAttribute('data-note-id');
            deleteNote(noteId);
        });
    });
}

function saveNote() {
    console.log('Saving note...');
    
    const titleInput = document.querySelector('input[name="title"]');
    const contentInput = document.querySelector('textarea[name="content"]');
    
    if (!titleInput || !contentInput) {
        console.error('Cannot find title or content inputs');
        return;
    }
    
    const title = titleInput.value;
    const content = contentInput.value;
    
    console.log('Title:', title);
    console.log('Content:', content);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    
    fetch('/apps/notes/create', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Save response:', data);
        
        if (data.success) {
            console.log('Note saved successfully');
            titleInput.value = '';
            contentInput.value = '';
            
            const notesList = document.getElementById('notes-list');
            const note = data.note;
            const noteHtml = `
                <div class="note-card">
                    <h3>${note.title}</h3>
                    <div class="note-content">${note.content}</div>
                    <div class="note-meta">
                        ID: ${note.id} | Created: ${note.created_at}
                        <button type="button" class="delete-note" data-note-id="${note.id}">Delete</button>
                    </div>
                </div>
            `;
            notesList.insertAdjacentHTML('afterbegin', noteHtml);
            
            const newDeleteButton = notesList.querySelector(`.delete-note[data-note-id="${note.id}"]`);
            if (newDeleteButton) {
                newDeleteButton.addEventListener('click', function() {
                    deleteNote(note.id);
                });
            }
        } else {
            console.error('Error saving note:', data.error || 'Unknown error');
            alert('Error saving note. Please try again.');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('Error saving note. Please try again.');
    });
}

function searchNotes() {
    const query = document.getElementById('search').value;
    console.log('Searching for:', query);
    
    fetch(`/apps/notes/search?q=${encodeURIComponent(query)}`)
    .then(response => {
        console.log('Search response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Search results:', data);
        
        const notesList = document.getElementById('notes-list');
        if (!notesList) {
            console.error('Notes list element not found');
            return;
        }
        
        if (data.success && Array.isArray(data.notes)) {
            console.log(`Found ${data.notes.length} notes matching query`);
            
            if (data.notes.length === 0) {
                notesList.innerHTML = '<div class="note-card"><p>No notes found matching your search.</p></div>';
                return;
            }
            
            notesList.innerHTML = '';
            data.notes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note-card';
                //Added a sanitizer to prevent XSS attacks
                noteElement.innerHTML = `
                <h3>${note.title})}</h3>
                <div class="note-content">${note.content}</div>
                `;
                notesList.appendChild(noteElement);
            });
            
            document.querySelectorAll('.delete-note').forEach(button => {
                button.addEventListener('click', function() {
                    const noteId = this.getAttribute('data-note-id');
                    deleteNote(noteId);
                });
            });
        } else {
            console.error('Search failed or returned invalid data');
            notesList.innerHTML = '<div class="note-card"><p>An error occurred while searching notes.</p></div>';
        }
    })
    .catch(error => {
        console.error('Search fetch error:', error);
        const notesList = document.getElementById('notes-list');
        if (notesList) {
            notesList.innerHTML = '<div class="note-card"><p>An error occurred while searching notes.</p></div>';
        }
    });
}

function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        console.log('Deleting note:', noteId);
        
        fetch(`/apps/notes/delete/${noteId}`, {
            method: 'DELETE'
        })
        .then(response => {
            console.log('Delete response status:', response.status);
            
            if (response.status === 404) {
                throw new Error('Note not found');
            }
            return response.json();
        })
        .then(data => {
            console.log('Delete response data:', data);
            
            if (data.success) {
                console.log('Note deleted successfully');
                
                const deleteBtn = document.querySelector(`.delete-btn[data-note-id="${noteId}"]`);
                if (deleteBtn) {
                    const noteElement = deleteBtn.closest('.note-card');
                    if (noteElement) {
                        noteElement.remove();
                    } else {
                        console.error('Note element not found');
                    }
                } else {
                    const notes = document.querySelectorAll('.note-card');
                    let found = false;
                    for (let i = 0; i < notes.length; i++) {
                        const button = notes[i].querySelector(`.delete-btn[onclick*="${noteId}"]`);
                        if (button) {
                            notes[i].remove();
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        console.error('Could not find note element to remove');
                        window.location.reload();
                    }
                }
            } else {
                console.error('Delete failed:', data.error || 'Unknown error');
                alert('Error deleting note: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Delete error:', error);
            alert('Error deleting note: ' + error.message);
        });
    }
}

function cleanupApp() {
    console.log('Cleaning up notes app');
}

window.initializeApp = initializeApp;
window.cleanupApp = cleanupApp;

console.log('Notes script loaded and functions defined');