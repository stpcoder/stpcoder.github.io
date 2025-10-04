// LaTeX Export Functionality for Overleaf compatibility
class LaTeXExporter {
    constructor() {}

    generateLaTeX() {
        try {
            const resumeData = window.dataManager?.getResumeData();
            const lang = window.i18n?.getCurrentLanguage() || 'en';

            if (!resumeData) {
                console.error('No resume data available');
                return;
            }

            // Generate LaTeX content
            const latexContent = this.buildLaTeXContent(resumeData, lang);

            // Create and download file
            this.downloadLaTeXFile(latexContent, resumeData, lang);

            console.log('LaTeX file generated successfully');

        } catch (error) {
            console.error('Error generating LaTeX:', error);
            alert('LaTeX 파일 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    buildLaTeXContent(data, lang) {
        const personal = data.personal;
        const name = this.escapeLatex(window.i18n.t(personal.name));
        const title = this.escapeLatex(window.i18n.t(personal.title));

        let latex = `\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{classic}
\\moderncvcolor{blue}
\\usepackage[utf8]{inputenc}
\\usepackage[scale=0.85]{geometry}
\\usepackage{CJKutf8}

\\name{${name}}{}
\\title{${title}}
\\email{${personal.email || ''}}
\\homepage{${personal.portfolio || ''}}
\\social[github]{${(personal.github || '').replace('https://github.com/', '')}}
\\social[linkedin]{${(personal.linkedin || '').replace('https://www.linkedin.com/in/', '')}}

\\begin{document}
${lang === 'ko' ? '\\begin{CJK}{UTF8}{mj}' : ''}
\\makecvtitle

`;

        // About
        if (data.about) {
            latex += this.generateAbout(data, lang);
        }

        // Education
        if (data.education?.length) {
            latex += this.generateEducation(data, lang);
        }

        // Scholarships
        if (data.scholarships?.length) {
            latex += this.generateScholarships(data, lang);
        }

        // Experience
        if (data.experience?.length) {
            latex += this.generateExperience(data, lang);
        }

        // Research
        if (data.research?.length) {
            latex += this.generateResearch(data, lang);
        }

        // Awards
        if (data.awards?.length) {
            latex += this.generateAwards(data, lang);
        }

        // Projects
        if (data.projects?.length) {
            latex += this.generateProjects(data, lang);
        }

        // Activities
        if (data.activities?.length) {
            latex += this.generateActivities(data, lang);
        }

        latex += `
${lang === 'ko' ? '\\end{CJK}' : ''}
\\end{document}
`;

        return latex;
    }

    generateAbout(data, lang) {
        const title = lang === 'ko' ? '소개' : 'About';
        const about = this.escapeLatex(window.i18n.t(data.about));

        return `\\section{${title}}
${about}

`;
    }

    generateEducation(data, lang) {
        const title = lang === 'ko' ? '교육' : 'Education';
        let latex = `\\section{${title}}\n`;

        data.education.forEach(edu => {
            const institution = this.escapeLatex(window.i18n.t(edu.institution));
            const degree = this.escapeLatex(window.i18n.t(edu.degree));
            const gpa = edu.gpa ? ` -- GPA: ${edu.gpa}` : '';

            latex += `\\cventry{${edu.period}}{${degree}}{${institution}}{}{}{${gpa}}\n`;
        });

        latex += '\n';
        return latex;
    }

    generateScholarships(data, lang) {
        const title = lang === 'ko' ? '장학금' : 'Scholarships';
        let latex = `\\section{${title}}\n`;

        data.scholarships.forEach(scholarship => {
            const scholarshipTitle = this.escapeLatex(window.i18n.t(scholarship.title));
            const organization = this.escapeLatex(window.i18n.t(scholarship.organization));
            const description = scholarship.description ? this.escapeLatex(window.i18n.t(scholarship.description)) : '';

            latex += `\\cventry{${scholarship.period}}{${scholarshipTitle}}{${organization}}{}{}{${description}}\n`;
        });

        latex += '\n';
        return latex;
    }

    generateExperience(data, lang) {
        const title = lang === 'ko' ? '경력' : 'Experience';
        let latex = `\\section{${title}}\n`;

        data.experience.forEach(exp => {
            const position = this.escapeLatex(window.i18n.t(exp.position));
            const company = this.escapeLatex(window.i18n.t(exp.company));
            const description = this.escapeLatex(window.i18n.t(exp.description)).replace(/\n/g, ' \\\\\\\\ ');

            latex += `\\cventry{${exp.period}}{${position}}{${company}}{}{}{${description}}\n`;
        });

        latex += '\n';
        return latex;
    }

    generateResearch(data, lang) {
        const title = lang === 'ko' ? '연구' : 'Research';
        let latex = `\\section{${title}}\n`;

        data.research.forEach(research => {
            const researchTitle = this.escapeLatex(window.i18n.t(research.title));
            const organization = this.escapeLatex(window.i18n.t(research.organization));
            const description = research.description ? this.escapeLatex(window.i18n.t(research.description)) : '';

            latex += `\\cventry{${research.period}}{${researchTitle}}{${organization}}{}{}{${description}}\n`;
        });

        latex += '\n';
        return latex;
    }

    generateAwards(data, lang) {
        const title = lang === 'ko' ? '수상 및 대회' : 'Awards \\& Competitions';
        let latex = `\\section{${title}}\n`;

        data.awards.forEach(category => {
            const categoryTitle = this.escapeLatex(window.i18n.t(category.category));
            latex += `\\subsection{${categoryTitle}}\n`;

            if (category.items && category.items.length) {
                category.items.forEach(item => {
                    const itemTitle = this.escapeLatex(window.i18n.t(item.title));
                    const organization = this.escapeLatex(window.i18n.t(item.organization));
                    const description = item.description ? this.escapeLatex(window.i18n.t(item.description)) : '';

                    latex += `\\cvitem{${item.year}}{\\textbf{${itemTitle}} -- ${organization}${description ? ' \\\\\\\\ ' + description : ''}}\n`;
                });
            }
        });

        latex += '\n';
        return latex;
    }

    generateProjects(data, lang) {
        const title = lang === 'ko' ? '프로젝트' : 'Featured Projects';
        let latex = `\\section{${title}}\n`;

        data.projects.forEach(project => {
            const projectTitle = this.escapeLatex(window.i18n.t(project.title));
            const organization = this.escapeLatex(window.i18n.t(project.organization));
            const description = this.escapeLatex(window.i18n.t(project.description));

            latex += `\\cventry{${project.year}}{${projectTitle}}{${organization}}{}{}{${description}}\n`;
        });

        latex += '\n';
        return latex;
    }

    generateActivities(data, lang) {
        const title = lang === 'ko' ? '활동' : 'Activities';
        let latex = `\\section{${title}}\n`;

        data.activities.forEach(category => {
            const categoryTitle = this.escapeLatex(window.i18n.t(category.category));
            latex += `\\subsection{${categoryTitle}}\n`;

            if (category.items && category.items.length) {
                category.items.forEach(item => {
                    const itemTitle = this.escapeLatex(window.i18n.t(item.title));
                    const organization = this.escapeLatex(window.i18n.t(item.organization));
                    const description = item.description ? this.escapeLatex(window.i18n.t(item.description)) : '';

                    latex += `\\cventry{${item.period}}{${itemTitle}}{${organization}}{}{}{${description}}\n`;
                });
            }
        });

        latex += '\n';
        return latex;
    }

    escapeLatex(text) {
        if (!text) return '';

        return text
            .replace(/\\/g, '\\textbackslash{}')
            .replace(/&/g, '\\&')
            .replace(/%/g, '\\%')
            .replace(/\$/g, '\\$')
            .replace(/#/g, '\\#')
            .replace(/_/g, '\\_')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/~/g, '\\textasciitilde{}')
            .replace(/\^/g, '\\textasciicircum{}');
    }

    downloadLaTeXFile(content, data, lang) {
        const name = data?.personal?.name ?
            window.i18n.t(data.personal.name).replace(/\s+/g, '') : 'TaehoJe';

        const filename = `${name}_Resume_${lang.toUpperCase()}.tex`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Initialize LaTeX Exporter
const latexExporter = new LaTeXExporter();
window.latexExporter = latexExporter;

// Global function for LaTeX download
window.downloadLatex = function() {
    if (window.latexExporter) {
        window.latexExporter.generateLaTeX();
    } else {
        console.error('LaTeX Exporter not initialized');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LaTeXExporter;
}
