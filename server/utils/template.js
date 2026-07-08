import fs from 'fs'
import path from 'path'

export function loadTemplate(name, replacements = {}) {
  const filePath = path.join(process.cwd(), 'templates', name)

  let html = fs.readFileSync(filePath, 'utf8')

  for (const key in replacements) {
    html = html.replaceAll(`{{${key}}}`, replacements[key])
  }

  return html
}