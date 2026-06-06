import React from 'react'
import { fetchWithRetry } from './fetchWithRetry';

export function useEsp32State({ device }) {
    const [isOn, setIsOn] = React.useState(false)
    const [isBusy, setIsBusy] = React.useState(false)
    const [actionError, setActionError] = React.useState(null)
    const [statusError, setStatusError] = React.useState(null)
    const [temp, setTemp] = React.useState(0)
    const [telemetryData, setTelemetryData] = React.useState([])

    // Configurations
    const API_BASE = import.meta.env.VITE_API_BASE ?? ""
    const LOCAL_IP = import.meta.env.VITE_LOCAL_IP ?? "192.168.0.63:3000"

    async function toggleLed() {
        const path = !isOn
        
        try {
            setIsBusy(true)
            setActionError(null)

            const res = await fetchWithRetry(`${API_BASE}/api/devices/${device}/led`, { method: 'PUT', body: { on: path }})

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
            const res = await fetchWithRetry(`${API_BASE}/api/devices/${device}/status`, { retries: 2 })
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
      }, [])

      const getTelemetryData = React.useCallback( async () => {
        try {
            const res = await fetch(`${API_BASE}/api/devices/${device}/telemetry?limit=100`)

            if (!res.ok) {
                throw new Error('fetchTelemetryData: ERROR FAILED TO FETCH')
            } 

            const data = await res.json()

            setTelemetryData(data.payload.reverse())
        } catch(err) {
            console.error(err.message)
        }
      }, [])

    React.useEffect(() => {
        getLedStatus()
        getTelemetryData()
        
        const ws = new WebSocket('ws://' + LOCAL_IP)

        ws.onmessage = (event) => {
            const {id, led, temp} = JSON.parse(event.data)

            if (id === device) {
                setTemp(temp)
    
                if (led === 1) setIsOn(true)
                else setIsOn(false)
    
                getTelemetryData()
            }
        }

        return () => ws.close()
    },[])

    return {
        temp,
        isOn,
        isBusy,
        actionError,
        statusError,
        toggleLed,
        telemetryData
    }
}