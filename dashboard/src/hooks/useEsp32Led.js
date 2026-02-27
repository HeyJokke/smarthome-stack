import React from 'react'
import { fetchWithRetry } from './fetchWithRetry';

export function useEsp32Led() {
    const [isOn, setIsOn] = React.useState(false)
    const [isBusy, setIsBusy] = React.useState(false)
    const [actionError, setActionError] = React.useState(null)
    const [statusError, setStatusError] = React.useState(null)
    
    // Device configurations
    const API_BASE = import.meta.env.VITE_API_BASE ?? ""

    async function toggleLed() {
        const path = !isOn
        
        try {
            setIsBusy(true)
            setActionError(null)

            const res = await fetchWithRetry(`${API_BASE}/api/devices/livingroom/led`, { method: 'PUT', body: { on: path }})

            if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
            setIsOn(path)
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
            const res = await fetchWithRetry(`${API_BASE}/api/devices/livingroom/status`, { retries: 2 })
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
      }, [API_BASE])

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