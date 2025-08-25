class ComplexUpanishadViewer {
    constructor(dataPath, containerId) {
        this.dataPath = dataPath;
        this.containerId = containerId;
        this.data = null;
        this.currentView = 'sections'; // sections | subsections | mantras
        this.currentSection = null;
        this.currentSubsection = null;
        
        this.init();
    }
    
    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.render();
        } catch (error) {
            console.error('Error loading complex upanishad data:', error);
            document.getElementById(this.containerId).innerHTML = '<p>Error loading content. Please check the data file.</p>';
        }
    }
    
    render() {
        const container = document.getElementById(this.containerId);
        
        switch (this.currentView) {
            case 'sections':
                container.innerHTML = this.renderSections();
                break;
            case 'subsections':
                container.innerHTML = this.renderSubsections();
                break;
            case 'mantras':
                container.innerHTML = this.renderMantras();
                break;
        }
        
        this.attachEventListeners();
    }
    
    renderSections() {
        const headerHtml = `
            <div class="breadcrumb">
                <a href="../index.html">Home</a> 
                <span>></span> 
                <a href="index.html">Upanishads</a>
                <span>></span> 
                <span>${this.data.name}</span>
            </div>
            
            <div class="book-header-compact">
                <div class="book-title-row">
                    <div class="book-title-section">
                        <h1 class="book-main-title">${this.data.name}</h1>
                        <h2 class="book-subtitle">${this.data.english_title}</h2>
                    </div>
                    <div class="book-meta-section">
                        <span class="book-stat">
                            <strong>${this.data.total_mantras}</strong> Mantras
                        </span>
                        ${this.data.playlist_url ? `
                            <a href="${this.data.playlist_url}" target="_blank" class="playlist-link">📺 Playlist</a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        const sectionsHtml = this.data.sections.map(section => `
            <div class="nav-card" onclick="app.showSubsections(${section.id})">
                <div class="nav-card-title">${section.title}</div>
                <div class="nav-card-subtitle">${section.english_title} - ${section.description}</div>
                <div class="nav-card-meta">
                    <span>${section.subsections.length} Sections • ${section.total_mantras} Mantras</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%;"></div>
                    </div>
                </div>
            </div>
        `).join('');
        
        return `
            ${headerHtml}
            <div class="navigation-style">
                ${sectionsHtml}
            </div>
        `;
    }
    
    renderSubsections() {
        const section = this.data.sections.find(s => s.id === this.currentSection);
        if (!section) return '<p>Section not found</p>';
        
        const headerHtml = `
            <div class="breadcrumb">
                <a href="../index.html">Home</a> 
                <span>></span> 
                <a href="index.html">Upanishads</a>
                <span>></span> 
                <a href="#" onclick="app.showSections()">${this.data.name}</a>
                <span>></span> 
                <span>${section.title}</span>
            </div>
            
            <a href="#" class="back-button" onclick="app.showSections()">← Back to ${this.data.name}</a>
            
            <div class="book-header-compact">
                <div class="book-title-row">
                    <div class="book-title-section">
                        <h1 class="book-main-title">${section.title}</h1>
                        <h2 class="book-subtitle">${section.english_title}</h2>
                    </div>
                    <div class="book-meta-section">
                        <span class="book-stat">
                            <strong>${section.total_mantras}</strong> Mantras
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        const subsectionsHtml = section.subsections.map(subsection => `
            <div class="nav-card" onclick="app.showMantras(${section.id}, ${subsection.id})">
                <div class="nav-card-title">${subsection.title}</div>
                <div class="nav-card-subtitle">${subsection.english_title}</div>
                <div class="nav-card-meta">
                    <span>${subsection.mantra_count} Mantras</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%;"></div>
                    </div>
                </div>
            </div>
        `).join('');
        
        return `
            ${headerHtml}
            <div class="navigation-style">
                ${subsectionsHtml}
            </div>
        `;
    }
    
    renderMantras() {
        const section = this.data.sections.find(s => s.id === this.currentSection);
        const subsection = section?.subsections.find(ss => ss.id === this.currentSubsection);
        
        if (!section || !subsection) return '<p>Section not found</p>';
        
        return `
            <div class="breadcrumb">
                <a href="../index.html">Home</a> 
                <span>></span> 
                <a href="index.html">Upanishads</a>
                <span>></span> 
                <a href="#" onclick="app.showSections()">${this.data.name}</a>
                <span>></span> 
                <a href="#" onclick="app.showSubsections(${section.id})">${section.title}</a>
                <span>></span> 
                <span>${subsection.title}</span>
            </div>
            
            <a href="#" class="back-button" onclick="app.showSubsections(${section.id})">← Back to ${section.title}</a>
            
            <div class="book-header-compact">
                <div class="book-title-row">
                    <div class="book-title-section">
                        <h1 class="book-main-title">${subsection.title}</h1>
                        <h2 class="book-subtitle">${subsection.english_title}</h2>
                    </div>
                    <div class="book-meta-section">
                        <span class="book-stat">
                            <strong>${subsection.mantra_count}</strong> Mantras
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="content-placeholder">
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <h3>Mantras will be displayed here</h3>
                    <p>Individual mantras with Sanskrit, transliteration, and videos</p>
                    <p style="margin-top: 1rem; font-size: 0.9rem;">
                        This section will show ${subsection.mantra_count} mantras from ${section.title} → ${subsection.title}
                    </p>
                </div>
            </div>
        `;
    }
    
    showSections() {
        this.currentView = 'sections';
        this.currentSection = null;
        this.currentSubsection = null;
        this.render();
    }
    
    showSubsections(sectionId) {
        this.currentView = 'subsections';
        this.currentSection = sectionId;
        this.currentSubsection = null;
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    showMantras(sectionId, subsectionId) {
        this.currentView = 'mantras';
        this.currentSection = sectionId;
        this.currentSubsection = subsectionId;
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    getSectionType() {
        // Could be made configurable based on Upanishad type
        return 'Mundaka';
    }
    
    getSubsectionType() {
        return 'Khanda';
    }
    
    attachEventListeners() {
        // Event listeners are handled via onclick attributes for simplicity
        // Could be enhanced with proper event delegation if needed
    }
}