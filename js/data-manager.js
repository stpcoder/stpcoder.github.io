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
            const achievements = exp.achievements ?
                `<ul class="timeline-achievements">
                    ${exp.achievements.map(ach => `<li>${this.t(ach)}</li>`).join('')}
                 </ul>` : '';

            timelineHTML += `
                <div class="timeline-item-modern fade-in" style="animation-delay: ${index * 0.1}s">
                    <div class="timeline-dot-modern"></div>
                    <div class="timeline-content-modern">
                        <div class="timeline-date" style="color: var(--primary-600); font-weight: 600; margin-bottom: 0.5rem;">${exp.period}</div>
                        <h3 class="timeline-title">${this.t(exp.position)}</h3>
                        <div class="timeline-company" style="color: var(--slate-600); margin-bottom: 0.75rem;">${this.t(exp.company)}</div>
                        <p class="timeline-description">${this.t(exp.description)}</p>
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

    renderProjectsSection() {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid || !this.resumeData.projects) return;

        let projectsHTML = '';

        // Filter featured projects
        const featuredProjects = this.resumeData.projects.filter(p => p.featured);
        const otherProjects = this.resumeData.projects.filter(p => !p.featured);

        // Render featured projects first
        const allProjects = [...featuredProjects, ...otherProjects];

        allProjects.forEach((project, index) => {
            const techTags = project.technologies ?
                project.technologies.map(tech => `<span class="tech-tag-modern">${tech}</span>`).join('') : '';

            const projectLinks = `
                <div class="project-links">
                    ${project.github ? `<a href="${project.github}" target="_blank" class="project-link" title="GitHub"><i class="fab fa-github"></i></a>` : ''}
                    ${project.demo ? `<a href="${project.demo}" target="_blank" class="project-link" title="Live Demo"><i class="fas fa-external-link-alt"></i></a>` : ''}
                </div>
            `;

            const featuredBadge = project.featured ? `<span class="project-badge">Featured</span>` : '';
            const awardInfo = project.award ? `<div style="font-size: 0.9rem; color: #2563eb; font-weight: 500; margin-top: 0.5rem;">🏆 ${this.t(project.award)}</div>` : '';
            const eventInfo = project.event ? `<div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">${this.t(project.event)}</div>` : '';
            const typeInfo = project.type ? `<div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">${this.t(project.type)}</div>` : '';
            const periodInfo = project.period ? `<div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">${project.period}</div>` : '';

            projectsHTML += `
                <div class="project-card-modern ${project.featured ? 'featured' : ''} fade-in" style="animation-delay: ${index * 0.1}s">
                    <div class="project-header">
                        <div style="flex: 1;">
                            ${featuredBadge}
                            <h3 class="project-title">${this.t(project.title)}</h3>
                        </div>
                        ${projectLinks}
                    </div>
                    <p class="project-description">${this.t(project.description)}</p>
                    <div class="project-tech" style="margin: 1rem 0 0.5rem 0; display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${techTags}
                    </div>
                    ${periodInfo}
                    ${awardInfo}
                    ${eventInfo}
                    ${typeInfo}
                </div>
            `;
        });

        // Add repositories section if exists
        if (this.resumeData.repositories && this.resumeData.repositories.length > 0) {
            projectsHTML += `
                <div style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #e5e5e5;">
                    <h3 style="font-size: 1.3rem; font-weight: 600; margin-bottom: 1.5rem; color: #1a1a1a;">Other Repositories</h3>
                </div>
            `;

            this.resumeData.repositories.forEach((repo, index) => {
                const techTags = repo.technologies ?
                    repo.technologies.map(tech => `<span class="tech-tag-modern">${tech}</span>`).join('') : '';

                const repoLink = repo.url ? `<a href="${repo.url}" target="_blank" class="project-link" title="GitHub"><i class="fab fa-github"></i></a>` : '';
                const competitionInfo = repo.competition ? `<div style="font-size: 0.9rem; color: #2563eb; font-weight: 500; margin-top: 0.5rem;">🏆 ${this.t(repo.competition)}</div>` : '';
                const starsInfo = repo.stars ? `<span style="font-size: 0.85rem; color: #666; margin-left: 0.5rem;"><i class="fas fa-star" style="color: #f59e0b;"></i> ${repo.stars}</span>` : '';

                projectsHTML += `
                    <div class="project-card-modern fade-in" style="animation-delay: ${(index + allProjects.length) * 0.1}s">
                        <div class="project-header">
                            <div style="flex: 1;">
                                <h3 class="project-title">${repo.name}${starsInfo}</h3>
                            </div>
                            <div class="project-links">${repoLink}</div>
                        </div>
                        <p class="project-description">${this.t(repo.description)}</p>
                        <div class="project-tech" style="margin: 1rem 0 0.5rem 0; display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${techTags}
                        </div>
                        ${competitionInfo}
                    </div>
                `;
            });
        }

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
            const link = award.link ? ` <a href="${award.link}" target="_blank" style="color: #3b82f6; text-decoration: none;">[Link]</a>` : '';

            awardsHTML += `
                <div class="modern-card fade-in" style="animation-delay: ${globalIndex * 0.05}s">
                    ${award.year ? `<p class="timeline-date" style="font-size: 0.85rem; color: #3b82f6; font-weight: 600; margin-bottom: 0.5rem;">${award.year}</p>` : ''}
                    <h4 class="timeline-title" style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">${this.t(award.title)}${link}</h4>
                    ${organization ? `<p class="timeline-company" style="font-size: 1rem; color: #666; margin-bottom: 0.75rem; font-style: italic;">${organization}</p>` : ''}
                    ${description ? `<p class="timeline-description" style="font-size: 1rem; color: #444; line-height: 1.7;">${description}</p>` : ''}
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

        // Sort activities by year (newest first)
        const sortedActivities = [...this.resumeData.activities].sort((a, b) => {
            const yearA = parseInt(a.year || '0');
            const yearB = parseInt(b.year || '0');
            return yearB - yearA;
        });

        sortedActivities.forEach((activity, index) => {
            const description = this.t(activity.description) || '';
            const organization = this.t(activity.organization) || '';

            activitiesHTML += `
                <div class="modern-card fade-in" style="animation-delay: ${index * 0.05}s">
                    ${activity.year ? `<p class="timeline-date" style="font-size: 0.85rem; color: #3b82f6; font-weight: 600; margin-bottom: 0.5rem;">${activity.year}</p>` : ''}
                    <h4 class="timeline-title" style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">${this.t(activity.title)}</h4>
                    ${organization ? `<p class="timeline-company" style="font-size: 1rem; color: #666; margin-bottom: 0.75rem; font-style: italic;">${organization}</p>` : ''}
                    ${description ? `<p class="timeline-description" style="font-size: 1rem; color: #444; line-height: 1.7;">${description}</p>` : ''}
                </div>
            `;
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