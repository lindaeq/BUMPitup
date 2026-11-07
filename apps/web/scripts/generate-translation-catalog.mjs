import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')
const screens = ['Home', 'CheckIn', 'CheckInDone', 'Plan', 'ExerciseDetail', 'Session', 'Report', 'Calendar', 'Baby', 'Care', 'Assistant', 'You']
const files = [
  ...screens.map(name => path.join(root, 'screens', `${name}.tsx`)),
  ...['BackBar', 'PhoneFrame'].map(name => path.join(root, 'components', `${name}.tsx`)),
  path.join(root, 'tracking', 'vision', 'movementTips.ts'),
  path.join(root, 'data.ts'), path.join(root, 'store.ts'), path.join(root, 'lib', 'profile.ts'),
]

const phrases = new Set()
const add = (raw, allowLowercase = false) => {
  const value = raw.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()
  if (value.length < 3 || value.length > 250 || !/[a-zA-Z]/.test(value)) return
  if (/^[\w.-]+\.(tsx?|jsx?|css|svg)$/.test(value) || /^https?:\/\//.test(value)) return
  if (/^[#./{]|[{}<>`=]|var\(--|^\d/.test(value) || (!allowLowercase && /^[a-z][a-z0-9_-]*$/.test(value))) return
  phrases.add(value)
}

for (const file of files) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const visit = node => {
    if (ts.isJsxText(node)) add(node.getText(source))
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent = node.parent
      if (ts.isJsxAttribute(parent) && ['placeholder', 'title', 'aria-label'].includes(parent.name.text)) add(node.text)
      else if (ts.isArrayLiteralExpression(parent) || ts.isConditionalExpression(parent) || ts.isJsxExpression(parent)) add(node.text)
      else if (ts.isPropertyAssignment(parent) && /^(name|title|body|label|detail|note|message|rom|text)$/.test(parent.name.getText(source))) {
        add(node.text, file.endsWith('data.ts') && parent.name.getText(source) === 'name')
      }
      else if (ts.isCallExpression(parent) && ['t', 'showToast'].includes(parent.expression.getText(source))) add(node.text)
      else if (ts.isNewExpression(parent) && parent.expression.getText(source) === 'Error') add(node.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}

const output = path.join(root, 'lib', 'translationCatalog.json')
fs.writeFileSync(output, JSON.stringify([...phrases].sort(), null, 2) + '\n')
console.log(`Wrote ${phrases.size} UI phrases to ${path.relative(process.cwd(), output)}`)
