// LaTeX Export Functionality for Overleaf compatibility
class LaTeXExporter {
    constructor() {
        this.template = this.getModerncvTemplate();
    }

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
        const about = data.about ? this.escapeLatex(window.i18n.t(data.about)) : '';
        
        let latex = this.template.header;
        
        // Replace placeholders in header
        latex = latex.replace('{{NAME}}', name);
        latex = latex.replace('{{TITLE}}', title);
        latex = latex.replace('{{EMAIL}}', personal.email || '');
        latex = latex.replace('{{PHONE}}', personal.phone || '');
        latex = latex.replace('{{LOCATION}}', this.escapeLatex(window.i18n.t(personal.location)));
        latex = latex.replace('{{GITHUB}}', personal.github || '');
        latex = latex.replace('{{LINKEDIN}}', personal.linkedin || '');
        
        // Document content
        latex += '\\begin{document}\n\n';
        
        // Make title
        latex += '\\makecvtitle\n\n';
        
        // About section
        if (about) {
            latex += `\\section{${lang === 'ko' ? '소개' : 'About'}}\n`;
            latex += `${about}\n\n`;
        }
        
        // Experience section
        if (data.experience && data.experience.length > 0) {
            latex += this.generateExperienceSection(data.experience, lang);
        }
        
        // Education section  
        if (data.education && data.education.length > 0) {
            latex += this.generateEducationSection(data.education, lang);
        }
        
        // Projects section
        if (data.projects && data.projects.length > 0) {
            latex += this.generateProjectsSection(data.projects, lang);
        }
        
        // Skills section
        if (data.skills) {
            latex += this.generateSkillsSection(data.skills, lang);
        }
        
        // Awards section
        latex += this.generateAwardsSection(data, lang);
        
        latex += '\\end{document}\n';
        
