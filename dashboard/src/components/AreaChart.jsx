'use client'

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function AreaChartComponent({device}) {
    const {telemetryData} = device

    return (
            <AreaChart data={telemetryData} margin={{ left: -35, right: 5, bottom: 0, top: 15 }} height="100%" width="100%">
                <YAxis type="number" domain={[0,100]}/>
                <XAxis dataKey="timestamp_hhmmss" />
                <CartesianGrid />

                <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#00a832"
                    fill="#00a832"
                />
                <Area 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#2d60ac"
                    fill="#2d60ac"
                />
            </AreaChart>
    )
}