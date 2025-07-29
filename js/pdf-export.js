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
                backgroundColor: null,
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
            color: #333;
            font-family: 'Inter', sans-serif;
            padding: 20mm;
            box-sizing: border-box;
        `;

        // Build PDF content
        container.innerHTML = `
            <div class="pdf-resume">
                ${this.generateHeader(resumeData, lang)}
                ${this.generateAbout(resumeData, lang)}
                ${this.generateExperience(resumeData, lang)}
                ${this.generateEducation(resumeData, lang)}
                ${this.generateProjects(resumeData, lang)}
                ${this.generateSkills(resumeData, lang)}
                ${this.generateAwards(resumeData, lang)}
            </div>
            <style>
                .pdf-resume { line-height: 1.4; }
                .pdf-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
                .pdf-name { font-size: 32px; font-weight: bold; color: #6366f1; margin-bottom: 8px; }
                .pdf-title { font-size: 18px; color: #666; margin-bottom: 15px; }
                .pdf-contact { display: flex; justify-content: center; gap: 20px; font-size: 14px; }
                .pdf-section { margin-bottom: 25px; }
                .pdf-section h2 { font-size: 20px; color: #6366f1; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
                .pdf-item { margin-bottom: 15px; }
                .pdf-item h3 { font-size: 16px; font-weight: 600; margin-bottom: 5px; color: #333; }
                .pdf-item .company { font-size: 14px; color: #666; margin-bottom: 3px; }
                .pdf-item .date { font-size: 12px; color: #999; margin-bottom: 8px; }
                .pdf-item .description { font-size: 14px; line-height: 1.5; }
                .pdf-skills { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .pdf-skill-category h3 { font-size: 16px; margin-bottom: 10px; color: #6366f1; }
                .pdf-skill-item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
                .pdf-projects { display: grid; grid-template-columns: 1fr; gap: 15px; }
                .pdf-project { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
                .pdf-tech-tags { margin-top: 8px; }
                .pdf-tech-tag { display: inline-block; background: #f3f4f6; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; }
                .pdf-awards { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .pdf-award { text-align: center; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
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
                    <span>${personal.phone || ''}</span>
                    <span>${window.i18n.t(personal.location)}</span>
                </div>
            </div>
        `;
    }

    generateAbout(data, lang) {
        if (!data?.about) return '';
        
        return `
            <div class="pdf-section">
                <h2>${lang === 'ko' ? '소개' : 'About'}</h2>
                <p class="description">${window.i18n.t(data.about)}</p>
            </div>
        `;
    }

    generateExperience(data, lang) {
        if (!data?.experience?.length) return '';
        
        const title = lang === 'ko' ? '경험' : 'Experience';
        let html = `<div class="pdf-section"><h2>${title}</h2>`;
        
        data.experience.forEach(exp => {
            html += `
                <div class="pdf-item">
                    <h3>${window.i18n.t(exp.position)}</h3>
                    <div class="company">${window.i18n.t(exp.company)}</div>
                    <div class="date">${exp.period}</div>
                    <div class="description">${window.i18n.t(exp.description)}</div>
                    ${exp.achievements ? `
                        <ul>
                            ${exp.achievements.map(ach => `<li>${window.i18n.t(ach)}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    generateEducation(data, lang) {
        if (!data?.education?.length) return '';
        
        const title = lang === 'ko' ? '교육' : 'Education';
        let html = `<div class="pdf-section"><h2>${title}</h2>`;
        
        data.education.forEach(edu => {
            html += `
                <div class="pdf-item">
                    <h3>${window.i18n.t(edu.degree)}</h3>
                    <div class="company">${window.i18n.t(edu.institution)}</div>
                    <div class="date">${edu.period}</div>
                    ${edu.gpa ? `<div class="description">GPA: ${edu.gpa}</div>` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    generateProjects(data, lang) {
        if (!data?.projects?.length) return '';
        
        const title = lang === 'ko' ? '프로젝트' : 'Projects';
        let html = `<div class="pdf-section"><h2>${title}</h2><div class="pdf-projects">`;
        
        data.projects.forEach(project => {
            const techTags = project.technologies ? 
                project.technologies.map(tech => `<span class="pdf-tech-tag">${tech}</span>`).join('') : '';
            
            html += `
                <div class="pdf-project">
                    <h3>${window.i18n.t(project.title)}</h3>
                    <div class="date">${project.period}</div>
                    <div class="description">${window.i18n.t(project.description)}</div>
                    <div class="pdf-tech-tags">${techTags}</div>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    generateSkills(data, lang) {
        if (!data?.skills) return '';
        
        const title = lang === 'ko' ? '기술' : 'Skills';
        let html = `<div class="pdf-section"><h2>${title}</h2><div class="pdf-skills">`;
        
        if (data.skills.programming) {
            const categoryTitle = lang === 'ko' ? '프로그래밍 언어' : 'Programming Languages';
            html += `
                <div class="pdf-skill-category">
                    <h3>${categoryTitle}</h3>
                    ${data.skills.programming.map(skill => `
                        <div class="pdf-skill-item">
                            <span>${skill.name}</span>
                            <span>${skill.level}%</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        if (data.skills.technologies) {
            const categoryTitle = lang === 'ko' ? '기술 & 도구' : 'Technologies & Tools';
            html += `
                <div class="pdf-skill-category">
                    <h3>${categoryTitle}</h3>
                    ${data.skills.technologies.map(skill => `
                        <div class="pdf-skill-item">
                            <span>${skill.name}</span>
                            <span>${skill.level}%</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        html += '</div></div>';
        return html;
    }

    generateAwards(data, lang) {
        const allAwards = [];
        
        if (data.awards) allAwards.push(...data.awards);
        if (data.scholarships) allAwards.push(...data.scholarships);
        if (data.certifications) allAwards.push(...data.certifications);
        
        if (!allAwards.length) return '';
        
        const title = lang === 'ko' ? '수상 & 인증' : 'Awards & Certifications';
        let html = `<div class="pdf-section"><h2>${title}</h2><div class="pdf-awards">`;
        
        allAwards.forEach(award => {
            html += `
                <div class="pdf-award">
                    <h3>${window.i18n.t(award.title)}</h3>
                    <div class="company">${window.i18n.t(award.organization || award.issuer)}</div>
                    <div class="date">${award.year}</div>
                    ${award.description ? `<div class="description">${window.i18n.t(award.description)}</div>` : ''}
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    showLoading() {
        // Create loading overlay
        const loading = document.createElement('div');
        loading.id = 'pdf-loading';
        loading.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; color: white;">
                <div style="text-align: center;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #6366f1; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
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