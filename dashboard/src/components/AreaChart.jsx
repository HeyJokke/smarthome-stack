'use client'

import React from 'react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function AreaChartComponent() {
    const [telemetryData, setTelemetryData] = React.useState([])

    // Device configurations
    const API_BASE = import.meta.env.VITE_API_BASE ?? ""

    React.useEffect( () => {
        async function fetchTelemetryData() {
            try {
                const res = await fetch(`${API_BASE}/telemetry?limit=10`)

                if (!res.ok) {
                    throw new Error('fetchTelemetryData: ERROR FAILED TO FETCH')
                } 

                const data = await res.json()

                setTelemetryData(data.payload.reverse())
            } catch(err) {
                console.error(err.message)
            }
        }

        fetchTelemetryData()
    },[]) 
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetryData} margin={{ left: -35, right: 5, bottom: 0, top: 15 }}>
                <YAxis type="number" domain={[10,35]} />
                <XAxis dataKey="timestamp_hhmmss" />
                <CartesianGrid />

                <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#00a832"
                    fill="#00a832"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}