        return latex;
    }

    generateExperienceSection(experience, lang) {
        let latex = `\\section{${lang === 'ko' ? '경험' : 'Experience'}}\n`;
        
        experience.forEach(exp => {
            const position = this.escapeLatex(window.i18n.t(exp.position));
            const company = this.escapeLatex(window.i18n.t(exp.company));
            const period = this.escapeLatex(exp.period);
            const description = this.escapeLatex(window.i18n.t(exp.description));
            
            latex += `\\cventry{${period}}{${position}}{${company}}{}{}{${description}`;
            
            if (exp.achievements && exp.achievements.length > 0) {
                latex += '\\begin{itemize}\n';
                exp.achievements.forEach(achievement => {
                    latex += `\\item ${this.escapeLatex(window.i18n.t(achievement))}\n`;
                });
                latex += '\\end{itemize}';
            }
            
            latex += '}\n';
        });
        
        latex += '\n';
        return latex;
    }

    generateEducationSection(education, lang) {
        let latex = `\\section{${lang === 'ko' ? '교육' : 'Education'}}\n`;
        
        education.forEach(edu => {
            const degree = this.escapeLatex(window.i18n.t(edu.degree));
            const institution = this.escapeLatex(window.i18n.t(edu.institution));
            const period = this.escapeLatex(edu.period);
            const gpa = edu.gpa ? `GPA: ${edu.gpa}` : '';
            
            latex += `\\cventry{${period}}{${degree}}{${institution}}{}{}{${gpa}}\n`;
        });
        
        latex += '\n';
        return latex;
    }

    generateProjectsSection(projects, lang) {
        let latex = `\\section{${lang === 'ko' ? '프로젝트' : 'Projects'}}\n`;
        
        projects.forEach(project => {
            const title = this.escapeLatex(window.i18n.t(project.title));
            const description = this.escapeLatex(window.i18n.t(project.description));
            const period = this.escapeLatex(project.period);
            
            let techString = '';
            if (project.technologies && project.technologies.length > 0) {
                techString = `\\textit{Technologies: ${project.technologies.join(', ')}}`;
            }
            
            latex += `\\cventry{${period}}{${title}}{}{}{}{${description}`;
            if (techString) {
                latex += `\\\\${techString}`;
            }
            latex += '}\n';
        });
        
        latex += '\n';
        return latex;
    }

    generateSkillsSection(skills, lang) {
        let latex = `\\section{${lang === 'ko' ? '기술' : 'Skills'}}\n`;
        
        if (skills.programming && skills.programming.length > 0) {
            const categoryTitle = lang === 'ko' ? '프로그래밍 언어' : 'Programming Languages';
            const skillsList = skills.programming.map(skill => `${skill.name} (${skill.level}\\%)`).join(', ');
            latex += `\\cvitem{${categoryTitle}}{${skillsList}}\n`;
        }
        
        if (skills.technologies && skills.technologies.length > 0) {
            const categoryTitle = lang === 'ko' ? '기술 \\& 도구' : 'Technologies \\& Tools';
            const skillsList = skills.technologies.map(skill => `${skill.name} (${skill.level}\\%)`).join(', ');
            latex += `\\cvitem{${categoryTitle}}{${skillsList}}\n`;
        }
        
        latex += '\n';
        return latex;
    }

    generateAwardsSection(data, lang) {
        const allAwards = [];
        
        if (data.awards) allAwards.push(...data.awards.map(a => ({...a, type: 'award'})));
        if (data.scholarships) allAwards.push(...data.scholarships.map(s => ({...s, type: 'scholarship'})));
        if (data.certifications) allAwards.push(...data.certifications.map(c => ({...c, type: 'certification'})));
        
        if (allAwards.length === 0) return '';
        
        let latex = `\\section{${lang === 'ko' ? '수상 \\& 인증' : 'Awards \\& Certifications'}}\n`;
        
        allAwards.forEach(award => {
            const title = this.escapeLatex(window.i18n.t(award.title));
            const organization = this.escapeLatex(window.i18n.t(award.organization || award.issuer));
            const year = award.year;
            const description = award.description ? this.escapeLatex(window.i18n.t(award.description)) : '';
            
            latex += `\\cventry{${year}}{${title}}{${organization}}{}{}{${description}}\n`;
        });
        
        latex += '\n';
        return latex;
    }

    escapeLatex(text) {
        if (!text) return '';
        
        return text
            .replace(/&/g, '\\&')
            .replace(/%/g, '\\%')
            .replace(/\$/g, '\\$')
            .replace(/#/g, '\\#')
            .replace(/_/g, '\\_')
            .replace(/\^/g, '\\textasciicircum{}')
            .replace(/~/g, '\\textasciitilde{}')
            .replace(/\\/g, '\\textbackslash{}')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}');
    }

    downloadLaTeXFile(content, resumeData, lang) {
        const name = resumeData?.personal?.name ? 
            window.i18n.t(resumeData.personal.name).replace(/\s+/g, '') : 'TaehoJe';
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

    getModerncvTemplate() {
        return {
            header: `%% Modern CV LaTeX Template
%% Compatible with Overleaf
%% Generated from Portfolio Website

\\documentclass[11pt,a4paper,sans]{moderncv}

% Modern CV theme
\\moderncvstyle{banking}
\\moderncvcolor{blue}

% Character encoding
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}

% Language support
\\usepackage[english]{babel}

% Adjust page margins
\\usepackage[scale=0.75]{geometry}

% Personal data
\\name{{{NAME}}}{} 
\\title{{{TITLE}}}
\\address{{{LOCATION}}}{}{}
\\phone[mobile]{{{PHONE}}}
\\email{{{EMAIL}}}
\\social[github]{{{GITHUB}}}
\\social[linkedin]{{{LINKEDIN}}}

% Optional photo
% \\photo[64pt][0.4pt]{picture}

% Bibliography customization
\\usepackage{multibib}
\\newcites{book,misc}{Books,Miscellaneous Publications}

% Uncomment to suppress page numbers
% \\nopagenumbers{}

`
        };
    }

    // Generate bibliography file (.bib) for publications if needed
    generateBibliography(publications) {
        if (!publications || publications.length === 0) return null;
        
        let bib = '% Bibliography file\\n\\n';
        
        publications.forEach((pub, index) => {
            bib += `@article{pub${index + 1},\n`;
            bib += `  title={${this.escapeLatex(pub.title)}},\n`;
            bib += `  author={${this.escapeLatex(pub.authors)}},\n`;
            bib += `  journal={${this.escapeLatex(pub.journal)}},\n`;
            bib += `  year={${pub.year}},\n`;
            if (pub.volume) bib += `  volume={${pub.volume}},\n`;
            if (pub.pages) bib += `  pages={${pub.pages}},\n`;
            bib += '}\n\n';
        });
        
        return bib;
    }

    // Generate comprehensive LaTeX package for advanced users
    generateAdvancedLaTeX() {
        const resumeData = window.dataManager?.getResumeData();
        const lang = window.i18n?.getCurrentLanguage() || 'en';
        
        if (!resumeData) {
            console.error('No resume data available');
            return;
        }

        // Create multiple files
        const files = {
            'resume.tex': this.buildLaTeXContent(resumeData, lang),
            'README.md': this.generateReadme(lang),
            'Makefile': this.generateMakefile()
        };

        // Check if there are publications for bibliography
        if (resumeData.publications) {
            files['publications.bib'] = this.generateBibliography(resumeData.publications);
        }

        // Create ZIP file with all LaTeX files
        this.downloadMultipleFiles(files, resumeData, lang);
    }

    generateReadme(lang) {
        return `# Resume LaTeX Template

This LaTeX resume was automatically generated from the portfolio website.

## Requirements
- LaTeX distribution (TeX Live, MiKTeX, etc.)
- moderncv package

## Compilation
\`\`\`bash
pdflatex resume.tex
\`\`\`

Or use the included Makefile:
\`\`\`bash
make
\`\`\`

## Overleaf Compatibility
This template is fully compatible with Overleaf. Simply upload the .tex file to your Overleaf project.

## Customization
You can customize the appearance by:
1. Changing the \\moderncvstyle{} (casual, classic, banking, oldstyle, fancy)
2. Changing the \\moderncvcolor{} (blue, orange, green, red, purple, grey, black)
3. Adjusting margins with the geometry package options

${lang === 'ko' ? `
## 요구사항
- LaTeX 배포판 (TeX Live, MiKTeX 등)
- moderncv 패키지

## 컴파일
\`\`\`bash
pdflatex resume.tex
\`\`\`

## Overleaf 호환성
이 템플릿은 Overleaf와 완전히 호환됩니다. .tex 파일을 Overleaf 프로젝트에 업로드하기만 하면 됩니다.
` : ''}
`;
    }

    generateMakefile() {
        return `# Makefile for LaTeX Resume

MAIN = resume
LATEX = pdflatex
BIBTEX = bibtex

.PHONY: all clean

all: $(MAIN).pdf

$(MAIN).pdf: $(MAIN).tex
\t$(LATEX) $(MAIN).tex
\t$(LATEX) $(MAIN).tex

clean:
\trm -f *.aux *.log *.out *.toc *.bbl *.blg *.synctex.gz

distclean: clean
\trm -f $(MAIN).pdf

help:
\t@echo "Available targets:"
\t@echo "  all      - Build the resume PDF"
\t@echo "  clean    - Remove auxiliary files"
\t@echo "  distclean- Remove all generated files"
\t@echo "  help     - Show this help message"
`;
    }

    async downloadMultipleFiles(files, resumeData, lang) {
        // For now, just download the main tex file
        // In a real implementation, you might want to use JSZip
        this.downloadLaTeXFile(files['resume.tex'], resumeData, lang);
        
        // Download README separately
        const name = resumeData?.personal?.name ? 
            window.i18n.t(resumeData.personal.name).replace(/\s+/g, '') : 'TaehoJe';
        
        const readmeBlob = new Blob([files['README.md']], { type: 'text/plain;charset=utf-8' });
        const readmeUrl = URL.createObjectURL(readmeBlob);
        
        const readmeLink = document.createElement('a');
        readmeLink.href = readmeUrl;
        readmeLink.download = `${name}_Resume_README.md`;
        document.body.appendChild(readmeLink);
        
        // Delay to avoid browser blocking multiple downloads
        setTimeout(() => {
            readmeLink.click();
            document.body.removeChild(readmeLink);
            URL.revokeObjectURL(readmeUrl);
        }, 1000);
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