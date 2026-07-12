import { copyFile, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsDirectory = dirname(fileURLToPath(import.meta.url))
const appDirectory = resolve(scriptsDirectory, '..')
const repositoryDirectory = resolve(appDirectory, '..')
const source = resolve(repositoryDirectory, 'data/resume-data.json')
const integrityFile = resolve(repositoryDirectory, 'data/resume-data-integrity.json')
const target = resolve(appDirectory, 'src/data/resume-data.json')

const [sourceContent, integrityContent, targetContent] = await Promise.all([
  readFile(source, 'utf8'),
  readFile(integrityFile, 'utf8'),
  readFile(target, 'utf8').catch(() => '')
])

const data = JSON.parse(sourceContent)
const integrity = JSON.parse(integrityContent)

for (const section of integrity.required_sections) {
  if (!(section in data)) throw new Error(`Missing required resume section: ${section}`)
}

const recordCounts = {
  education: data.education?.length || 0,
  experience: data.experience?.length || 0,
  projects: data.projects?.length || 0,
  awards: (data.awards || []).reduce((sum, group) => sum + (group.items?.length || 0), 0),
  scholarships: data.scholarships?.length || 0,
  media: data.media?.length || 0,
  activities: (data.activities || []).reduce((sum, group) => sum + (group.items?.length || 0), 0),
  certifications: data.certifications?.length || 0
}

for (const [section, minimum] of Object.entries(integrity.minimum_records)) {
  if (recordCounts[section] < minimum) {
    throw new Error(`Resume integrity check failed: ${section} has ${recordCounts[section]} records; expected at least ${minimum}.`)
  }
}

if (sourceContent !== targetContent) {
  await copyFile(source, target)
  console.log('Synced data/resume-data.json into the Vite app.')
}
