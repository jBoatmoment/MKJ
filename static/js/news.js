function initializeApp() {
    console.log('News app initialization started');
    setupEventListeners();
    fetchNews('business');
}

function cleanupApp() {
    console.log('News app cleanup');
    // Reset any resources used by the app
    const newsContainer = document.getElementById('news-root');
    if (newsContainer) {
        const newsList = newsContainer.querySelector('.news-list');
        if (newsList) {
            newsList.innerHTML = '<div class="loading">Loading news feed...</div>';
        }
    }
}

function setupEventListeners() {
    const newsContainer = document.getElementById('news-root');
    
    // Event delegation for category buttons
    newsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-btn')) {
            const category = e.target.getAttribute('data-category');
            if (category) {
                // Update active button
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Fetch news for the selected category
                fetchNews(category);
            }
        }
    });

    // Toggle advanced options
    const toggleBtn = document.getElementById('toggle-advanced');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const advancedSection = document.getElementById('advanced-options');
            if (advancedSection.style.display === 'none') {
                advancedSection.style.display = 'block';
                this.textContent = 'Hide Advanced Options';
            } else {
                advancedSection.style.display = 'none';
                this.textContent = 'Show Advanced Options';
            }
        });
    }

    // Custom URL button
    const applyUrlBtn = document.getElementById('apply-custom-url');
    if (applyUrlBtn) {
        applyUrlBtn.addEventListener('click', function() {
            const customUrl = document.getElementById('custom-api-url').value.trim();
            if (customUrl) {
                const activeCategory = document.querySelector('.filter-btn.active').getAttribute('data-category');
                fetchNews(activeCategory, customUrl);
            } else {
                alert('Please enter a custom API URL');
            }
        });
    }

    // Fetch source button
    const fetchSourceBtn = document.getElementById('fetch-source');
    if (fetchSourceBtn) {
        fetchSourceBtn.addEventListener('click', function() {
            fetchSourceDetails();
        });
    }

    // Import news button
    const importNewsBtn = document.getElementById('import-news');
    if (importNewsBtn) {
        importNewsBtn.addEventListener('click', function() {
            importNewsData();
        });
    }
}

function fetchNews(category, customUrl = null) {
    const newsContainer = document.getElementById('news-root');
    const newsList = newsContainer.querySelector('.news-list');
    
    // Show loading state
    newsList.innerHTML = '<div class="loading">Loading news feed...</div>';
    
    // Build the API URL
    let apiUrl = `/apps/news/fetch?category=${category}`;
    if (customUrl) {
        apiUrl += `&api_url=${encodeURIComponent(customUrl)}`;
    }
    
    console.log(`Fetching news from: ${apiUrl}`);
    
    // Fetch news from the server
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            renderNews(data);
            updateDebugInfo(data);
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            newsList.innerHTML = `
                <div class="error-message">
                    Failed to load news. Please try again later.
                    <br><small>${error.message}</small>
                </div>
            `;
            updateDebugInfo({ error: error.message });
        });
}

function renderNews(data) {
    const newsContainer = document.getElementById('news-root');
    const newsList = newsContainer.querySelector('.news-list');
    
    if (!data || !data.success || !data.data || data.data.length === 0) {
        newsList.innerHTML = '<div class="error-message">No news articles found.</div>';
        return;
    }
    
    const newsItems = data.data; 
    
    let html = '';
    
    // Add each news item
    newsItems.forEach(item => {
        const date = new Date(item.date || new Date()).toLocaleDateString();
        const hasImage = item.imageUrl && item.imageUrl !== 'null';
        html += `
            <div class="news-item">
                <div class="news-title">${item.title}</div>
                ${hasImage ? `<div class="news-image"><img src="${item.imageUrl}" alt="${item.title}"></div>` : ''}
                <div class="news-content">${item.content}</div>
                <div class="news-meta">
                    <span>${date}</span>
                    <a href="${item.readMoreUrl}" target="_blank" class="read-more">Read more</a>
                </div>
            </div>
        `;
    });
    
    newsList.innerHTML = html;
    
    // Update timestamp
    const updateTime = document.getElementById('update-time');
    if (updateTime) {
        updateTime.textContent = new Date().toLocaleTimeString();
    }
}

function updateDebugInfo(data) {
    const debugOutput = document.getElementById('debug-output');
    if (debugOutput) {
        debugOutput.style.display = 'block';
        
        // Format the data for display
        let debugText = '';
        if (data.error) {
            debugText = `Error: ${data.error}`;
        } else {
            // Show a truncated version of the response
            const simplifiedData = {...data};
            if (simplifiedData.data && simplifiedData.data.length > 2) {
                simplifiedData.data = [
                    simplifiedData.data[0],
                    simplifiedData.data[1],
                    "... (truncated for display)"
                ];
            }
            debugText = 'API Response:\n' + JSON.stringify(simplifiedData, null, 2);
        }
        
        debugOutput.textContent = debugText;
    }
}

function fetchSourceDetails() {
    const sourceId = document.getElementById('source-id').value.trim();
    const sourceDetails = document.getElementById('source-details');
    
    sourceDetails.innerHTML = '<div class="loading">Loading source details...</div>';
    sourceDetails.style.display = 'block';
    
    fetch(`/apps/news/admin/fetch_source?id=${sourceId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sourceDetails.innerHTML = `<pre>${JSON.stringify(data.source, null, 2)}</pre>`;
            } else {
                sourceDetails.innerHTML = `<div class="error-message">${data.error || 'Source not found'}</div>`;
            }
        })
        .catch(error => {
            sourceDetails.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
        });
}

function importNewsData() {
    const importData = document.getElementById('import-data').value.trim();
    if (!importData) {
        alert('Please enter base64 encoded data');
        return;
    }
    
    const formData = new FormData();
    formData.append('data', importData);
    
    fetch('/apps/news/import', {
        method: 'POST',
        headers: {
            'CSRF-Token': document.querySelector('meta[name="csrf_token"]').content
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Import successful! ${data.count} items imported.`);
        } else {
            alert(`Import failed: ${data.error}`);
        }
    })
    .catch(error => {
        alert(`Error: ${error.message}`);
    });
}

function generateExamplePicklePayload() {
    const payload = "KGRwMApTJ2V4YW1wbGUnCnAxClMndGVzdCBwYXlsb2FkJwpwMgpzLg==";
    
    navigator.clipboard.writeText(payload)
        .then(() => {
            alert("Example payload copied to clipboard! Use it in the Import field.");
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
            alert("Example payload: " + payload);
        });
}

// Make functions available globally
window.initializeApp = initializeApp;
window.cleanupApp = cleanupApp;
window.fetchNews = fetchNews;
window.generateExamplePicklePayload = generateExamplePicklePayload;

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('news-root')) {
        initializeApp();
    }
});

console.log('News.js loaded');