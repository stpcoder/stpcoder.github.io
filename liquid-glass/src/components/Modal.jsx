import { motion, AnimatePresence } from 'framer-motion'
import resumeData from '../data/resume-data.json'

// 데이터 변환 함수
function getModalData(activeId, showAll = false) {
  const lang = 'en' // 영어 기본

  const getText = (obj) => {
    if (!obj) return ''
    if (typeof obj === 'string') return obj
    return obj[lang] || obj.ko || ''
  }

  switch (activeId) {
    case 'education':
      return {
        title: 'Education',
        items: resumeData.education
          .filter(item => showAll || item.featured !== false)
          .map(item => ({
            year: item.period,
            title: getText(item.institution),
            desc: `${getText(item.degree)}\nGPA: ${item.gpa}`,
            link: item.link
          }))
      }

    case 'experience':
      return {
        title: 'Experience',
        items: resumeData.experience
          .filter(item => showAll || item.featured !== false)
          .map(item => ({
            year: item.period,
            title: typeof item.company === 'string' ? item.company : getText(item.company),
            desc: `${getText(item.position)}\n${getText(item.description)}`,
            link: item.link
          }))
      }

    case 'projects':
      return {
        title: 'Projects',
        items: resumeData.projects
          .filter(item => showAll || item.featured !== false)
          .map(item => ({
            year: item.year,
            title: getText(item.title),
            desc: `${getText(item.organization)}\n${getText(item.description)}`,
            link: item.link || item.github
          }))
      }

    case 'awards':
      // 모든 카테고리의 awards를 평탄화
      const allAwards = resumeData.awards.flatMap(category =>
        category.items.map(item => ({
          ...item,
          category: getText(category.category)
        }))
      )
      return {
        title: 'Awards',
        items: allAwards
          .filter(item => showAll || item.featured !== false)
          .map(item => ({
            year: item.year,
            title: getText(item.title),
            desc: `${getText(item.organization)}${item.description ? '\n' + getText(item.description) : ''}`,
            link: item.link,
            category: item.category
          }))
      }

    case 'scholarships':
      return {
        title: 'Scholarships',
        items: resumeData.scholarships
          .filter(item => showAll || item.featured !== false)
          .map(item => ({
            year: item.period,
            title: getText(item.title),
            desc: `${getText(item.organization)}\n${getText(item.description)}`,
            link: item.link
          }))
      }

    case 'media':
      return {
        title: 'Media',
        items: resumeData.media
          .filter(item => showAll || item.featured !== false)
          .map(item => ({
            year: item.year,
            title: getText(item.title),
            desc: `${getText(item.organization)}\n${getText(item.description)}`,
            link: item.link
          }))
      }

    case 'activities':
      // 모든 카테고리의 activities를 평탄화
      const allActivities = resumeData.activities.flatMap(category =>
        category.items.map(item => ({
          ...item,
          category: getText(category.category)
        }))
      )
      return {
        title: 'Activities',
        items: allActivities
          .filter(item => showAll || item.featured !== false)
          .map(item => ({
            year: item.period,
            title: getText(item.title),
            desc: `${getText(item.organization || '')}${item.role ? '\n' + getText(item.role) : ''}${item.description ? '\n' + getText(item.description) : ''}`,
            link: item.link,
            category: item.category
          }))
      }

    default:
      return null
  }
}

export default function Modal({ isOpen, onClose, activeId, showAll = false }) {
  const data = getModalData(activeId, showAll)

  return (
    <AnimatePresence>
      {isOpen && data && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h2 className="modal-title">{data.title}</h2>

            <div className="timeline">
              {data.items.map((item, index) => (
                <motion.div
                  key={index}
                  className="timeline-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="item-year">{item.year}</span>
                  <h3 className="item-title">
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        {item.title}
                        <svg className="link-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>
                  <p className="item-desc">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
