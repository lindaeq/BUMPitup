import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const node = process.execPath
const server = spawn(node, [path.join(root, 'server', 'index.mjs')], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')
const web = spawn(node, [viteCli, '--host', '127.0.0.1'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})

let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  server.kill()
  web.kill()
  process.exitCode = code
}
server.on('exit', (code) => { if (!stopping) stop(code ?? 1) })
web.on('exit', (code) => { if (!stopping) stop(code ?? 1) })
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
