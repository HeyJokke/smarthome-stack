import React from 'react'
import { fetchWithRetry } from './fetchWithRetry';

export function useEsp32Led({ device }) {
    const [isOn, setIsOn] = React.useState(false)
    const [isBusy, setIsBusy] = React.useState(false)
    const [actionError, setActionError] = React.useState(null)
    const [statusError, setStatusError] = React.useState(null)
    const [temp, setTemp] = React.useState(0)

    // Device configurations
    const API_BASE_HTTP = import.meta.env.VITE_API_BASE ? ('http://' + import.meta.env.VITE_API_BASE) : ""
    const API_BASE = import.meta.env.VITE_API_BASE ?? "192.168.0.63:3000"

    async function toggleLed() {
        const path = !isOn
        
        try {
            setIsBusy(true)
            setActionError(null)

            const res = await fetchWithRetry(`${API_BASE_HTTP}/api/devices/${device}/led`, { method: 'PUT', body: { on: path }})

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
            const res = await fetchWithRetry(`${API_BASE_HTTP}/api/devices/${device}/status`, { retries: 2 })
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`)

            const data = await res.json()
            setActionError(null)
            setStatusError(null)

            setTemp(data.Temperature)
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
      }, [API_BASE_HTTP, device])

    React.useEffect(() => {
        const ws = new WebSocket('ws://' + API_BASE)

        ws.onmessage = (event) => {
            const {led, temp} = JSON.parse(event.data)
            
            setTemp(temp)

            if (led === 1) setIsOn(true)
            else setIsOn(false)
        }

        return () => ws.close()
    },[])
    
    React.useEffect(() => {
        getLedStatus()
    }, [getLedStatus])

    return {
        temp,
        isOn,
        isBusy,
        actionError,
        statusError,
        toggleLed
    }
}