'use client'

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function AreaChartComponent({telemetryData}) {
    return (
            <AreaChart data={telemetryData} margin={{ left: -35, right: 5, bottom: 0, top: 15 }} height="100%" width="100%">
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
    )
}