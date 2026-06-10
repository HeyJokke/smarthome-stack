import React from 'react'
import { fetchWithRetry } from './fetchWithRetry';

export function useEsp32State({ device }) {
    const [state, setState] = React.useState({id: null, led: null, temp: null, humidity: null, live: null})
    const [actionError, setActionError] = React.useState(null)
    const [isBusy, setIsBusy] = React.useState(false)
    const [telemetryData, setTelemetryData] = React.useState([])

    // Configurations
    const API_BASE = import.meta.env.VITE_API_BASE ?? ""
    const LOCAL_IP = import.meta.env.VITE_LOCAL_IP ?? "192.168.0.63:3000"

    async function toggleLed() {
        const path = !state.led
        
        try {
            setIsBusy(true)
            setActionError(null)

            const res = await fetchWithRetry(`${API_BASE}/api/devices/${device}/led`, { method: 'PUT', body: { on: path }})

            if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
            setState({...state, led: path})
            } catch(err) {
                const message = err?.message ?? 'An unknown error occured'
                setActionError(message)
                console.error('[LED] Toggle failed: ', err)

            } finally {
                setIsBusy(false)
            }
    }

    const getDeviceState = React.useCallback( async () => {
        try {
            const res = await fetch(`${API_BASE}/api/devices/${device}/state`)

            if (!res.ok) {
                throw new Error('getDeviceState: ERROR FAILED TO FETCH')
            }

            const { payload } = await res.json()
            console.log('1', device, payload.live)
            setState({
                    id: payload.id,
                    led: payload.led === 1, 
                    temp: payload.temp, 
                    humidity: payload.humidity,
                    live: payload.live === 1
                })
        } catch(err) {
            console.error(err.message)
        }
    },[] )

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
        getDeviceState()
        getTelemetryData()
        
        const ws = new WebSocket('ws://' + LOCAL_IP)

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.type === 'device_live_update') {
                const matchedDevice = data.devices.find((d) => { d.id === device })
                
                setState((prev) => ({
                    ...prev,
                    live: matchedDevice?.live === 1
                }))
            } else {
                if (data.id === device) {
                    console.log('2', device, data.live)
                    setState({
                        id: data.id,
                        led: data.led === 1, 
                        temp: data.temp, 
                        humidity: data.humidity,
                        live: data.live === 1
                    })
        
                    getTelemetryData()
                }
            }
        }

        return () => ws.close()
    },[])

    React.useEffect(() => {
    console.log('state updated:', state)
}, [state])

    return {
        state,
        isBusy,
        toggleLed,
        actionError,
        telemetryData
    }
}