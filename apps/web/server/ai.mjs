async function request(url, headers, body) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000)
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), signal: controller.signal })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('The AI provider rejected the API key. Check apps/web/.env.')
      if (response.status === 429) throw new Error('The AI provider rate limit or quota was reached.')
      if (response.status === 400 || response.status === 404) throw new Error('The AI provider rejected the request. Check the configured model.')
      throw new Error(`The AI provider is unavailable (HTTP ${response.status}).`)
    }
    return data
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('The AI request took too long. Please try again.')
    throw error
  } finally { clearTimeout(timeout) }
}

export async function geminiText(key, model, instructions, prompt) {
  const data = await request(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    { 'x-goog-api-key': key },
    { systemInstruction: { parts: [{ text: instructions }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }] })
  const answer = data?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('')
  if (!answer?.trim()) throw new Error('The AI returned an empty response.')
  return answer.trim()
}

export async function openaiText(key, model, instructions, prompt) {
  const data = await request('https://api.openai.com/v1/chat/completions',
    { Authorization: `Bearer ${key}` },
    { model, messages: [{ role: 'system', content: instructions }, { role: 'user', content: prompt }], temperature: 0.2, max_tokens: 450 })
  const answer = data?.choices?.[0]?.message?.content
  if (typeof answer !== 'string' || !answer.trim()) throw new Error('The AI returned an empty response.')
  return answer.trim()
}
