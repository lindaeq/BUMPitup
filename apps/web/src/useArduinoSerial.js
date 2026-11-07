import { useCallback, useEffect, useRef, useState } from 'react'

const validHeartRate = value => Number.isFinite(value) && value > 0

export function useArduinoSerial() {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [live, setLive] = useState({ hr: null, reps: 0 })
  const [restHR, setRestHR] = useState(null)
  const [error, setError] = useState('')
  const readerRef = useRef(null)
  const activeRef = useRef(false)
  const connectingRef = useRef(false)
  const stoppingRef = useRef(false)
  const mountedRef = useRef(true)
  const supported = typeof navigator !== 'undefined' && 'serial' in navigator

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stoppingRef.current = true
      activeRef.current = false
      void readerRef.current?.cancel().catch(() => {})
    }
  }, [])

  const connect = useCallback(async () => {
    if (connectingRef.current || activeRef.current) return
    if (!('serial' in navigator)) {
      setError('Use Chrome or Edge to connect the wristband.')
      return
    }

    connectingRef.current = true
    stoppingRef.current = false
    setConnecting(true)
    setError('')
    let port = null
    let reader = null
    try {
      // requestPort must happen directly after the Connect button click.
      port = await navigator.serial.requestPort()
      if (!mountedRef.current) return
      await port.open({ baudRate: 115200 })
      if (!port.readable) throw new Error('The serial port did not provide a readable stream.')

      reader = port.readable.getReader()
      readerRef.current = reader
      activeRef.current = true
      setConnected(true)
      setConnecting(false)
      setLive({ hr: null, reps: 0 })
      setRestHR(null)

      const decoder = new TextDecoder()
      let buffer = ''
      while (activeRef.current) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let newline = buffer.indexOf('\n')
        while (newline !== -1) {
          const line = buffer.slice(0, newline).trim()
          buffer = buffer.slice(newline + 1)
          if (line) {
            try {
              const message = JSON.parse(line)
              if (message.type === 'rest' && validHeartRate(message.hr)) setRestHR(message.hr)
              if (message.type === 'live' && validHeartRate(message.hr)) {
                setLive({ hr: message.hr, reps: Number.isFinite(message.reps) ? message.reps : 0 })
              }
            } catch { /* Ignore non-JSON device output. */ }
          }
          newline = buffer.indexOf('\n')
        }
        if (buffer.length > 4096) buffer = ''
      }
    } catch (failure) {
      if (!stoppingRef.current && mountedRef.current && failure?.name !== 'NotFoundError') {
        const busy = failure?.name === 'NetworkError' || failure?.name === 'InvalidStateError'
        setError(busy
          ? 'Could not open the port. Close the Arduino or VS Code Serial Monitor, then try again.'
          : failure instanceof Error ? failure.message : 'Could not connect to the wristband.')
      }
    } finally {
      activeRef.current = false
      readerRef.current = null
      try { reader?.releaseLock() } catch { /* Reader was already released. */ }
      try { await port?.close() } catch { /* Port may already be disconnected. */ }
      connectingRef.current = false
      if (mountedRef.current) {
        setConnected(false)
        setConnecting(false)
        setLive({ hr: null, reps: 0 })
        setRestHR(null)
      }
    }
  }, [])

  const disconnect = useCallback(async () => {
    stoppingRef.current = true
    activeRef.current = false
    try { await readerRef.current?.cancel() } catch { /* Read loop will close the port. */ }
  }, [])

  return { supported, connected, connecting, live, restHR, error, connect, disconnect }
}
