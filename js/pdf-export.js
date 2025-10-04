// PDF Export Functionality using jsPDF and html2canvas
class PDFExporter {
    constructor() {
        this.isLibrariesLoaded = false;
        this.loadLibraries();
    }

    async loadLibraries() {
        try {
            // Load jsPDF and html2canvas from CDN
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');

            this.isLibrariesLoaded = true;
            console.log('PDF export libraries loaded successfully');
        } catch (error) {
            console.error('Failed to load PDF export libraries:', error);
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async generatePDF() {
        if (!this.isLibrariesLoaded) {
            console.error('PDF libraries not loaded yet');
            return;
        }

        try {
            // Show loading indicator
            this.showLoading();

            // Get current language for filename
            const lang = window.i18n?.getCurrentLanguage() || 'en';
            const resumeData = window.dataManager?.getResumeData();
            const name = resumeData?.personal?.name ?
                window.i18n.t(resumeData.personal.name) : 'TaehoJe';

            // Create a clean version of the resume for PDF
            const pdfContent = this.createPDFContent();

            // Configure html2canvas options
            const canvas = await html2canvas(pdfContent, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                removeContainer: true,
                imageTimeout: 15000,
                height: pdfContent.scrollHeight,
                width: pdfContent.scrollWidth
            });

            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Calculate dimensions
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Download the PDF
            const filename = `${name}_Resume_${lang.toUpperCase()}.pdf`;
            pdf.save(filename);

            // Clean up
            document.body.removeChild(pdfContent);
            this.hideLoading();

            console.log('PDF generated successfully');

        } catch (error) {
            console.error('Error generating PDF:', error);
            this.hideLoading();
            this.showError('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    createPDFContent() {
        const resumeData = window.dataManager?.getResumeData();
        const lang = window.i18n?.getCurrentLanguage() || 'en';

        // Create a container for PDF content
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 210mm;
            background: white;
            color: #1a1a1a;
            font-family: 'Inter', 'Noto Sans KR', sans-serif;
            padding: 15mm 20mm;
            box-sizing: border-box;
        `;

        // Build PDF content
        container.innerHTML = `
            <div class="pdf-resume">
                ${this.generateHeader(resumeData, lang)}
                ${this.generateAbout(resumeData, lang)}
                ${this.generateEducation(resumeData, lang)}
                ${this.generateScholarships(resumeData, lang)}
                ${this.generateExperience(resumeData, lang)}
                ${this.generateResearch(resumeData, lang)}
                ${this.generateAwards(resumeData, lang)}
                ${this.generateProjects(resumeData, lang)}
                ${this.generateActivities(resumeData, lang)}
            </div>
            <style>
                .pdf-resume {
                    line-height: 1.6;
                    font-size: 10pt;
                }

                /* Header */
                .pdf-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #0ea5e9;
                }
                .pdf-name {
                    font-size: 28pt;
                    font-weight: 700;
                    color: #0ea5e9;
                    margin-bottom: 5px;
                    letter-spacing: -0.02em;
                }
                .pdf-title {
                    font-size: 14pt;
                    color: #666;
                    margin-bottom: 10px;
                    font-weight: 500;
                }
                .pdf-contact {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    font-size: 9pt;
                    color: #666;
                }

                /* Section */
                .pdf-section {
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }
                .pdf-section h2 {
                    font-size: 14pt;
                    font-weight: 700;
                    color: #1a1a1a;
                    border-bottom: 1.5px solid #e5e7eb;
                    padding-bottom: 5px;
                    margin-bottom: 12px;
                    letter-spacing: -0.01em;
                }

                /* Items */
                .pdf-item {
                    margin-bottom: 12px;
                    padding-left: 0;
                }
                .pdf-item h3 {
                    font-size: 11pt;
                    font-weight: 600;
                    margin-bottom: 3px;
                    color: #1a1a1a;
                }
                .pdf-item .organization {
                    font-size: 10pt;
                    color: #666;
                    margin-bottom: 2px;
                }
                .pdf-item .period {
                    font-size: 9pt;
                    color: #999;
                    margin-bottom: 5px;
                }
                .pdf-item .description {
                    font-size: 9.5pt;
                    line-height: 1.5;
                    color: #333;
                }

                /* About */
                .pdf-about-text {
                    font-size: 10pt;
                    line-height: 1.6;
                    color: #333;
                }

                /* Awards category */
                .pdf-award-category {
                    margin-bottom: 15px;
                }
                .pdf-award-category h3 {
                    font-size: 11pt;
                    font-weight: 600;
                    color: #0ea5e9;
                    margin-bottom: 8px;
                }
                .pdf-award-item {
                    margin-bottom: 8px;
                    padding-left: 0;
                }
                .pdf-award-item .award-title {
                    font-size: 10pt;
                    font-weight: 600;
                    color: #1a1a1a;
                }
                .pdf-award-item .award-org {
                    font-size: 9pt;
                    color: #666;
                }
                .pdf-award-item .award-year {
                    font-size: 9pt;
                    color: #999;
                    margin-left: 5px;
                }
                .pdf-award-item .award-desc {
                    font-size: 9pt;
                    color: #666;
                    margin-top: 2px;
                }

                /* Activities */
                .pdf-activity-category {
                    margin-bottom: 15px;
                }
                .pdf-activity-category h3 {
                    font-size: 11pt;
                    font-weight: 600;
                    color: #0ea5e9;
                    margin-bottom: 8px;
                }
            </style>
        `;

        document.body.appendChild(container);
        return container;
    }

    generateHeader(data, lang) {
        if (!data?.personal) return '';

        const personal = data.personal;
        const name = window.i18n.t(personal.name);
        const title = window.i18n.t(personal.title);

        return `
            <div class="pdf-header">
                <div class="pdf-name">${name}</div>
                <div class="pdf-title">${title}</div>
                <div class="pdf-contact">
                    <span>${personal.email}</span>
                    <span>${window.i18n.t(personal.location)}</span>
                </div>
            </div>
        `;
    }

    generateAbout(data, lang) {
        if (!data?.about) return '';

        const title = lang === 'ko' ? '소개' : 'About';
        return `
            <div class="pdf-section">
                <h2>${title}</h2>
                <p class="pdf-about-text">${window.i18n.t(data.about)}</p>
            </div>
        `;
    }

    generateEducation(data, lang) {
        if (!data?.education?.length) return '';

        const title = lang === 'ko' ? '교육' : 'Education';
        let html = `<div class="pdf-section"><h2>${title}</h2>`;

        data.education.forEach(edu => {
            html += `
                <div class="pdf-item">
                    <h3>${window.i18n.t(edu.institution)}</h3>
                    <div class="organization">${window.i18n.t(edu.degree)}</div>
                    <div class="period">${edu.period}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    generateScholarships(data, lang) {
        if (!data?.scholarships?.length) return '';

        const title = lang === 'ko' ? '장학금' : 'Scholarships';
        let html = `<div class="pdf-section"><h2>${title}</h2>`;

        data.scholarships.forEach(scholarship => {
            html += `
                <div class="pdf-item">
                    <h3>${window.i18n.t(scholarship.title)}</h3>
                    <div class="organization">${window.i18n.t(scholarship.organization)}</div>
                    <div class="period">${scholarship.period}</div>
                    ${scholarship.description ? `<div class="description">${window.i18n.t(scholarship.description)}</div>` : ''}
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    generateExperience(data, lang) {
        if (!data?.experience?.length) return '';

        const title = lang === 'ko' ? '경력' : 'Experience';
        let html = `<div class="pdf-section"><h2>${title}</h2>`;

        data.experience.forEach(exp => {
            const description = window.i18n.t(exp.description).replace(/\n/g, '<br>');

            html += `
                <div class="pdf-item">
                    <h3>${window.i18n.t(exp.position)}</h3>
                    <div class="organization">${window.i18n.t(exp.company)}</div>
                    <div class="period">${exp.period}</div>
                    <div class="description">${description}</div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    generateResearch(data, lang) {
        if (!data?.research?.length) return '';

        const title = lang === 'ko' ? '연구' : 'Research';
        let html = `<div class="pdf-section"><h2>${title}</h2>`;

        data.research.forEach(research => {
            html += `
                <div class="pdf-item">
                    <h3>${window.i18n.t(research.title)}</h3>
                    <div class="organization">${window.i18n.t(research.organization)}</div>
                    <div class="period">${research.period}</div>
                    ${research.description ? `<div class="description">${window.i18n.t(research.description)}</div>` : ''}
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    generateAwards(data, lang) {
        if (!data?.awards?.length) return '';

        const title = lang === 'ko' ? '수상 및 대회' : 'Awards & Competitions';
        let html = `<div class="pdf-section"><h2>${title}</h2>`;

        data.awards.forEach(category => {
            html += `<div class="pdf-award-category">`;
            html += `<h3>${window.i18n.t(category.category)}</h3>`;

            if (category.items && category.items.length) {
                category.items.forEach(item => {
                    html += `
                        <div class="pdf-award-item">
                            <div>
                                <span class="award-title">${window.i18n.t(item.title)}</span>
                                <span class="award-year">(${item.year})</span>
                            </div>
                            <div class="award-org">${window.i18n.t(item.organization)}</div>
                            ${item.description ? `<div class="award-desc">${window.i18n.t(item.description)}</div>` : ''}
                        </div>
                    `;
                });
            }

            html += `</div>`;
        });

        html += '</div>';
        return html;
    }

    generateProjects(data, lang) {
        if (!data?.projects?.length) return '';

        const title = lang === 'ko' ? '프로젝트' : 'Featured Projects';
        let html = `<div class="pdf-section"><h2>${title}</h2>`;

        data.projects.forEach(project => {
            html += `
                <div class="pdf-item">
                    <h3>${window.i18n.t(project.title)}</h3>
                    <div class="organization">${window.i18n.t(project.organization)}</div>
                    <div class="period">${project.year}</div>
                    <div class="description">${window.i18n.t(project.description)}</div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    generateActivities(data, lang) {
        if (!data?.activities?.length) return '';

        const title = lang === 'ko' ? '활동' : 'Activities';
        let html = `<div class="pdf-section"><h2>${title}</h2>`;

        data.activities.forEach(category => {
            html += `<div class="pdf-activity-category">`;
            html += `<h3>${window.i18n.t(category.category)}</h3>`;

            if (category.items && category.items.length) {
                category.items.forEach(item => {
                    html += `
                        <div class="pdf-item">
                            <h3>${window.i18n.t(item.title)}</h3>
                            <div class="organization">${window.i18n.t(item.organization)}</div>
                            <div class="period">${item.period}</div>
                            ${item.description ? `<div class="description">${window.i18n.t(item.description)}</div>` : ''}
                        </div>
                    `;
                });
            }

            html += `</div>`;
        });

        html += '</div>';
        return html;
    }

    showLoading() {
        // Create loading overlay
        const loading = document.createElement('div');
        loading.id = 'pdf-loading';
        loading.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; color: white;">
                <div style="text-align: center;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #0ea5e9; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <div>PDF 생성 중...</div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.getElementById('pdf-loading');
        if (loading) {
            document.body.removeChild(loading);
        }
    }

    showError(message) {
        alert(message);
    }
}

// Initialize PDF Exporter
const pdfExporter = new PDFExporter();
window.pdfExporter = pdfExporter;

// Global function for PDF download
window.downloadPDF = function() {
    if (window.pdfExporter) {
        window.pdfExporter.generatePDF();
    } else {
        console.error('PDF Exporter not initialized');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFExporter;
}
