class BrahmasutramApp {
    constructor() {
        this.data = null;
        this.currentView = 'chapters';
        this.currentChapter = null;
        this.currentAdhikaranam = null;
        this.expandedSections = new Set();
        
        this.init();
    }
    
    async init() {
        try {
            const response = await fetch('../data/brahmasutram/brahmasutram.json');
            this.data = await response.json();
            this.render();
        } catch (error) {
            console.error('Error loading data:', error);
            document.getElementById('app').innerHTML = '<p>Error loading content. Please check data/brahmasutram.json file.</p>';
        }
    }
    
    render() {
        const app = document.getElementById('app');
        
        switch (this.currentView) {
            case 'chapters':
                app.innerHTML = this.renderChapters();
                break;
            case 'chapter':
                app.innerHTML = this.renderChapter();
                break;
            case 'adhikaranam':
                app.innerHTML = this.renderAdhikaranam();
                break;
        }
        
        this.attachEventListeners();
    }
    
    renderChapters() {
        const chapters = this.data.chapters.map(chapter => `
            <div class="chapter-card ${!chapter.enabled ? 'disabled' : ''}" 
                 data-chapter-id="${chapter.id}" 
                 onclick="${chapter.enabled ? `app.showChapter(${chapter.id})` : ''}">
                <div class="chapter-title">${chapter.title}</div>
                <div class="chapter-description">${chapter.description}</div>
                <div class="progress-indicator">
                    <span>${chapter.progress}%</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${chapter.progress}%"></div>
                    </div>
                    <span>${chapter.enabled ? 'In Progress' : 'Coming Soon'}</span>
                </div>
            </div>
        `).join('');
        
        return `
            <div class="breadcrumb">
                <a href="../index.html">Home</a>
                <span>></span>
                <span>Brahmasutram</span>
            </div>
            <h2 style="margin-bottom: 1.5rem; color: #8B4513;">Chapters</h2>
            <div class="chapter-grid">
                ${chapters}
            </div>
        `;
    }
    
