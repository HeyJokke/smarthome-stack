import AreaChartComponent from './AreaChart'

export default function SmartGraph({device}) {
    return (
        <>  
            <div className='smartgraph-wrapper'>
                <AreaChartComponent telemetryData={device} />
            </div>
        </>
    )
}