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
        this.renderExperienceSection();
        this.renderEducationSection();
        this.renderResearchSection();
        this.renderProjectsSection();
        this.renderSkillsSection();
        this.renderAwardsSection();
        this.renderScholarshipsSection();
        this.renderActivitiesSection();
        this.animateCounters();
    }

    renderAboutSection() {
        const aboutDescription = document.getElementById('aboutDescription');
        if (aboutDescription && this.resumeData.about) {
            aboutDescription.textContent = this.t(this.resumeData.about);
        }
    }

    renderExperienceSection() {
        const timeline = document.getElementById('experience-timeline');
        if (!timeline || !this.resumeData?.experience) return;

        timeline.className = 'modern-timeline';
        let timelineHTML = '';

        // Render experience items
        this.resumeData.experience.forEach((exp, index) => {
            const achievements = exp.achievements && exp.achievements.length > 0 ?
                `<ul class="timeline-achievements">
                    ${exp.achievements.map(ach => `<li>${this.t(ach)}</li>`).join('')}
                 </ul>` : '';

            const description = this.t(exp.description).replace(/\n/g, '<br>');

            timelineHTML += `
                <div class="timeline-item-modern fade-in" style="animation-delay: ${index * 0.1}s">
                    <div class="timeline-dot-modern"></div>
                    <div class="timeline-content-modern">
                        <div class="timeline-date" style="color: var(--primary-600); font-weight: 600; margin-bottom: 0.5rem;">${exp.period}</div>
                        <h3 class="timeline-title">${this.t(exp.position)}</h3>
                        <div class="timeline-company" style="color: var(--slate-600); margin-bottom: 0.75rem;">${this.t(exp.company)}</div>
                        <p class="timeline-description">${description}</p>
                        ${achievements}
                    </div>
                </div>
            `;
        });

        timeline.innerHTML = timelineHTML;
    }

    renderEducationSection() {
        const timeline = document.getElementById('education-timeline');
        if (!timeline || !this.resumeData?.education) return;

        timeline.className = 'modern-timeline';
        let timelineHTML = '';

        // Render education items
        this.resumeData.education.forEach((edu, index) => {
            const gpaInfo = edu.gpa ? `<p class="timeline-gpa" style="color: var(--accent-600); font-weight: 600; margin-top: 0.5rem;">GPA: ${edu.gpa}</p>` : '';
            const locationInfo = edu.location ? `<p class="timeline-location" style="color: var(--slate-500); margin-top: 0.25rem;">${this.t(edu.location)}</p>` : '';

            timelineHTML += `
                <div class="timeline-item-modern fade-in" style="animation-delay: ${index * 0.1}s">
                    <div class="timeline-dot-modern"></div>
                    <div class="timeline-content-modern">
                        <div class="timeline-date" style="color: var(--primary-600); font-weight: 600; margin-bottom: 0.5rem;">${edu.period}</div>
                        <h3 class="timeline-title">${this.t(edu.degree)}</h3>
                        <div class="timeline-company" style="color: var(--slate-600); margin-bottom: 0.5rem;">${this.t(edu.institution)}</div>
                        ${gpaInfo}
                        ${locationInfo}
                    </div>
                </div>
            `;
        });

        timeline.innerHTML = timelineHTML;
    }

    renderResearchSection() {
        const researchGrid = document.getElementById('researchGrid');
        if (!researchGrid || !this.resumeData.research) return;

        let researchHTML = '';

        this.resumeData.research.forEach((research, index) => {
            const organization = this.t(research.organization) || '';
            const description = this.t(research.description) || '';
            const award = research.award ? this.t(research.award) : '';
            const link = research.link ? ` <a href="${research.link}" target="_blank" style="color: #3b82f6; text-decoration: none;">[Link]</a>` : '';

            researchHTML += `
                <div class="modern-card fade-in" style="animation-delay: ${index * 0.05}s">
                    ${research.period ? `<p class="timeline-date" style="font-size: 0.85rem; color: #3b82f6; font-weight: 600; margin-bottom: 0.5rem;">${research.period}</p>` : ''}
                    <h4 class="timeline-title" style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">${this.t(research.title)}${link}</h4>
                    ${organization ? `<p class="timeline-company" style="font-size: 1rem; color: #666; margin-bottom: 0.75rem; font-style: italic;">${organization}</p>` : ''}
                    ${award ? `<p style="font-size: 0.95rem; color: #2563eb; font-weight: 600; margin-bottom: 0.5rem;">🏆 ${award}</p>` : ''}
                    ${description ? `<p class="timeline-description" style="font-size: 1rem; color: #444; line-height: 1.7;">${description}</p>` : ''}
                </div>
            `;
        });

        researchGrid.innerHTML = researchHTML;
    }

    renderProjectsSection() {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid || !this.resumeData.projects) return;

        let projectsHTML = '';

        // Sort projects by year (newest first)
        const sortedProjects = [...this.resumeData.projects].sort((a, b) => {
            const yearA = parseInt(a.year || '0');
            const yearB = parseInt(b.year || '0');
            return yearB - yearA;
        });

        sortedProjects.forEach((project, index) => {
            const organization = this.t(project.organization) || '';
            const description = this.t(project.description) || '';
            const link = project.link ? ` <a href="${project.link}" target="_blank" style="color: #3b82f6; text-decoration: none;">[Link]</a>` : '';

            projectsHTML += `
                <div class="modern-card fade-in" style="animation-delay: ${index * 0.05}s">
                    ${project.year ? `<p class="timeline-date" style="font-size: 0.85rem; color: #3b82f6; font-weight: 600; margin-bottom: 0.5rem;">${project.year}</p>` : ''}
                    <h4 class="timeline-title" style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">${this.t(project.title)}${link}</h4>
                    ${organization ? `<p class="timeline-company" style="font-size: 1rem; color: #666; margin-bottom: 0.75rem; font-style: italic;">${organization}</p>` : ''}
                    ${description ? `<p class="timeline-description" style="font-size: 1rem; color: #444; line-height: 1.7;">${description}</p>` : ''}
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
        if (!awardsGrid || !this.resumeData.awards) return;

        let awardsHTML = '';
        let globalIndex = 0;

        // Flatten all awards from categories and sort by year
        const allAwards = [];
        this.resumeData.awards.forEach(category => {
            category.items.forEach(award => {
                allAwards.push(award);
            });
        });

        const sortedAwards = allAwards.sort((a, b) => {
            const yearA = parseInt(a.year || '0');
            const yearB = parseInt(b.year || '0');
            return yearB - yearA;
        });

        sortedAwards.forEach(award => {
            const organization = this.t(award.organization) || '';
            const description = this.t(award.description) || '';
            let mainLink = '';
            if (award.link) {
                mainLink = ` <a href="${award.link}" target="_blank" style="color: #3b82f6; text-decoration: none;">[Link]</a>`;
            }

            let newsLinks = '';
            if (award.newsLinks && Array.isArray(award.newsLinks)) {
                newsLinks = '<div style="margin-top: 0.5rem; font-size: 0.75rem;">' +
                    award.newsLinks.map((url, idx) => `<a href="${url}" target="_blank" style="color: #666; text-decoration: none; margin-right: 0.5rem;">[News ${idx + 1}]</a>`).join('') +
                    '</div>';
            }

            awardsHTML += `
                <div class="modern-card fade-in" style="animation-delay: ${globalIndex * 0.05}s">
                    ${award.year ? `<p class="timeline-date" style="font-size: 0.85rem; color: #3b82f6; font-weight: 600; margin-bottom: 0.5rem;">${award.year}</p>` : ''}
                    <h4 class="timeline-title" style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">${this.t(award.title)}${mainLink}</h4>
                    ${organization ? `<p class="timeline-company" style="font-size: 1rem; color: #666; margin-bottom: 0.75rem; font-style: italic;">${organization}</p>` : ''}
                    ${description ? `<p class="timeline-description" style="font-size: 1rem; color: #444; line-height: 1.7;">${description}</p>` : ''}
                    ${newsLinks}
                </div>
            `;
            globalIndex++;
        });

        awardsGrid.innerHTML = awardsHTML;
    }

    renderScholarshipsSection() {
        const scholarshipsGrid = document.getElementById('scholarshipsGrid');
        if (!scholarshipsGrid || !this.resumeData.scholarships) return;

        let scholarshipsHTML = '';

        // Sort scholarships by start year (newest first)
        const sortedScholarships = [...this.resumeData.scholarships].sort((a, b) => {
            const yearA = parseInt(a.period?.split('-')[0] || '0');
            const yearB = parseInt(b.period?.split('-')[0] || '0');
            return yearB - yearA;
        });

        sortedScholarships.forEach((scholarship, index) => {
            const description = this.t(scholarship.description) || '';
            const organization = this.t(scholarship.organization) || '';

            scholarshipsHTML += `
                <div class="modern-card fade-in" style="animation-delay: ${index * 0.05}s">
                    ${scholarship.period ? `<p class="timeline-date" style="font-size: 0.85rem; color: #3b82f6; font-weight: 600; margin-bottom: 0.5rem;">${scholarship.period}</p>` : ''}
                    <h4 class="timeline-title" style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">${this.t(scholarship.title)}</h4>
                    ${organization ? `<p class="timeline-company" style="font-size: 1rem; color: #666; margin-bottom: 0.75rem; font-style: italic;">${organization}</p>` : ''}
                    ${description ? `<p class="timeline-description" style="font-size: 1rem; color: #444; line-height: 1.7;">${description}</p>` : ''}
                </div>
            `;
        });

        scholarshipsGrid.innerHTML = scholarshipsHTML;
    }

    renderActivitiesSection() {
        const activitiesGrid = document.getElementById('activitiesGrid');
        if (!activitiesGrid || !this.resumeData.activities) return;

        let activitiesHTML = '';
        let globalIndex = 0;

        // Flatten all activities from categories
        const allActivities = [];
        this.resumeData.activities.forEach(category => {
            if (category.items) {
                category.items.forEach(item => {
                    allActivities.push({
                        ...item,
                        period: item.period || item.year || ''
                    });
                });
            }
        });

        // Sort by period/year (newest first)
        const sortedActivities = allActivities.sort((a, b) => {
            const getYear = (period) => {
                if (!period) return 0;
                const match = period.toString().match(/\d{4}/);
                return match ? parseInt(match[0]) : 0;
            };
            return getYear(b.period) - getYear(a.period);
        });

        sortedActivities.forEach((activity, index) => {
            const description = this.t(activity.description) || '';
            const organization = this.t(activity.organization) || '';
            const role = activity.role ? this.t(activity.role) : '';
            const award = activity.award ? this.t(activity.award) : '';
            const link = activity.link ? ` <a href="${activity.link}" target="_blank" style="color: #3b82f6; text-decoration: none;">[Link]</a>` : '';

            activitiesHTML += `
                <div class="modern-card fade-in" style="animation-delay: ${globalIndex * 0.05}s">
                    ${activity.period ? `<p class="timeline-date" style="font-size: 0.85rem; color: #3b82f6; font-weight: 600; margin-bottom: 0.5rem;">${activity.period}</p>` : ''}
                    <h4 class="timeline-title" style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">${this.t(activity.title)}${link}</h4>
                    ${organization ? `<p class="timeline-company" style="font-size: 1rem; color: #666; margin-bottom: 0.75rem; font-style: italic;">${organization}</p>` : ''}
                    ${role ? `<p style="font-size: 0.95rem; color: #666; margin-bottom: 0.5rem;">${role}</p>` : ''}
                    ${award ? `<p style="font-size: 0.95rem; color: #2563eb; font-weight: 600; margin-bottom: 0.5rem;">${award}</p>` : ''}
                    ${description ? `<p class="timeline-description" style="font-size: 1rem; color: #444; line-height: 1.7;">${description}</p>` : ''}
                </div>
            `;
            globalIndex++;
        });

        activitiesGrid.innerHTML = activitiesHTML;
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