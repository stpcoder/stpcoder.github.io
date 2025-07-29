// Data Manager - Handles resume data and dynamic content updates
class DataManager {
    constructor() {
        this.resumeData = null;
        this.currentLanguage = 'en';
        this.init();
    }

    async init() {
        try {
            await this.loadResumeData();
            this.setupEventListeners();
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.renderContent();
                });
            } else {
                this.renderContent();
            }
        } catch (error) {
            console.error('Failed to initialize DataManager:', error);
            this.handleLoadError();
        }
    }

    async loadResumeData() {
        try {
            const response = await fetch('./data/resume-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.resumeData = await response.json();
            console.log('Resume data loaded successfully');
        } catch (error) {
            console.error('Error loading resume data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Listen for language changes
        window.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.updateLanguage(this.currentLanguage);
        });
    }

    handleLoadError() {
        // Fallback data in case JSON loading fails
        console.warn('Using fallback data');
        this.resumeData = this.getFallbackData();
        this.renderContent();
    }

    getFallbackData() {
        return {
            personal: {
                name: { ko: "제태호", en: "Taeho Je" },
                title: { ko: "소프트웨어 엔지니어", en: "Software Engineer" },
                email: "taeho.je@example.com",
                location: { ko: "서울, 대한민국", en: "Seoul, South Korea" }
            },
            about: {
                ko: "컴퓨터과학을 전공하며 소프트웨어 개발에 열정을 가진 개발자입니다.",
                en: "A passionate software engineer majoring in Computer Science."
            }
        };
    }

    renderContent() {
        if (!this.resumeData) {
            console.error('No resume data available');
            return;
        }

        this.renderAboutSection();
        this.renderTimelineSection();
        this.renderProjectsSection();
        this.renderSkillsSection();
        this.renderAwardsSection();
        this.renderContactSection();
        this.animateCounters();
    }

    renderAboutSection() {
        const aboutDescription = document.getElementById('aboutDescription');
        if (aboutDescription && this.resumeData.about) {
            aboutDescription.textContent = this.t(this.resumeData.about);
        }
    }

    renderTimelineSection() {
        const timeline = document.getElementById('timeline');
        if (!timeline || !this.resumeData) return;

        let timelineHTML = '';
        
        // Combine education and experience, sort by relevance
        const timelineItems = [];
        
        // Add education
        if (this.resumeData.education) {
            this.resumeData.education.forEach(edu => {
                timelineItems.push({
                    type: 'education',
                    date: edu.period,
                    title: this.t(edu.degree),
                    company: this.t(edu.institution),
                    description: `GPA: ${edu.gpa || 'N/A'}`,
                    location: this.t(edu.location)
                });
            });
        }

        // Add experience
        if (this.resumeData.experience) {
            this.resumeData.experience.forEach(exp => {
                timelineItems.push({
                    type: 'experience',
                    date: exp.period,
                    title: this.t(exp.position),
                    company: this.t(exp.company),
                    description: this.t(exp.description),
                    achievements: exp.achievements ? exp.achievements.map(ach => this.t(ach)) : []
                });
            });
        }

        // Render timeline items
        timelineItems.forEach((item, index) => {
            const achievements = item.achievements ? 
                `<ul class="timeline-achievements">
                    ${item.achievements.map(ach => `<li>${ach}</li>`).join('')}
                 </ul>` : '';

            timelineHTML += `
                <div class="timeline-item fade-in" style="animation-delay: ${index * 0.1}s">
                    <div class="timeline-content">
                        <div class="timeline-date">${item.date}</div>
                        <h3 class="timeline-title">${item.title}</h3>
                        <div class="timeline-company">${item.company}</div>
                        <p class="timeline-description">${item.description}</p>
                        ${achievements}
                    </div>
                    <div class="timeline-dot"></div>
                </div>
            `;
        });

        timeline.innerHTML = timelineHTML;
    }

    renderProjectsSection() {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid || !this.resumeData.projects) return;

        let projectsHTML = '';
        
        this.resumeData.projects.forEach((project, index) => {
            const techTags = project.technologies ? 
                project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('') : '';

            const projectLinks = `
                <div class="project-links">
                    ${project.github ? `<a href="${project.github}" target="_blank" class="project-link"><i class="fab fa-github"></i></a>` : ''}
                    ${project.demo ? `<a href="${project.demo}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i></a>` : ''}
                </div>
            `;

            projectsHTML += `
                <div class="project-card fade-in" style="animation-delay: ${index * 0.1}s">
                    <div class="project-header">
                        <h3 class="project-title">${this.t(project.title)}</h3>
                        ${projectLinks}
                    </div>
                    <p class="project-description">${this.t(project.description)}</p>
                    <div class="project-tech">${techTags}</div>
                    <div class="project-period">${project.period}</div>
                </div>
            `;
        });

        projectsGrid.innerHTML = projectsHTML;
    }

    renderSkillsSection() {
        const skillsCategories = document.getElementById('skillsCategories');
        if (!skillsCategories || !this.resumeData.skills) return;

        const categories = {
            programming: { ko: '프로그래밍 언어', en: 'Programming Languages' },
            technologies: { ko: '기술 & 도구', en: 'Technologies & Tools' }
        };

        let skillsHTML = '';

        Object.keys(categories).forEach(categoryKey => {
            if (this.resumeData.skills[categoryKey]) {
                skillsHTML += `
                    <div class="skill-category fade-in">
                        <h3>${this.t(categories[categoryKey])}</h3>
                        ${this.resumeData.skills[categoryKey].map(skill => `
                            <div class="skill-item">
                                <div class="skill-info">
                                    <span class="skill-name">${skill.name}</span>
                                    <span class="skill-level">${skill.level}%</span>
                                </div>
                                <div class="skill-bar">
                                    <div class="skill-progress" data-level="${skill.level}"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        });

        skillsCategories.innerHTML = skillsHTML;

        // Animate skill bars after rendering
        setTimeout(() => {
            this.animateSkillBars();
        }, 500);
    }

    renderAwardsSection() {
        const awardsGrid = document.getElementById('awardsGrid');
        if (!awardsGrid) return;

        let awardsHTML = '';
        const allAwards = [];

        // Combine awards and scholarships
        if (this.resumeData.awards) {
            allAwards.push(...this.resumeData.awards.map(award => ({...award, type: 'award'})));
        }
        if (this.resumeData.scholarships) {
            allAwards.push(...this.resumeData.scholarships.map(scholarship => ({...scholarship, type: 'scholarship'})));
        }
        if (this.resumeData.certifications) {
            allAwards.push(...this.resumeData.certifications.map(cert => ({...cert, type: 'certification'})));
        }

        allAwards.forEach((item, index) => {
            const icon = item.type === 'award' ? 'fa-trophy' : 
                        item.type === 'scholarship' ? 'fa-graduation-cap' : 'fa-certificate';

            awardsHTML += `
                <div class="award-card fade-in" style="animation-delay: ${index * 0.1}s">
                    <div class="award-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <h3 class="award-title">${this.t(item.title)}</h3>
                    <p class="award-organization">${this.t(item.organization || item.issuer)}</p>
                    <p class="award-year">${item.year}</p>
                    ${item.description ? `<p class="award-description">${this.t(item.description)}</p>` : ''}
                </div>
            `;
        });

        awardsGrid.innerHTML = awardsHTML;
    }

    renderContactSection() {
        const contactLocation = document.getElementById('contactLocation');
        if (contactLocation && this.resumeData.personal.location) {
            contactLocation.textContent = this.t(this.resumeData.personal.location);
        }

        // Update contact form labels and placeholders dynamically if needed
        this.updateContactForm();
    }

    updateContactForm() {
        // This would update form labels/placeholders if they weren't handled by i18n
        // Currently handled by data attributes in HTML
    }

    animateCounters() {
        const counters = document.querySelectorAll('[data-count]');
        counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = target % 1 === 0 ? Math.ceil(current) : current.toFixed(2);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target % 1 === 0 ? target : target.toFixed(2);
                }
            };

            // Start animation when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(counter);
        });
    }

    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const level = entry.target.getAttribute('data-level');
                    entry.target.style.width = level + '%';
                    observer.unobserve(entry.target);
                }
            });
        });

        skillBars.forEach(bar => observer.observe(bar));
    }

    updateLanguage(lang) {
        this.currentLanguage = lang;
        this.renderContent();
    }

    // Helper method to get translated text
    t(textObj) {
        if (typeof textObj === 'object' && textObj !== null) {
            return textObj[this.currentLanguage] || textObj['en'] || '';
        }
        return textObj || '';
    }

    // Get resume data for export functions
    getResumeData() {
        return this.resumeData;
    }

    // Update resume data (for future editing functionality)
    updateResumeData(newData) {
        this.resumeData = { ...this.resumeData, ...newData };
        this.renderContent();
    }

    // Add new item to a section
    addItem(section, item) {
        if (!this.resumeData[section]) {
            this.resumeData[section] = [];
        }
        this.resumeData[section].push(item);
        this.renderContent();
    }

    // Remove item from a section
    removeItem(section, index) {
        if (this.resumeData[section] && this.resumeData[section][index]) {
            this.resumeData[section].splice(index, 1);
            this.renderContent();
        }
    }

    // Save data to local storage (for offline editing)
    saveToLocalStorage() {
        localStorage.setItem('resume-data', JSON.stringify(this.resumeData));
    }

    // Load data from local storage
    loadFromLocalStorage() {
        const savedData = localStorage.getItem('resume-data');
        if (savedData) {
            try {
                this.resumeData = JSON.parse(savedData);
                this.renderContent();
                return true;
            } catch (error) {
                console.error('Error parsing saved resume data:', error);
                return false;
            }
        }
        return false;
    }
}

// Initialize data manager
const dataManager = new DataManager();
window.dataManager = dataManager;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}