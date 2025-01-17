class ContentAnalyzer {
    constructor() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.filesList = document.getElementById('filesList');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.analysisResults = document.getElementById('analysisResults');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = e.target.files;
        this.processFiles(files);
    }

    async processFiles(files) {
        this.showLoading();
        
        for (const file of files) {
            if (this.validateFile(file)) {
                await this.uploadFile(file);
            }
        }
        
        this.hideLoading();
    }

    validateFile(file) {
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
        if (!allowedTypes.includes(file.type)) {
            this.showError(`Invalid file type: ${file.name}`);
            return false;
        }
        return true;
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            this.displayAnalysis(result.analysis);
        } catch (error) {
            this.showError(`Error uploading ${file.name}: ${error.message}`);
        }
    }

    displayAnalysis(analysis) {
        const analysisHTML = `
            <div class="analysis-card">
                <div class="score-circle">${analysis.engagementScore}</div>
                <h3 class="text-center">Engagement Score</h3>
                
                <div class="statistics">
                    <div class="stat-item">
                        <div class="stat-value">${analysis.statistics.wordCount}</div>
                        <div class="stat-label">Words</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${analysis.statistics.sentenceCount}</div>
                        <div class="stat-label">Sentences</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${analysis.statistics.averageWordsPerSentence}</div>
                        <div class="stat-label">Avg Words/Sentence</div>
                    </div>
                </div>
                
                <div class="suggestions">
                    <h3>Suggestions for Improvement</h3>
                    ${analysis.suggestions.map(suggestion => `
                        <div class="suggestion-item">
                            ${suggestion}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.analysisResults.insertAdjacentHTML('beforeend', analysisHTML);
    }

    showLoading() {
        this.loadingSpinner.hidden = false;
    }

    hideLoading() {
        this.loadingSpinner.hidden = true;
    }

    showError(message) {
        const errorHTML = `
            <div class="error-message">
                ${message}
            </div>
        `;
        this.filesList.insertAdjacentHTML('beforeend', errorHTML);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ContentAnalyzer();
});