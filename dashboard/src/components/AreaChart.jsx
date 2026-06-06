'use client'

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import React from 'react'

export default function AreaChartComponent({device}) {
    const {telemetryData} = device

    const formatData = telemetryData?.map((ts) => {
                return {...ts, timestamp: new Date(ts.timestamp).toLocaleTimeString(
                    'da-DK', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }
                )}
    })

    if (!formatData || formatData.length === 0) return null

    return (
            <AreaChart data={formatData} margin={{ left: 0, right: 15, bottom: 0, top: 15 }} height="100%" width="100%">
                <YAxis yAxisId="left" width="auto" type="number" domain={[15,30]}/>
                <YAxis yAxisId="right" orientation='right' width="auto" type="number" domain={[10,90]}/>
                <Tooltip 
                    contentStyle={{
                        backgroundColor: "#181A1B"
                    }}
                />
                <XAxis dataKey="timestamp" />
                <CartesianGrid />
                
                <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#2d60ac"
                    fill="#2d60ac"
                />
                <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#00a832"
                    fill="#00a832"
                />
                
            </AreaChart>
    )
}