    renderChapter() {
        const chapter = this.data.chapters.find(c => c.id === this.currentChapter);
        if (!chapter) return '<p>Chapter not found</p>';
        
        const sections = chapter.sections.map(section => `
            <div class="section-card">
                <div class="section-header" onclick="app.toggleSection(${section.id})">
                    <div class="section-title">${section.title}</div>
                    <div class="toggle-icon ${this.expandedSections.has(section.id) ? 'expanded' : ''}">▼</div>
                </div>
                ${this.expandedSections.has(section.id) ? `
                    <div class="topics-grid">
                        ${section.adhikaranams.map(topic => `
                            <div class="topic-item ${topic.completed ? 'completed' : ''}" 
                                 onclick="app.showAdhikaranam(${chapter.id}, ${topic.id})">
                                <div class="topic-title">${topic.title}</div>
                                <div class="topic-meta">
                                    ${topic.sutrams.length} Sutram${topic.sutrams.length > 1 ? 's' : ''} • 
                                    ${topic.completed ? 'Completed' : 'In Progress'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        return `
            <div class="breadcrumb">
                <a href="../index.html">Home</a> 
                <span>></span> 
                <a href="#" onclick="app.showChapters()">Brahmasutram</a>
                <span>></span>
                <span>${chapter.title}</span>
            </div>
            <a href="#" class="back-button" onclick="app.showChapters()">← Back to Chapters</a>
            <h2 style="margin-bottom: 1.5rem; color: #8B4513;">${chapter.title}</h2>
            <p style="margin-bottom: 2rem; color: #666;">${chapter.description}</p>
            <div class="section-list">
                ${sections}
            </div>
        `;
    }
    
    renderAdhikaranam() {
        const chapter = this.data.chapters.find(c => c.id === this.currentChapter);
        let adhikaranam = null;
        let section = null;
        
        for (const sec of chapter.sections) {
            const found = sec.adhikaranams.find(a => a.id === this.currentAdhikaranam);
            if (found) {
                adhikaranam = found;
                section = sec;
                break;
            }
        }
        
        if (!adhikaranam) return '<p>Adhikaranam not found</p>';
        
        const sutramsList = adhikaranam.sutrams.map(sutram => `
            <li class="sutram-item">
                <div class="sanskrit-text">${sutram}</div>
            </li>
        `).join('');
        
        const additionalPoints = adhikaranam.shankara_additional?.map(point => `
            <div class="content-text">• ${point}</div>
        `).join('') || '';
        
        const youtubeLinks = adhikaranam.youtube_links?.map(link => `
            <a href="${link}" target="_blank" class="youtube-link">📺 Watch Class</a>
        `).join('') || '';
        
        return `
            <div class="breadcrumb">
                <a href="../index.html">Home</a> 
                <span>></span> 
                <a href="#" onclick="app.showChapters()">Brahmasutram</a>
                <span>></span>
                <a href="#" onclick="app.showChapter(${chapter.id})">${chapter.title}</a>
                <span>></span> 
                <span>${adhikaranam.title}</span>
            </div>
            <a href="#" class="back-button" onclick="app.showChapter(${chapter.id})">← Back to ${chapter.title}</a>
            
            <div class="adhikaranam-view">
                <h1 class="adhikaranam-title">${adhikaranam.title}</h1>
                
                <div class="content-section">
                    <div class="section-label">विषय वाक्यम् (Subject Matter)</div>
                    <div class="sanskrit-text">${adhikaranam.vishaya_vakyam}</div>
                </div>
                
                <div class="content-section">
                    <div class="section-label">संशयम् (Doubt/Question)</div>
                    <div class="content-text">${adhikaranam.samshayam}</div>
                </div>
                
                <div class="content-section">
                    <div class="section-label">पूर्वपक्ष (Prima Facie View)</div>
                    <div class="content-text">${adhikaranam.purvapaksha}</div>
                </div>
                
                <div class="content-section">
                    <div class="section-label">सिद्धान्त (Established Conclusion)</div>
                    <div class="content-text">${adhikaranam.siddhanta}</div>
                </div>
                
                ${additionalPoints ? `
                    <div class="content-section">
                        <div class="section-label">शंकराचार्य के अतिरिक्त बिंदु (Shankara's Additional Points)</div>
                        ${additionalPoints}
                    </div>
                ` : ''}
                
                <div class="content-section">
                    <div class="section-label">सूत्राणि (Sutras)</div>
                    <ul class="sutram-list">
                        ${sutramsList}
                    </ul>
                </div>
                
                ${youtubeLinks ? `
                    <div class="content-section">
                        <div class="section-label">Reference Classes</div>
                        <div class="youtube-links">
                            ${youtubeLinks}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    showChapters() {
        this.currentView = 'chapters';
        this.currentChapter = null;
        this.currentAdhikaranam = null;
        this.render();
    }
    
    showChapter(chapterId) {
        const chapter = this.data.chapters.find(c => c.id === chapterId);
        if (!chapter || !chapter.enabled) return;
        
        this.currentView = 'chapter';
        this.currentChapter = chapterId;
        this.currentAdhikaranam = null;
        this.expandedSections.clear();
        
        // Auto-expand first section if it has content
        if (chapter.sections.length > 0 && chapter.sections[0].adhikaranams.length > 0) {
            this.expandedSections.add(chapter.sections[0].id);
        }
        
        this.render();
    }
    
    showAdhikaranam(chapterId, adhikaranamId) {
        this.currentView = 'adhikaranam';
        this.currentChapter = chapterId;
        this.currentAdhikaranam = adhikaranamId;
        this.render();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    toggleSection(sectionId) {
        if (this.expandedSections.has(sectionId)) {
            this.expandedSections.delete(sectionId);
        } else {
            this.expandedSections.add(sectionId);
        }
        this.render();
    }
    
    attachEventListeners() {
        // Any additional event listeners can be added here
        // Most events are handled via onclick attributes for simplicity
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BrahmasutramApp();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    if (window.app) {
        // Simple routing - could be enhanced
        window.app.showChapters();
    }
});