import { motion as Motion, AnimatePresence } from 'framer-motion'
import { getSectionItems, SECTION_META } from '../lib/profileData'

function getModalData(activeId, showAll = false) {
  const meta = SECTION_META.find((section) => section.id === activeId)
  if (!meta) return null

  return {
    title: meta.label,
    items: getSectionItems(activeId, showAll).map((item) => ({
      year: item.period,
      title: item.title,
      desc: [item.subtitle, item.description].filter(Boolean).join('\n'),
      link: item.link,
      category: item.category
    }))
  }
}

export default function Modal({ isOpen, onClose, activeId, showAll = false, isMobile = false }) {
  const data = getModalData(activeId, showAll)

  return (
    <AnimatePresence>
      {isOpen && data && (
        <Motion.div
          className="modal-overlay"
          initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={isMobile ? { opacity: 0, transition: { duration: 0 } } : {
            opacity: 0,
            pointerEvents: 'none',
            transition: {
              opacity: { duration: 0.2 },
              pointerEvents: { duration: 0 }
            }
          }}
          onClick={onClose}
        >
          <Motion.div
            className="modal-content"
            initial={isMobile ? { scale: 1, y: 0, opacity: 1 } : { scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={isMobile ? { opacity: 0, transition: { duration: 0 } } : { scale: 0.8, y: 50, opacity: 0 }}
            transition={isMobile ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <h2 className="modal-title">{data.title}</h2>
                {showAll && <span className="full-mode-badge">FULL ARCHIVE</span>}
              </div>
              <button className="close-btn" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="timeline">
              {data.items.map((item, index) => (
                <div key={index} className="timeline-item">
                  <span className="item-year">{item.year}</span>
                  <div className="item-header">
                    {item.category && <span className="item-category">{item.category}</span>}
                  </div>
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
                </div>
              ))}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  )
}
