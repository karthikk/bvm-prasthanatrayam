class VerseViewer {
    constructor(dataPath, containerId) {
        this.dataPath = dataPath;
        this.containerId = containerId;
        this.data = null;
        
        this.init();
    }
    
    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.render();
        } catch (error) {
            console.error('Error loading verse data:', error);
            document.getElementById(this.containerId).innerHTML = '<p>Error loading content. Please check the data file.</p>';
        }
    }
    
    render() {
        const container = document.getElementById(this.containerId);
        
        const headerHtml = `
            <div class="breadcrumb">
                <a href="../index.html">Home</a> 
                <span>></span> 
                <a href="index.html">${this.getParentTitle()}</a>
                <span>></span> 
                <span>${this.data.title || this.data.name}</span>
            </div>
            
            <a href="index.html" class="back-button">← Back to ${this.getParentTitle()}</a>
            
            <div class="book-header-compact">
                <div class="book-title-row">
                    <div class="book-title-section">
                        <h1 class="book-main-title">${this.data.title || this.data.name}</h1>
                        <h2 class="book-subtitle">${this.data.english_title || this.data.subtitle || ''}</h2>
                    </div>
                    <div class="book-meta-section">
                        <span class="book-stat">
                            <strong>${this.data.total_shlokas || this.data.total_mantras || (this.data.shlokas || this.data.mantras || []).length}</strong> 
                            ${this.data.shlokas ? 'Shlokas' : 'Mantras'}
                        </span>
                        ${this.data.playlist_url ? `
                            <a href="${this.data.playlist_url}" target="_blank" class="playlist-link">📺 Playlist</a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Render introduction section if available
        const introHtml = this.data.introduction ? `
            <div class="section-divider">
                <h3 class="section-title">📚 Introduction</h3>
            </div>
            ${this.data.introduction.map(intro => this.renderIntroSummary(intro)).join('')}
        ` : '';
        
        const verses = this.data.shlokas || this.data.mantras || [];
        const versesHtml = verses.map(verse => this.renderVerse(verse)).join('');
        
        // Render summary section if available
        const summaryHtml = this.data.summary ? `
            <div class="section-divider">
                <h3 class="section-title">📝 Summary</h3>
            </div>
            ${this.data.summary.map(summary => this.renderIntroSummary(summary)).join('')}
        ` : '';
        
        container.innerHTML = headerHtml + introHtml + versesHtml + summaryHtml;
    }
    
    renderVerse(verse) {
        const videosHtml = verse.videos?.map(video => `
            <a href="${video.url}${video.start_time ? `&t=${this.timeToSeconds(video.start_time)}s` : ''}" 
               target="_blank" class="youtube-link">
                📺 ${video.title}
                ${video.start_time ? `<span class="timestamp">${video.start_time}${video.end_time ? ` - ${video.end_time}` : ''}</span>` : ''}
            </a>
        `).join('') || '';
        
        return `
            <div class="verse-container">
                <div class="verse-header">
                    <div class="verse-number">${this.data.shlokas ? 'श्लोक' : 'मन्त्र'} ${verse.number}</div>
                </div>
                
                <div class="verse-content">
                    <div class="verse-sanskrit">${verse.sanskrit}</div>
                    
                    ${verse.transliteration ? `
                        <div class="verse-transliteration">${verse.transliteration}</div>
                    ` : ''}
                    
                    
                    ${videosHtml ? `
                        <div class="youtube-links">
                            ${videosHtml}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    renderIntroSummary(item) {
        const videosHtml = item.videos?.map(video => `
            <a href="${video.url}${video.start_time ? `&t=${this.timeToSeconds(video.start_time)}s` : ''}" 
               target="_blank" class="youtube-link">
                📺 ${video.title}
                ${video.start_time ? `<span class="timestamp">${video.start_time}${video.end_time ? ` - ${video.end_time}` : ''}</span>` : ''}
            </a>
        `).join('') || '';
        
        return `
            <div class="intro-summary-container">
                <div class="intro-summary-header">
                    <div class="intro-summary-title">${item.title}</div>
                </div>
                
                <div class="intro-summary-content">
                    <div class="intro-summary-description">${item.description}</div>
                    
                    ${videosHtml ? `
                        <div class="youtube-links">
                            ${videosHtml}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    getParentTitle() {
        return this.data.shlokas ? 'Bhagavad Gita' : 'Upanishads';
    }
    
    timeToSeconds(timeStr) {
        // Convert "2:15" or "2:15:30" to seconds for YouTube URL
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        return 0;
    }
}