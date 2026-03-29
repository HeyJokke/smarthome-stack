'use client'

import React from 'react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function AreaChartComponent({telemetryData}) {
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