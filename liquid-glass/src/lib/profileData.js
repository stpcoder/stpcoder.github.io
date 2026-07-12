import resumeData from '../data/resume-data.json'

export const SECTION_META = [
  { id: 'education', label: 'Education', shortLabel: 'EDU', symbol: '01' },
  { id: 'experience', label: 'Experience', shortLabel: 'EXP', symbol: '02' },
  { id: 'projects', label: 'Projects', shortLabel: 'PRJ', symbol: '03' },
  { id: 'awards', label: 'Awards', shortLabel: 'AWD', symbol: '04' },
  { id: 'scholarships', label: 'Scholarships', shortLabel: 'SCH', symbol: '05' },
  { id: 'media', label: 'Media', shortLabel: 'MED', symbol: '06' },
  { id: 'activities', label: 'Activities', shortLabel: 'ACT', symbol: '07' }
]

export function getText(value, language = 'en') {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[language] || value.en || value.ko || ''
}

export function isVisible(item, showAll = false) {
  return showAll || item?.featured !== false
}

function normalizeItem(section, item, index, category = '') {
  const shared = {
    id: `${section}-${index}-${getText(item.title || item.company || item.institution).replace(/\s+/g, '-').toLowerCase()}`,
    section,
    title: getText(item.title || item.company || item.institution),
    period: item.period || item.year || '',
    description: getText(item.description),
    link: item.link || item.github || '',
    category,
    featured: item.featured !== false,
    raw: item
  }

  if (section === 'education') {
    return {
      ...shared,
      subtitle: getText(item.degree),
      description: [getText(item.status), item.gpa ? `GPA ${item.gpa}` : ''].filter(Boolean).join(' · ')
    }
  }

  if (section === 'experience') {
    return {
      ...shared,
      subtitle: getText(item.position)
    }
  }

  if (section === 'projects') {
    return {
      ...shared,
      subtitle: getText(item.organization),
      technologies: item.technologies || []
    }
  }

  if (section === 'awards') {
    return {
      ...shared,
      subtitle: getText(item.organization)
    }
  }

  if (section === 'scholarships') {
    return {
      ...shared,
      subtitle: getText(item.organization)
    }
  }

  if (section === 'media') {
    return {
      ...shared,
      subtitle: getText(item.organization),
      mediaType: item.type || 'article'
    }
  }

  if (section === 'activities') {
    return {
      ...shared,
      subtitle: [getText(item.organization), getText(item.role)].filter(Boolean).join(' · ')
    }
  }

  return shared
}

export function getSectionItems(section, showAll = false) {
  let entries = []

  if (section === 'awards') {
    entries = (resumeData.awards || []).flatMap((group) =>
      (group.items || []).map((item) => ({ item, category: getText(group.category) }))
    )
  } else if (section === 'activities') {
    entries = (resumeData.activities || []).flatMap((group) =>
      (group.items || []).map((item) => ({ item, category: getText(group.category) }))
    )
  } else {
    entries = (resumeData[section] || []).map((item) => ({ item, category: '' }))
  }

  return entries
    .filter(({ item }) => isVisible(item, showAll))
    .map(({ item, category }, index) => normalizeItem(section, item, index, category))
}

export function getSectionCounts() {
  return Object.fromEntries(
    SECTION_META.map(({ id }) => [
      id,
      {
        featured: getSectionItems(id, false).length,
        total: getSectionItems(id, true).length
      }
    ])
  )
}

export function getAllItems(showAll = false) {
  return SECTION_META.flatMap(({ id }) => getSectionItems(id, showAll))
}

export const profile = {
  data: resumeData,
  name: getText(resumeData.personal.name),
  title: getText(resumeData.personal.title),
  location: getText(resumeData.personal.location),
  about: getText(resumeData.about),
  email: resumeData.personal.email,
  github: resumeData.personal.github,
  linkedin: resumeData.personal.linkedin,
  portfolio: resumeData.personal.portfolio,
  skills: [
    ...(resumeData.skills?.programming || []),
    ...(resumeData.skills?.technologies || [])
  ],
  sectionCounts: getSectionCounts()
}

export default resumeData
