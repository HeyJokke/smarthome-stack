import React from 'react'
import { fetchWithRetry } from './fetchWithRetry';

export function useEsp32Led({ baseUrl } = {}) {
    const [isOn, setIsOn] = React.useState(false)
    const [isBusy, setIsBusy] = React.useState(false)
    const [actionError, setActionError] = React.useState(null)
    const [statusError, setStatusError] = React.useState(null)
    
    // Device configurations
    const ESP32_BASE = baseUrl
    const PI_BACKEND = 'http://192.168.0.63'

    async function toggleLed() {
    try {
        setIsBusy(true)
        setActionError(null)
        const path = !isOn ? true : false

        const res = await fetchWithRetry(`${PI_BACKEND}/api/devices/livingroom/led`, { body: { on: path }})

        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        return
        } catch(err) {
            const message = err?.message ?? 'An unknown error occured'
            setActionError(message)
            console.error('[LED] Toggle failed: ', err)
        } finally {
            setIsBusy(false)
        }
    }

    const getLedStatus = React.useCallback( async () => {
          try {
            const res = await fetchWithRetry(`${ESP32_BASE}/status`, { retries: 2 })
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`)

            const data = await res.json()
            setActionError(null)
            setStatusError(null)
      
            if (data.LED === 'ON') {
              setIsOn(true)
            } else if (data.LED === 'OFF') {
              setIsOn(false)
            }
          } catch(err) {
            const message = err?.message ?? 'An unknown error occurred'
            setStatusError(message)
            console.error('[LED] Status failed: ', err)
          }
      }, [ESP32_BASE])

    React.useEffect(() => {
        getLedStatus()
    }, [getLedStatus])

    React.useEffect(() => {
        const id = setInterval(() => {
        if (!isBusy) {
            getLedStatus()
        } 
        }, 5000)

        return () => clearInterval(id)
    },[isBusy, getLedStatus])

    return {
        isOn,
        isBusy,
        actionError,
        statusError,
        toggleLed
    }
}