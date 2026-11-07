import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(here, '..')
const envPath = path.join(appRoot, '.env')

// Small .env loader so no extra dependency is required.
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!match || match[1] in process.env) continue
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
  }
}

const PORT = Number(process.env.API_PORT || 3001)
const API_KEY = process.env.OPENAI_API_KEY || ''
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini'
const MAX_BODY = 16_000

const systemPrompt = `You are the BumpBridge educational wellness chat assistant. You are not a doctor, midwife, nurse, or emergency service, and you cannot diagnose, prescribe, assess an individual pregnancy, or replace the user's care team.
Give general, cautious, plain-language pregnancy and prenatal mobility education. Be warm, concise, and non-judgmental. Do not invent clinical facts, citations, or certainty. If you are unsure, say so.
For personal symptoms, medication questions, changes in pregnancy, or questions requiring knowledge of the user's medical history, encourage the user to contact their own maternity care team rather than making an individualized recommendation.
For potentially urgent symptoms such as heavy bleeding, severe or persistent abdominal pain, chest pain, trouble breathing, fainting, severe headache or vision changes, fluid leakage, or reduced fetal movement, advise immediate contact with maternity triage or emergency services. Do not delay urgent care to continue chatting.
Never claim that a message has been sent to a clinician or that a clinician will review this chat. This chat does not notify the care team.`

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

async function readBody(req) {
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > MAX_BODY) throw new Error('Request is too large.')
  }
  return JSON.parse(raw || '{}')
}

async function handleChat(req, res) {
  let body
  try {
    body = await readBody(req)
  } catch {
    return send(res, 400, { error: 'Please send a valid chat message.' })
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) return send(res, 400, { error: 'Type a message first.' })
  if (message.length > 4000) return send(res, 400, { error: 'Please keep messages under 4,000 characters.' })
  if (!API_KEY) return send(res, 503, { error: 'OpenAI is not configured yet. Add your key to apps/web/.env and restart the server.' })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25_000)
  let response
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.2,
        max_tokens: 450,
      }),
      signal: controller.signal,
    })
  } catch (error) {
    const timedOut = error?.name === 'AbortError'
    console.error('OpenAI connection error:', error?.message || error)
    return send(res, 502, {
      error: timedOut
        ? 'The assistant took too long to respond. Please try again.'
        : 'Could not connect to OpenAI. Check your internet connection and try again.',
    })
  } finally {
    clearTimeout(timeout)
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = data?.error?.message || `OpenAI request failed (${response.status}).`
    console.error(`[OpenAI API] HTTP ${response.status}: ${detail}`)
    if (response.status === 401 || response.status === 403) {
      return send(res, 502, { error: 'OpenAI rejected the API key. Check OPENAI_API_KEY in apps/web/.env.' })
    }
    if (response.status === 429) {
      return send(res, 503, { error: 'OpenAI rate limit or usage quota reached. Check your OpenAI API billing and limits.' })
    }
    if (response.status === 400 || response.status === 404) {
      return send(res, 502, { error: `OpenAI rejected the request. Check OPENAI_MODEL (${MODEL}). Details: ${detail}` })
    }
    if (response.status >= 500) {
      return send(res, 503, { error: 'OpenAI is temporarily unavailable. Please try again shortly.' })
    }
    return send(res, 502, { error: detail })
  }

  const reply = data?.choices?.[0]?.message?.content
  if (typeof reply !== 'string' || !reply.trim()) {
    console.error('OpenAI returned an empty or unexpected response.')
    return send(res, 502, { error: 'The assistant returned an empty response. Please try again.' })
  }
  return send(res, 200, { reply: reply.trim() })
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`)
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return send(res, 200, { ok: true, openaiConfigured: Boolean(API_KEY), model: MODEL })
  }
  if (req.method === 'POST' && url.pathname === '/api/chat') {
    return handleChat(req, res)
  }
  return send(res, 404, { error: 'Not found.' })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`BumpBridge chat API listening on http://127.0.0.1:${PORT}`)
  console.log(`OpenAI model: ${MODEL}`)
  console.log(`OpenAI configured: ${Boolean(API_KEY)}`)
})
