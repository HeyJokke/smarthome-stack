import AreaChartComponent from './AreaChart'

export default function SmartGraph({telemetryData}) {
    return (
        <>  
            <div className='smartgraph-wrapper'>
                <AreaChartComponent telemetryData={telemetryData} />
            </div>
        </>
    )
}