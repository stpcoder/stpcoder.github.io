import { SECTION_META, profile } from '../lib/profileData'

export default function LiquidGlassFallback({ onBubbleClick }) {
  return (
    <div className="liquid-fallback" aria-label="Low-power portfolio navigation">
      {SECTION_META.map((section, index) => (
        <button
          key={section.id}
          className={`liquid-fallback-bubble bubble-${index + 1}`}
          onClick={() => onBubbleClick(section.id)}
          type="button"
        >
          <span>{section.label}</span>
          <small>{profile.sectionCounts[section.id].featured}</small>
        </button>
      ))}
    </div>
  )
}
